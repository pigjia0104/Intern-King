import Link from "next/link";
import { Mascot, MascotMini } from "@/components/brand/mascot";
import { getLandingStats, formatCount } from "@/lib/services/stats.service";
import { getApprovedTestimonials, type Testimonial } from "@/lib/services/testimonial.service";
import styles from "./landing.module.css";

const placeholderTestimonials: Testimonial[] = [
  {
    id: "ph-1",
    name: "@第 1 号挨骂席",
    school: "虚位以待",
    text: "这栏等第一条真评价。先去被骂，再回来填。",
    color: "acid",
  },
  {
    id: "ph-2",
    name: "@候补锐评人",
    school: "排号 001",
    text: "真人吐槽还没到货。可能，它在等你动手。",
    color: "mint",
  },
  {
    id: "ph-3",
    name: "@空卡先生",
    school: "还没挨过",
    text: "看到空卡说明你来早了。规则：先骂后填。",
    color: "grape",
  },
  {
    id: "ph-4",
    name: "@未来毒评",
    school: "内测席位",
    text: "此处预留。投稿要求：得是实话。",
    color: "sky",
  },
];

function mergeWithPlaceholders(real: Testimonial[], target = 4): Testimonial[] {
  if (real.length >= target) return real.slice(0, target);
  const needed = target - real.length;
  const fillers = placeholderTestimonials.slice(0, needed).map((p, i) => ({
    ...p,
    id: `${p.id}-${real.length + i}`,
  }));
  return [...real, ...fillers];
}

function buildTicker(stats: Awaited<ReturnType<typeof getLandingStats>>) {
  const items: string[] = [];
  items.push(
    stats.newCompaniesToday > 0
      ? `🔥 今日新增 ${stats.newCompaniesToday} 个大厂实习岗位`
      : "🔥 大厂岗位持续补充中"
  );
  items.push(`🎯 已有 ${formatCount(stats.reviewCount)} 份简历接受过锐评`);
  if (stats.avgScore !== null) {
    items.push(`💥 平均撕裂度 ${stats.avgScore} 分`);
  }
  items.push(`🏟️ 覆盖 ${stats.companyCount}+ 家公司`);
  items.push('🥲 最毒评价："像是 ChatGPT 写的，还没 ChatGPT 写得好"');
  return items;
}

export default async function LandingPage() {
  const [stats, realTestimonials] = await Promise.all([
    getLandingStats(),
    getApprovedTestimonials(4),
  ]);
  const testimonials = mergeWithPlaceholders(realTestimonials, 4);
  const tickerItems = buildTicker(stats);

  const features = [
    {
      emoji: "🏟️",
      color: "acid",
      title: "实习广场",
      sub: `${stats.companyCount}+ 大厂实时岗位`,
      line: "字节、拼多多、米哈游…谁家在招一眼看穿",
      tag: "#在招",
    },
    {
      emoji: "🔥",
      color: "flame",
      title: "AI 毒舌锐评",
      sub: "把你简历撕得明明白白",
      line: "比你妈还直接。不给鸡汤，只给致命伤。",
      tag: "#撕裂度MAX",
    },
    {
      emoji: "🎯",
      color: "mint",
      title: "精准双匹配",
      sub: "JD × 简历 双维度",
      line: "告诉你哪里差，差多少，要补什么。",
      tag: "#别瞎投",
    },
  ] as const;

  return (
    <div className={styles.landing}>
      {/* Nav */}
      <header className={styles.nav}>
        <div className={styles.navL}>
          <MascotMini size={32} />
          <span className={styles.navBrand}>实习小霸王</span>
          <span className={styles.navBadge}>BETA</span>
        </div>
        <nav className={styles.navC}>
          <a href="#plaza">实习广场</a>
          <a href="#ai">AI 锐评</a>
          <a href="#voice">学长吐槽</a>
        </nav>
        <div className={styles.navR}>
          <Link href="/sign-in" className="ds-btn ghost sm">登录</Link>
          <Link href="/sign-up" className="ds-btn primary sm">
            注册 🔥
          </Link>
        </div>
      </header>

      {/* Ticker */}
      <div className={styles.ticker}>
        <div className="marquee">
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: "flex", gap: 24 }}>
              {tickerItems.map((t, i) => (
                <span key={`${dup}-${i}`} style={{ display: "inline-flex", gap: 24 }}>
                  <span>{t}</span>
                  <span>•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroStickers}>
          <div className={`${styles.sticker} ${styles.s1}`}>求职路上不孤单 ✌️</div>
          <div className={`${styles.sticker} ${styles.s2}`}>被拒 100 次也不怕</div>
          <div className={`${styles.sticker} ${styles.s3}`}>简历终结者</div>
        </div>
        <div className={styles.heroMain}>
          <div className={styles.heroEyebrow}>
            <span className={styles.dot} /> 已有 {formatCount(stats.reviewCount)} 位同学被我骂过
          </div>
          <h1 className={styles.heroTitle}>
            不做
            <br />
            <span className={styles.heroAccent}>实习小透明</span>
            <br />
            <span className={styles.heroSubLine}>做个小霸王。</span>
          </h1>
          <p className={styles.heroDesc}>
            一站聚合大厂实习岗位 · AI 毒舌锐评简历硬伤 · 让你的每一次投递都有备而来。
            <br />
            <span className={styles.heroStrike}>温柔建议</span>
            {" "}我们只说你最不想听、最应该听的那句。
          </p>
          <div className={styles.heroCta}>
            <Link href="/sign-up" className="ds-btn primary xl">
              立即开始 ⚡
            </Link>
            <Link href="/sign-in" className="ds-btn ghost xl">
              已有账号
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div>
              <b>{stats.companyCount}+</b>
              <span>大厂岗位</span>
            </div>
            <div className={styles.sep} />
            <div>
              <b>{formatCount(stats.reviewCount)}</b>
              <span>被锐评简历</span>
            </div>
            <div className={styles.sep} />
            <div>
              <b>{stats.avgScore ?? "—"}</b>
              <span>平均撕裂度</span>
            </div>
          </div>
        </div>
        <div className={styles.heroMascot}>
          <div className={styles.spotlight}>
            <Mascot size={280} mood="cool" className="floaty" />
            <div className={styles.speech}>
              <div>你投的那份简历…</div>
              <div>我看完了。</div>
              <div>
                <b>真的一言难尽。</b>
              </div>
            </div>
            <div className={`${styles.badgeFloat} ${styles.b1}`}>🔥 实时</div>
            <div className={`${styles.badgeFloat} ${styles.b2}`}>🎯 精准</div>
            <div className={`${styles.badgeFloat} ${styles.b3}`}>💥 毒舌</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="plaza">
        <div className={styles.sectionHead}>
          <div className={styles.sectionKicker}>· 我能帮你做什么 ·</div>
          <h2 className={styles.sectionTitle}>
            三板斧，<span className="scribble">一板都不饶。</span>
          </h2>
        </div>
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`${styles.feat} ${styles[`feat_${f.color}`]}`}
              style={{ transform: `rotate(${[-0.8, 0.6, -0.4][i]}deg)` }}
            >
              <div className={styles.featEmoji}>{f.emoji}</div>
              <div className={styles.featTag}>{f.tag}</div>
              <h3>{f.title}</h3>
              <div className={styles.featSub}>{f.sub}</div>
              <p>{f.line}</p>
              <div className={styles.featNum}>0{i + 1}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.wall} id="voice">
        <div className={styles.sectionHead}>
          <div className={styles.sectionKicker}>· 已挨过骂的同学们 ·</div>
          <h2 className={styles.sectionTitle}>
            他们<span className={styles.hi}>被骂之后</span>…
          </h2>
        </div>
        <div className={styles.wallGrid}>
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`${styles.tcard} ${styles[`tc_${t.color}`]}`}
              style={{ transform: `rotate(${[-1, 0.8, -0.6, 1.2][i]}deg)` }}
            >
              <div className={styles.tcQuote}>&ldquo;</div>
              <p>{t.text}</p>
              <div className={styles.tcFoot}>
                <div className={styles.tcAv}>{t.name.slice(1, 2)}</div>
                <div>
                  <div className={styles.tcName}>{t.name}</div>
                  <div className={styles.tcSchool}>{t.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaBig}>
        <div className={styles.ctaInner}>
          <Mascot size={140} mood="smug" className="wiggle" />
          <div>
            <div className={styles.ctaKicker}>还在等什么</div>
            <h2>
              今天就被骂一次。
              <br />
              <span className={styles.hi}>明天开始改简历。</span>
            </h2>
            <div className={styles.ctaActions}>
              <Link href="/sign-up" className="ds-btn primary xl">
                免费注册 · 先骂为敬
              </Link>
              <span className={styles.ctaNote}>* 本站不保证温柔，但保证有用</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.foot}>
        <div className={styles.footL}>
          <MascotMini size={24} />
          <span>实习小霸王 · 让每次投递都有备而来</span>
        </div>
        <div className={styles.footR}>
          <span>© 2026</span>
          <span>·</span>
          <span>intern-king.vercel.app</span>
        </div>
      </footer>
    </div>
  );
}
