import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { removeFavorite } from "@/lib/services/favorite.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const user = await requireUser();
    const { companyId } = await params;
    await removeFavorite(user.id, companyId);
    return apiSuccess({ success: true });
  } catch {
    return apiError("INTERNAL", "取消收藏失败", 500);
  }
}
