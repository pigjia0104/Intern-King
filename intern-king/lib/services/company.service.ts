import { prisma } from "@/lib/prisma";
import { CompanyFilters } from "@/types";

type CompanyWithFavorites = Awaited<ReturnType<typeof prisma.company.findMany>>[0] & {
  favorites?: { id: string }[];
};

export async function getCompanies(filters: CompanyFilters, userId?: string) {
  const { search, location, category, type, page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.name = { contains: search, mode: "insensitive" as const };
  }
  if (location) where.locations = { has: location };
  if (category) where.categories = { has: category };
  if (type) where.types = { has: type };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: userId
        ? { favorites: { where: { userId }, select: { id: true } } }
        : undefined,
    }),
    prisma.company.count({ where }),
  ]);

  const data = companies.map((company: CompanyWithFavorites) => {
    const { favorites, ...rest } = company;
    return { ...rest, isFavorited: (favorites?.length ?? 0) > 0 };
  });

  return { data, pagination: { page, pageSize, total } };
}

export async function getCompanyById(id: string) {
  return prisma.company.findFirst({ where: { id, isActive: true } });
}
