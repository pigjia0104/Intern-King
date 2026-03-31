import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser();
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, fileType: true, createdAt: true },
    });
    return apiSuccess(resumes);
  } catch {
    return apiError("INTERNAL", "获取简历列表失败", 500);
  }
}
