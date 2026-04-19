"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/brand/mascot";
import { ReviewResult, ReviewDetail } from "@/types";
import styles from "@/app/(main)/review/review.module.css";

interface Props {
  result: ReviewResult;
  detail?: ReviewDetail | null;
  onRetry?: () => void;
}

const severityMap = {
  critical: { emoji: "🗡️", label: "严重", cls: "critical" as const },
  warning: { emoji: "🔧", label: "注意", cls: "warning" as const },
  info: { emoji: "💡", label: "建议", cls: "info" as const },
};

function scoreColor(score: number) {
  if (score < 60) return "var(--poison)";
  if (score < 80) return "var(--caution)";
  return "var(--chill)";
}

function scoreMood(score: number): "cry" | "smug" | "cool" {
  if (score < 60) return "cry";
  if (score < 80) return "smug";
  return "cool";
}

function scoreBubble(score: number) {
  if (score < 60) return "改完再来。";
  if (score < 80) return "有救，但得改。";
  return "这份稳了。";
}

export function ReviewResultDisplay({ result, detail, onRetry }: Props) {
  const [count, setCount] = useState(0);
  const score = result.score;

  useEffect(() => {
    let frame: number;
    const t0 = performance.now();
    const loop = () => {
      const p = Math.min(1, (performance.now() - t0) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * score));
      if (p < 1) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const coAbbr = detail?.company ? detail.company.charAt(0) : "锐";
  const coTitle = detail
    ? `${detail.company}${detail.position ? ` · ${detail.position}` : ""}`
    : "锐评结果";
  const coTime = detail?.createdAt
    ? `分析完成于 ${new Date(detail.createdAt).toLocaleDateString("zh-CN")}`
    : "";

  return (
    <div className={styles.rr}>
      {/* Hero with score + summary + mascot */}
      <div className={styles.hero}>
        <div className={styles.scoreWrap}>
          <div
            className={styles.scoreRing}
            style={{ "--p": count, "--scoreColor": scoreColor(score) } as React.CSSProperties}
          >
            <div className={styles.scoreInner}>
              <div className={styles.scoreNum}>{count}</div>
              <div className={styles.scoreUnit}>/100 分</div>
            </div>
          </div>
          <div className={styles.scoreBadge}>💥 撕裂度</div>
        </div>

        <div>
          <div className={styles.co}>
            <div className={styles.coIcon}>{coAbbr}</div>
            <div>
              <div className={styles.coName}>{coTitle}</div>
              {coTime && <div className={styles.coTime}>{coTime}</div>}
            </div>
          </div>
          <div className={styles.sumCard}>
            <div className={styles.sumKicker}>🎤 一句话点评</div>
            <div className={styles.sumQuote}>&ldquo;{result.summary}&rdquo;</div>
            <div className={styles.sumTag}>— AI 锐评官 · 小霸王</div>
          </div>
        </div>

        <div className={styles.heroMascot}>
          <Mascot size={120} mood={scoreMood(score)} />
          <div className={styles.bubble}>{scoreBubble(score)}</div>
        </div>
      </div>

      {/* Issues */}
      {result.roasts.length > 0 && (
        <>
          <div className={styles.issuesHead}>
            <h2>⚠️ 毒舌锐评</h2>
            <div className={styles.issuesCount}>
              共 <b>{result.roasts.length}</b> 处硬伤
            </div>
          </div>
          {result.roasts.map((roast, i) => {
            const cfg = severityMap[roast.severity] || severityMap.info;
            return (
              <div key={i} className={`${styles.iss} ${styles[cfg.cls]}`}>
                <div className={styles.issTag}>
                  <span className={styles.issEmoji}>{cfg.emoji}</span>
                  <span className={styles.issLevel}>{cfg.label}</span>
                  <span className={styles.issNum}>#{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className={styles.issBody}>
                  <h4>{roast.point}</h4>
                  <p>{roast.detail}</p>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className={styles.card2}>
          <h3 className={styles.card2Title}>💡 小霸王建议</h3>
          {result.suggestions.map((s, i) => (
            <div key={i} className={styles.sugItem}>
              <b>{s.title}</b>
              <span>{s.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* Interview Questions */}
      {result.interviewQuestions.length > 0 && (
        <div className={styles.card2}>
          <h3 className={styles.card2Title}>🎤 高频面试题</h3>
          <ol className={styles.qList}>
            {result.interviewQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Sources */}
      {result.sourcesUsed && result.sourcesUsed !== "无" && (
        <div className={styles.sources}>📚 面经来源：{result.sourcesUsed}</div>
      )}

      {/* CTA */}
      <div className={styles.cta}>
        <Mascot size={72} mood="fire" className="wiggle" />
        <div>
          <h3>感觉如何？</h3>
          <p>建议：去散个步，改简历，下周再来挨一次。</p>
        </div>
        <div className={styles.ctaActions}>
          {onRetry && (
            <button type="button" className="ds-btn ghost" onClick={onRetry}>
              再骂一次
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
