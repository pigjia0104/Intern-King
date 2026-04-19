"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewInput } from "@/components/review/review-input";
import { ReviewResultDisplay } from "@/components/review/review-result";
import { ReviewDetail } from "@/types";
import styles from "./review.module.css";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");
  const prefillCompany = searchParams.get("company") || "";

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
          if (json.data) setReviewData(json.data);
        });
    }
  }, [reviewId]);

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

  const handleRetry = () => {
    setReviewData(null);
    setError("");
    setIsProcessing(false);
  };

  const showingResult =
    reviewData?.status === "completed" && reviewData.content;

  return (
    <div className={styles.roast}>
      <div className={styles.ph}>
        <div>
          <div className={styles.phKicker}>· AI ROAST · 准备好被骂，比被哄更有用</div>
          <h1 className={styles.phTitle}>
            AI <em>锐评</em>
          </h1>
        </div>
        {showingResult && (
          <div className={styles.phActions}>
            <button type="button" className="ds-btn ghost sm" onClick={handleRetry}>
              ← 再来一次
            </button>
          </div>
        )}
      </div>

      {showingResult ? (
        <ReviewResultDisplay
          result={reviewData.content!}
          detail={reviewData}
          onRetry={handleRetry}
        />
      ) : (
        <div className={styles.grid}>
          <div>
            {error && !isProcessing && (
              <div className={styles.errorBlock}>{error}</div>
            )}
            {isProcessing ? (
              <div className={styles.processing}>
                <div className={styles.spin} style={{ borderColor: "rgba(0,0,0,0.15)", borderTopColor: "var(--flame)" }} />
                <h3>AI 正在疯狂吐槽你的简历…</h3>
                <p>联网搜索面经 → 相关度筛选 → 生成锐评</p>
              </div>
            ) : (
              <ReviewInput
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                prefillCompany={prefillCompany}
              />
            )}

            <div className={styles.fine}>
              <span>🫡</span>
              <div>
                本站 AI 仅代表 AI 个人观点，不代表宇宙真理。
                <br />
                如果被骂破防，建议去散个步、改简历、再回来挨下一顿。
              </div>
            </div>
          </div>

          <aside className={styles.side}>
            <div className={`${styles.tip} ${styles.tipAcid}`}>
              <div className={styles.tipTitle}>🔪 会被骂什么</div>
              <ul>
                <li>项目描述 <b>废话多 / 没量化</b></li>
                <li>技术栈 <b>对不上 JD</b></li>
                <li>实习经历 <b>像流水账</b></li>
                <li>自我评价 <b>ChatGPT 味太重</b></li>
              </ul>
            </div>
            <div className={`${styles.tip} ${styles.tipMint}`}>
              <div className={styles.tipTitle}>🛡️ 会得到什么</div>
              <ul>
                <li>一个 <b>撕裂度评分</b>（0-100）</li>
                <li>每条硬伤 <b>具体位置 + 建议</b></li>
                <li>JD 匹配度 <b>维度拆解</b></li>
                <li>一份带伤的 <b>自信心</b></li>
              </ul>
            </div>
            <div className={`${styles.tip} ${styles.tipGrape}`}>
              <div className={styles.tipTitle}>🧠 锐评语气</div>
              <div className={styles.tipSlider}>
                <span>温柔</span>
                <div className={styles.tsr}>
                  <div className={styles.tsrDot} style={{ left: "80%" }} />
                </div>
                <span className={styles.bold}>毒辣</span>
              </div>
              <div className={styles.tipNote}>（默认最毒，因为温柔没用）</div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center", color: "var(--ink-dim)" }}>加载中…</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
