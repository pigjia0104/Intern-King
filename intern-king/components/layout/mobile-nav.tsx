"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileSearch, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/jobs", label: "实习广场", icon: Briefcase },
  { href: "/review", label: "AI 锐评", icon: FileSearch },
  { href: "/profile", label: "我的", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-flame" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
