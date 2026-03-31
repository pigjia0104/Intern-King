"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError("注册失败，请稍后重试");
      setLoading(false);
      return;
    }

    // Empty identities array means the email is already registered
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("该邮箱已注册，请直接登录");
      setLoading(false);
      return;
    }

    // If user is already confirmed (e.g. email confirmation disabled), redirect
    if (data.session) {
      router.push("/jobs");
      router.refresh();
      return;
    }

    // Email confirmation required
    setSuccess("注册成功，请查收验证邮件");
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md border-border/40 bg-card shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" />
            <span className="text-2xl font-bold tracking-tight">实习小霸王</span>
          </div>
          <p className="text-sm text-muted-foreground">创建你的账号</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4">
            <p className="rounded-md bg-green-500/10 px-4 py-3 text-center text-sm text-green-500">
              {success}
            </p>
            <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
              返回登录
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "注册中…" : "注册"}
            </Button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              立即登录
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
