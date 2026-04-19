"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MascotMini } from "@/components/brand/mascot";
import styles from "./sidebar.module.css";

const navItems = [
  { href: "/jobs", label: "实习广场", icon: PlazaIcon },
  { href: "/review", label: "AI 锐评", icon: AiIcon },
  { href: "/profile", label: "个人中心", icon: UserIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>
        <MascotMini size={36} />
        <div>
          <div className={styles.brandName}>实习小霸王</div>
          <div className={styles.brandSub}>Intern-King · v2.0</div>
        </div>
      </Link>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.on : ""}`}
            >
              <span className={styles.ic}>
                <Icon />
              </span>
              <span className={styles.lb}>{item.label}</span>
              {isActive && <span className={styles.dot} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.quote}>
        <div className={styles.quoteHead}>今日锐语</div>
        <div className={styles.quoteBody}>
          &ldquo;海投 100 家不如精投 10 家，前提是你简历能打。&rdquo;
        </div>
        <div className={styles.quoteFoot}>— 小霸王</div>
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.mini}
          onClick={handleLogout}
          title="退出登录"
          aria-label="退出登录"
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}

function PlazaIcon() {
  const p = { fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" {...p} />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...p} />
      <path d="M3 13h18" {...p} />
    </svg>
  );
}

function AiIcon() {
  const p = { fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" {...p} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M9 15c1 .8 2 1.2 3 1.2s2-.4 3-1.2" {...p} />
    </svg>
  );
}

function UserIcon() {
  const p = { fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="8" r="4" {...p} />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" {...p} />
    </svg>
  );
}

function LogoutIcon() {
  const p = { fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14 4h5v16h-5" {...p} />
      <path d="M10 8 6 12l4 4" {...p} />
      <path d="M6 12h12" {...p} />
    </svg>
  );
}
