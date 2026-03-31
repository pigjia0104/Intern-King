import { NextRequest } from "next/server";
import { getJobById } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getJobById(id);
    if (!job) return apiError("NOT_FOUND", "岗位不存在", 404);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "获取岗位详情失败", 500);
  }
}
