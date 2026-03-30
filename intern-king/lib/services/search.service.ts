import { chatCompletion, parseJsonResponse } from "@/lib/ai/deepseek";
import { buildRelevanceFilterPrompt } from "@/lib/ai/prompts";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY!;
const MAX_CONTEXT_LENGTH = 4000;

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!response.ok) return [];
  const data: TavilyResponse = await response.json();
  return data.results || [];
}

function generateQueries(company: string, title: string, category: string): string[] {
  return [
    `${company} ${title} 实习面经`,
    `${company} ${category} 实习面试经验`,
    `${title} 实习面经 面试题`,
  ];
}

export async function searchAndFilterExperiences(job: {
  company: string;
  title: string;
  type: string;
  category: string;
}): Promise<string> {
  // Step 2: Search with 3 queries in parallel
  const queries = generateQueries(job.company, job.title, job.category);
  const results = await Promise.allSettled(queries.map(tavilySearch));

  // Collect successful results, deduplicate by URL
  const urlSet = new Set<string>();
  const candidates: Array<{ index: number; title: string; url: string; snippet: string }> = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (!urlSet.has(item.url)) {
          urlSet.add(item.url);
          candidates.push({
            index: candidates.length + 1,
            title: item.title,
            url: item.url,
            snippet: item.content.slice(0, 300),
          });
        }
      }
    }
  }

  // No results at all — return empty
  if (candidates.length === 0) return "";

  // Step 2.5: Relevance filtering via DeepSeek
  try {
    const prompt = buildRelevanceFilterPrompt(job, candidates);
    const raw = await chatCompletion(
      [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      { temperature: 0.1, maxTokens: 1024 }
    );

    const scores = parseJsonResponse<Array<{ index: number; score: number; reason: string }>>(raw);

    // Keep score >= 3, take top 5
    const relevant = scores
      .filter((s) => s.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (relevant.length === 0) return "";

    // Build context string from relevant candidates
    const contextParts = relevant.map((r) => {
      const c = candidates.find((c) => c.index === r.index);
      if (!c) return "";
      return `【${c.title}】(${c.url})\n${c.snippet}`;
    });

    const context = contextParts.join("\n\n---\n\n");
    return context.slice(0, MAX_CONTEXT_LENGTH);
  } catch {
    // If filtering fails, use raw top 5
    const fallback = candidates
      .slice(0, 5)
      .map((c) => `【${c.title}】(${c.url})\n${c.snippet}`)
      .join("\n\n---\n\n");
    return fallback.slice(0, MAX_CONTEXT_LENGTH);
  }
}
