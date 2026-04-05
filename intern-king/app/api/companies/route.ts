import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { getCompanies } from "@/lib/services/company.service";
import { apiList, apiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const params = req.nextUrl.searchParams;

    const filters = {
      search: params.get("search") || undefined,
      location: params.get("location") || undefined,
      category: params.get("category") || undefined,
      type: params.get("type") || undefined,
      page: Number(params.get("page")) || 1,
      pageSize: Math.min(Number(params.get("pageSize")) || 20, 100),
    };

    const result = await getCompanies(filters, user?.id);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取公司列表失败", 500);
  }
}
