import { prisma } from "@/lib/prisma";
import { JobFilters } from "@/types";

export async function getJobs(filters: JobFilters, userId?: string) {
  const { search, location, type, category, page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { company: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ];
  }
  if (location) where.location = { contains: location };
  if (type) where.type = type;
  if (category) where.category = category;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: userId
        ? { favorites: { where: { userId }, select: { id: true } } }
        : undefined,
    }),
    prisma.job.count({ where }),
  ]);

  const data = jobs.map((job) => {
    const { favorites, ...rest } = job as typeof job & { favorites?: { id: string }[] };
    return { ...rest, isFavorited: (favorites?.length ?? 0) > 0 };
  });

  return { data, pagination: { page, pageSize, total } };
}

export async function getJobById(id: string) {
  return prisma.job.findFirst({ where: { id, isActive: true } });
}

export async function createJob(data: {
  company: string;
  title: string;
  type: string;
  location: string;
  category: string;
  description: string;
  applyUrl?: string;
}) {
  return prisma.job.create({ data: { ...data, publishedAt: new Date() } });
}

export async function updateJob(
  id: string,
  data: Partial<{
    company: string;
    title: string;
    type: string;
    location: string;
    category: string;
    description: string;
    applyUrl: string;
  }>
) {
  return prisma.job.update({ where: { id }, data });
}

export async function toggleJobActive(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return null;
  return prisma.job.update({ where: { id }, data: { isActive: !job.isActive } });
}
