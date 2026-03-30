import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { getReviewById } from "@/lib/services/review.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const review = await getReviewById(id, user.id);
    if (!review) return apiError("NOT_FOUND", "锐评记录不存在", 404);

    return apiSuccess(review);
  } catch {
    return apiError("INTERNAL", "获取锐评结果失败", 500);
  }
}
