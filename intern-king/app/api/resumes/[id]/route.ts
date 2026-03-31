import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
    if (!resume) return apiError("NOT_FOUND", "简历不存在", 404);
    await deleteFile(resume.fileUrl);
    await prisma.resume.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch {
    return apiError("INTERNAL", "删除失败", 500);
  }
}
