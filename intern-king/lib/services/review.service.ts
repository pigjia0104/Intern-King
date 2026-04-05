import { prisma } from "@/lib/prisma";
import { getResumeText } from "@/lib/services/resume.service";
import { searchAndFilterExperiences } from "@/lib/services/search.service";
import { chatCompletion, parseJsonResponse } from "@/lib/ai/deepseek";
import { buildReviewPrompt } from "@/lib/ai/prompts";
import { ReviewResult } from "@/types";

const STALE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export async function checkConcurrencyLock(userId: string): Promise<boolean> {
  // Clean up stale processing reviews first
  await prisma.review.updateMany({
    where: {
      userId,
      status: { in: ["pending", "processing"] },
      createdAt: { lt: new Date(Date.now() - STALE_TIMEOUT_MS) },
    },
    data: { status: "failed", errorMessage: "处理超时，请重新提交" },
  });

  const active = await prisma.review.findFirst({
    where: {
      userId,
      status: { in: ["pending", "processing"] },
    },
  });

  return active !== null;
}

export async function createReview(
  userId: string,
  data: {
    company: string;
    position: string;
    jobDescription: string;
    resumeId: string;
    category?: string;
    type?: string;
  }
) {
  // Validate resume exists
  const resume = await prisma.resume.findFirst({
    where: { id: data.resumeId, userId },
  });

  if (!resume) throw new Error("RESUME_NOT_FOUND");

  return prisma.review.create({
    data: {
      userId,
      resumeId: data.resumeId,
      company: data.company,
      position: data.position,
      jobDescription: data.jobDescription,
      category: data.category,
      type: data.type,
      status: "pending",
    },
  });
}

export async function processReview(reviewId: string): Promise<void> {
  try {
    // Mark as processing
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "processing" },
    });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { resume: true },
    });
    if (!review) throw new Error("Review not found");

    // Step 1: Parse resume
    let resumeText: string;
    try {
      resumeText = await getResumeText(review.resumeId);
    } catch (e) {
      console.error("[Resume Parse Error]", e);
      throw new Error("简历格式无法识别，请上传标准 PDF/Word");
    }

    // Step 2 + 2.5: Search + filter interview experiences
    const searchContext = await searchAndFilterExperiences({
      company: review.company,
      title: review.position,
      type: review.type || '',
      category: review.category || '',
    });

    // Save search context for traceability
    await prisma.review.update({
      where: { id: reviewId },
      data: { searchContext: searchContext || null },
    });

    // Step 3: Build prompt and call DeepSeek
    const prompt = buildReviewPrompt(
      {
        company: review.company,
        title: review.position,
        type: review.type || '',
        location: '',
        description: review.jobDescription,
      },
      searchContext,
      resumeText
    );

    let result: ReviewResult | undefined;
    let retries = 0;

    while (retries < 2) {
      try {
        const raw = await chatCompletion(
          [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          { temperature: 0.7, maxTokens: 4096 }
        );
        result = parseJsonResponse<ReviewResult>(raw);
        break;
      } catch (e) {
        console.error(`[DeepSeek Error] attempt ${retries + 1}:`, e);
        retries++;
        if (retries >= 2) throw new Error("AI 生成异常，请重试");
      }
    }

    // Step 4: Save result
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: "completed",
        score: result!.score,
        content: JSON.stringify(result!),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "failed", errorMessage: message },
    });
  }
}

export async function getReviewById(id: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: { id, userId },
    include: {
      resume: { select: { fileName: true } },
    },
  });

  if (!review) return null;

  return {
    id: review.id,
    status: review.status,
    score: review.score,
    content: review.content ? JSON.parse(review.content) : null,
    errorMessage: review.errorMessage,
    createdAt: review.createdAt.toISOString(),
    company: review.company,
    position: review.position,
    resume: review.resume,
  };
}

export async function getReviewList(
  userId: string,
  page = 1,
  pageSize = 20
) {
  const where: Record<string, unknown> = { userId };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        resume: { select: { fileName: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  const data = reviews.map((r) => ({
    id: r.id,
    status: r.status,
    score: r.score,
    company: r.company,
    position: r.position,
    resumeFileName: r.resume.fileName,
    createdAt: r.createdAt.toISOString(),
  }));

  return { data, pagination: { page, pageSize, total } };
}
