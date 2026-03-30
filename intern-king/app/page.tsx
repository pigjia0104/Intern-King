import Link from "next/link";
import { Flame, Briefcase, FileSearch, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Briefcase,
    title: "实习广场",
    desc: "一站聚合大厂实习岗位，多维筛选精准匹配",
  },
  {
    icon: FileSearch,
    title: "AI 简历锐评",
    desc: "联网搜索真实面经，毒舌 AI 直击简历硬伤",
  },
  {
    icon: Target,
    title: "精准匹配",
    desc: "基于 JD + 面经双维度分析，告诉你差在哪里",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-flame" />
            <span className="text-lg font-bold">实习小霸王</span>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-flame hover:bg-flame-600">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          不做实习<span className="text-flame">小透明</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          实习岗位一站聚合，AI 毒舌锐评简历硬伤，让你的每次投递都有备而来
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="bg-flame hover:bg-flame-600 text-lg px-8">
            立即开始
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="pt-6">
                <f.icon className="h-10 w-10 text-flame mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
