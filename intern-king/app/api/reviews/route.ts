import { NextRequest } from "next/server";
import { after } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import {
  checkConcurrencyLock,
  createReview,
  processReview,
  getReviewList,
} from "@/lib/services/review.service";
import { apiSuccess, apiList, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { company, position, jobDescription, resumeId, category, type } = await req.json();

    if (!company || !position || !jobDescription || !resumeId) {
      return apiError("VALIDATION", "缺少必要参数", 400);
    }

    // Concurrency lock check
    const isLocked = await checkConcurrencyLock(user.id);
    if (isLocked) {
      return apiError("CONFLICT", "有简历正在锐评中，请等待完成", 409);
    }

    const review = await createReview(user.id, {
      company, position, jobDescription, resumeId,
      category: category || undefined,
      type: type || undefined,
    });

    // Trigger background processing via next/after
    after(async () => {
      await processReview(review.id);
    });

    return apiSuccess({ reviewId: review.id }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "创建锐评失败";
    if (message === "RESUME_NOT_FOUND") return apiError("NOT_FOUND", "简历不存在", 404);
    return apiError("INTERNAL", message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const params = req.nextUrl.searchParams;

    const page = Number(params.get("page")) || 1;
    const pageSize = Math.min(Number(params.get("pageSize")) || 20, 100);

    const result = await getReviewList(user.id, page, pageSize);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取锐评列表失败", 500);
  }
}
