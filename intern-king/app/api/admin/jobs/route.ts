import { NextRequest } from "next/server";
import { createJob } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const body = await req.json();
    const { company, title, type, location, category, description, applyUrl } = body;

    if (!company || !title || !type || !location || !category || !description) {
      return apiError("VALIDATION", "缺少必填字段", 400);
    }

    const job = await createJob({ company, title, type, location, category, description, applyUrl });
    return apiSuccess(job, 201);
  } catch {
    return apiError("INTERNAL", "创建岗位失败", 500);
  }
}
