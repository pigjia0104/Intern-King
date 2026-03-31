import { prisma } from "@/lib/prisma";

export async function getFavorites(userId: string, page = 1, pageSize = 20) {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        job: {
          select: {
            id: true, company: true, title: true,
            type: true, location: true, category: true,
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);
  return {
    data: favorites.map((f) => ({ ...f.job, favoritedAt: f.createdAt })),
    pagination: { page, pageSize, total },
  };
}

export async function addFavorite(userId: string, jobId: string) {
  return prisma.favorite.create({ data: { userId, jobId } });
}

export async function removeFavorite(userId: string, jobId: string) {
  return prisma.favorite.deleteMany({ where: { userId, jobId } });
}
