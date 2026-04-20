import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface Testimonial {
  id: string;
  name: string;
  school: string;
  text: string;
  color: string;
}

async function fetchApprovedTestimonials(limit: number): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    school: r.school,
    text: r.text,
    color: r.color,
  }));
}

export const getApprovedTestimonials = unstable_cache(
  fetchApprovedTestimonials,
  ["approved-testimonials"],
  { revalidate: 600, tags: ["approved-testimonials"] }
);
