"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewInput } from "@/components/review/review-input";
import { ReviewResultDisplay } from "@/components/review/review-result";
import { ReviewDetail } from "@/types";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");

  const [reviewData, setReviewData] = useState<ReviewDetail | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Load existing review (from history)
  useEffect(() => {
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            setReviewData(json.data);
          }
        });
    }
  }, [reviewId]);

  // Polling logic
  const pollReview = useCallback((id: string) => {
    pollTimer.current = setInterval(async () => {
      pollCount.current++;

      if (pollCount.current > MAX_POLLS) {
        clearInterval(pollTimer.current);
        setIsProcessing(false);
        setError("处理超时，请刷新页面查看结果");
        return;
      }

      const res = await fetch(`/api/reviews/${id}`);
      const json = await res.json();
      const review = json.data as ReviewDetail;

      if (review.status === "completed" || review.status === "failed") {
        clearInterval(pollTimer.current);
        setIsProcessing(false);
        setReviewData(review);
        if (review.status === "failed") {
          setError(review.errorMessage || "锐评失败，请重试");
        }
      }
    }, POLL_INTERVAL);
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const handleSubmit = async (data: { company: string; position: string; jobDescription: string; resumeId: string; category?: string; type?: string }) => {
    setError("");
    setReviewData(null);
    setIsProcessing(true);
    pollCount.current = 0;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setIsProcessing(false);
        setError(json.error?.message || "提交失败");
        return;
      }

      pollReview(json.data.reviewId);
    } catch {
      setIsProcessing(false);
      setError("网络错误，请重试");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        AI <span className="text-flame">锐评</span>
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <div>
          <ReviewInput onSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>

        {/* Right: Result Panel */}
        <div>
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-flame mb-4" />
              <p className="text-lg font-medium">AI 正在疯狂吐槽你的简历...</p>
              <p className="text-sm mt-2">联网搜索面经 → 相关度筛选 → 生成锐评</p>
            </div>
          )}

          {error && !isProcessing && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {reviewData?.status === "completed" && reviewData.content && (
            <ReviewResultDisplay result={reviewData.content} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">加载中...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
