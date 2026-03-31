import { NextRequest } from "next/server";
import { toggleJobActive } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const { id } = await params;
    const job = await toggleJobActive(id);
    if (!job) return apiError("NOT_FOUND", "岗位不存在", 404);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "操作失败", 500);
  }
}
