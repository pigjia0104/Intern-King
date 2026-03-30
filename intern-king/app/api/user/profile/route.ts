import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser();

    const [resumeCount, reviewCount, favoriteCount] = await Promise.all([
      prisma.resume.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.favorite.count({ where: { userId: user.id } }),
    ]);

    return apiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      stats: { resumeCount, reviewCount, favoriteCount },
    });
  } catch {
    return apiError("INTERNAL", "获取用户信息失败", 500);
  }
}
