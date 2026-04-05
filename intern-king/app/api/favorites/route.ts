import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { getFavorites, addFavorite } from "@/lib/services/favorite.service";
import { apiList, apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const params = req.nextUrl.searchParams;
    const page = Number(params.get("page")) || 1;
    const pageSize = Math.min(Number(params.get("pageSize")) || 20, 100);
    const result = await getFavorites(user.id, page, pageSize);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取收藏列表失败", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { companyId } = await req.json();
    if (!companyId) return apiError("VALIDATION", "缺少 companyId", 400);
    const favorite = await addFavorite(user.id, companyId);
    return apiSuccess(favorite, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return apiError("CONFLICT", "已收藏该公司", 409);
    }
    return apiError("INTERNAL", "收藏失败", 500);
  }
}
