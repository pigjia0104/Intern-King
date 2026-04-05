import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ReviewItem } from "@/types";

interface Props {
  review: ReviewItem;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "已完成", variant: "default" },
  processing: { label: "处理中", variant: "secondary" },
  pending: { label: "排队中", variant: "outline" },
  failed: { label: "失败", variant: "destructive" },
};

export function ReviewHistoryItem({ review }: Props) {
  const status = statusConfig[review.status] || statusConfig.pending;

  return (
    <Link
      href={`/review?reviewId=${review.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      {/* Score badge */}
      {review.score !== null ? (
        <div className="h-12 w-12 rounded-full bg-flame/10 flex items-center justify-center">
          <span className="text-lg font-bold text-flame">{review.score}</span>
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">--</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {review.company} · {review.position}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {review.resumeFileName} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}
        </p>
      </div>

      <Badge variant={status.variant}>{status.label}</Badge>
    </Link>
  );
}
