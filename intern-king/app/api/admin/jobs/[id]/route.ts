import { NextRequest } from "next/server";
import { updateJob } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const { id } = await params;
    const body = await req.json();
    const job = await updateJob(id, body);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "更新岗位失败", 500);
  }
}
