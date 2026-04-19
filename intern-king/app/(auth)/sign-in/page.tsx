"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mascot } from "@/components/brand/mascot";
import styles from "../auth.module.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("邮箱或密码错误，请重试");
      setLoading(false);
      return;
    }

    router.push("/jobs");
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <Link href="/" className={styles.back}>
        <ChevronIcon /> 回首页
      </Link>

      <div className={styles.mascot}>
        <Mascot size={80} mood="cool" />
      </div>

      <h1 className={styles.title}>回来啦？</h1>
      <p className={styles.sub}>继续被骂，继续变强。</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="email" className="ds-label">邮箱</label>
          <input
            id="email"
            type="email"
            placeholder="you@school.edu.cn"
            className="ds-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="ds-label">密码</label>
          <input
            id="password"
            type="password"
            placeholder="输入密码"
            className="ds-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <div className={styles.err}>{error}</div>}

        <button
          type="submit"
          className={`ds-btn primary lg ${styles.submit}`}
          disabled={loading}
        >
          {loading ? "登录中…" : (<>登录 · 继续被骂 <FlameIcon /></>)}
        </button>
      </form>

      <div className={styles.alt}>
        还没账号？
        <Link href="/sign-up">立即注册</Link>
      </div>
      <div className={styles.fine}>
        登录即表示你同意被本站 AI <b>温和地撕碎</b>你的简历。
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
