import Link from "next/link";
import { ReviewItem } from "@/types";
import styles from "@/app/(main)/profile/profile.module.css";

interface Props {
  review: ReviewItem;
}

const statusMap: Record<string, { label: string; cls: "flame" | "mint" | "ghost" | "rose" }> = {
  completed: { label: "已完成", cls: "mint" },
  processing: { label: "处理中", cls: "flame" },
  pending: { label: "排队中", cls: "ghost" },
  failed: { label: "失败", cls: "rose" },
};

function scoreColor(score: number | null) {
  if (score === null) return "var(--ink-dim)";
  if (score < 60) return "var(--poison)";
  if (score < 80) return "var(--caution)";
  return "var(--chill)";
}

export function ReviewHistoryItem({ review }: Props) {
  const status = statusMap[review.status] || statusMap.pending;
  const date = new Date(review.createdAt).toLocaleDateString("zh-CN");
  const color = scoreColor(review.score);

  return (
    <Link href={`/review?reviewId=${review.id}`} className={styles.item}>
      <div className={styles.riScore}>
        {review.score !== null ? (
          <>
            <div className={styles.riScoreNum} style={{ color }}>{review.score}</div>
            <div className={styles.riScoreBar}>
              <div
                className={styles.riScoreFill}
                style={{ width: `${review.score}%`, background: color }}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.riScoreNum} style={{ color }}>--</div>
            <div className={styles.riScoreBar}>
              <div className={styles.riScoreFill} style={{ width: "0%" }} />
            </div>
          </>
        )}
      </div>

      <div className={styles.itemMain}>
        <div className={styles.itemTitle}>
          {review.company} · {review.position}
          <span className={`sticker ${status.cls}`}>{status.label}</span>
        </div>
        <div className={styles.itemMeta}>
          <span>📄 {review.resumeFileName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
