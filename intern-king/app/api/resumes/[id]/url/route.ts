import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
    if (!resume) return apiError("NOT_FOUND", "简历不存在", 404);
    const url = await getSignedUrl(resume.fileUrl);
    return apiSuccess({ url });
  } catch {
    return apiError("INTERNAL", "获取下载链接失败", 500);
  }
}
