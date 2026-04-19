import Link from "next/link";
import { Mascot, MascotMini } from "@/components/brand/mascot";
import styles from "./landing.module.css";

const features = [
  {
    emoji: "🏟️",
    color: "acid",
    title: "实习广场",
    sub: "40+ 大厂实时岗位",
    line: "字节、拼多、米哈游…谁家在招一眼看穿",
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

const testimonials = [
  {
    name: "@卷心菜学长",
    school: "某 985 计算机",
    text: "被 AI 骂醒，三天改完简历，第二周拿到字节 offer。",
    color: "acid",
  },
  {
    name: "@今天也想躺平",
    school: "大三产品汪",
    text: "毒舌锐评功能把我气笑了，然后认真改了一下午。",
    color: "mint",
  },
  {
    name: "@Emily_设计",
    school: "C9 设计系",
    text: "比找学长看简历还好用，关键是不用欠人情。",
    color: "grape",
  },
  {
    name: "@奋斗鸡崽",
    school: "双非逆袭中",
    text: "终于知道为啥投了 80 份全挂，原来项目描述全是废话。",
    color: "sky",
  },
] as const;

const tickerItems = [
  "🔥 今日新增 12 个大厂实习岗位",
  "🎯 已有 2,847 份简历接受过锐评",
  "💥 平均撕裂度 78 分",
  "🏟️ 覆盖 40+ 家公司",
  '🥲 最毒评价："像是 ChatGPT 写的，还没 ChatGPT 写得好"',
];

export default function LandingPage() {
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
            <span className={styles.dot} /> 已有 2,847 位同学被我骂过
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
              <b>40+</b>
              <span>大厂岗位</span>
            </div>
            <div className={styles.sep} />
            <div>
              <b>2.8k</b>
              <span>被锐评简历</span>
            </div>
            <div className={styles.sep} />
            <div>
              <b>78</b>
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
              key={t.name}
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
