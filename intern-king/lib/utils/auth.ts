import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  if (!authUser.email) return null;

  // Read first, upsert only on first access
  let user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });

  if (!user) {
    user = await prisma.user.upsert({
      where: { authId: authUser.id },
      update: { email: authUser.email },
      create: {
        authId: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || null,
        avatarUrl: authUser.user_metadata?.avatar_url || null,
      },
    });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}
