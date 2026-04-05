import { prisma } from "@/lib/prisma";

export async function getFavorites(userId: string, page = 1, pageSize = 20) {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: {
          select: {
            id: true, name: true, abbr: true,
            categories: true, locations: true, types: true, careerUrl: true,
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);
  return {
    data: favorites.map((f) => ({ ...f.company, favoritedAt: f.createdAt })),
    pagination: { page, pageSize, total },
  };
}

export async function addFavorite(userId: string, companyId: string) {
  return prisma.favorite.create({ data: { userId, companyId } });
}

export async function removeFavorite(userId: string, companyId: string) {
  return prisma.favorite.deleteMany({ where: { userId, companyId } });
}
