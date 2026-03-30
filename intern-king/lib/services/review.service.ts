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

export async function createReview(userId: string, jobId: string, resumeId: string) {
  // Validate job and resume exist
  const [job, resume] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.resume.findFirst({ where: { id: resumeId, userId } }),
  ]);

  if (!job) throw new Error("JOB_NOT_FOUND");
  if (!resume) throw new Error("RESUME_NOT_FOUND");

  return prisma.review.create({
    data: { userId, jobId, resumeId, status: "pending" },
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
      include: { job: true, resume: true },
    });
    if (!review) throw new Error("Review not found");

    // Step 1: Parse resume
    let resumeText: string;
    try {
      resumeText = await getResumeText(review.resumeId);
    } catch {
      throw new Error("简历格式无法识别，请上传标准 PDF/Word");
    }

    // Step 2 + 2.5: Search + filter interview experiences
    const searchContext = await searchAndFilterExperiences({
      company: review.job.company,
      title: review.job.title,
      type: review.job.type,
      category: review.job.category,
    });

    // Save search context for traceability
    await prisma.review.update({
      where: { id: reviewId },
      data: { searchContext: searchContext || null },
    });

    // Step 3: Build prompt and call DeepSeek
    const prompt = buildReviewPrompt(
      {
        company: review.job.company,
        title: review.job.title,
        type: review.job.type,
        location: review.job.location,
        description: review.job.description,
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
      } catch {
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
      job: { select: { company: true, title: true, type: true, location: true } },
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
    job: review.job,
    resume: review.resume,
  };
}

export async function getReviewList(
  userId: string,
  page = 1,
  pageSize = 20,
  jobId?: string
) {
  const where: Record<string, unknown> = { userId };
  if (jobId) where.jobId = jobId;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        job: { select: { company: true, title: true } },
        resume: { select: { fileName: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  const data = reviews.map((r) => ({
    id: r.id,
    status: r.status,
    score: r.score,
    jobTitle: r.job.title,
    jobCompany: r.job.company,
    resumeFileName: r.resume.fileName,
    createdAt: r.createdAt.toISOString(),
  }));

  return { data, pagination: { page, pageSize, total } };
}
