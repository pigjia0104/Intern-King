import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface LandingStats {
  companyCount: number;
  reviewCount: number;
  avgScore: number | null;
  newCompaniesToday: number;
}

async function fetchLandingStats(): Promise<LandingStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [companyCount, reviewCount, avgAgg, newCompaniesToday] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.review.count({ where: { status: "completed" } }),
    prisma.review.aggregate({
      _avg: { score: true },
      where: { status: "completed", score: { not: null } },
    }),
    prisma.company.count({ where: { createdAt: { gte: startOfToday } } }),
  ]);

  return {
    companyCount,
    reviewCount,
    avgScore: avgAgg._avg.score !== null ? Math.round(avgAgg._avg.score) : null,
    newCompaniesToday,
  };
}

export const getLandingStats = unstable_cache(
  fetchLandingStats,
  ["landing-stats"],
  { revalidate: 600, tags: ["landing-stats"] }
);

export function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}w`;
}
