"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Mascot } from "@/components/brand/mascot";
import { ResumeCard } from "@/components/profile/resume-card";
import { ReviewHistoryItem } from "@/components/profile/review-history-item";
import { UploadResumeDialog } from "@/components/profile/upload-resume-dialog";
import { ResumeItem, ReviewItem, UserProfile } from "@/types";
import styles from "./profile.module.css";

type TabId = "resume" | "roasts" | "favs";

interface FavoriteItem {
  id: string;
  name: string;
  abbr?: string;
  categories?: string[];
}

function computeLevel(reviewCount: number) {
  // 每 3 次锐评升一级，显示下一级进度
  const lv = Math.floor(reviewCount / 3) + 1;
  const progress = ((reviewCount % 3) / 3) * 100;
  const remain = 3 - (reviewCount % 3);
  return { lv, progress, remain };
}

export default function ProfilePage() {
  const [tab, setTab] = useState<TabId>("resume");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/user/profile");
    const json = await res.json();
    if (json.data) setProfile(json.data);
  }, []);

  const loadResumes = useCallback(async () => {
    const res = await fetch("/api/resumes");
    const json = await res.json();
    setResumes(json.data || []);
  }, []);

  const loadReviews = useCallback(async () => {
    const res = await fetch("/api/reviews?pageSize=50");
    const json = await res.json();
    setReviews(json.data || []);
  }, []);

  const loadFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites?pageSize=50");
    const json = await res.json();
    setFavorites(json.data || []);
  }, []);

  useEffect(() => {
    loadProfile();
    loadResumes();
    loadReviews();
    loadFavorites();
  }, [loadProfile, loadResumes, loadReviews, loadFavorites]);

  const handleDeleteResume = async (id: string) => {
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    loadResumes();
    loadProfile();
  };

  const handleDownloadResume = async (id: string) => {
    const res = await fetch(`/api/resumes/${id}/url`);
    const json = await res.json();
    if (json.data?.url) window.open(json.data.url, "_blank");
  };

  const maxScore = useMemo(() => {
    const scores = reviews
      .map((r) => r.score)
      .filter((s): s is number => typeof s === "number");
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [reviews]);

  const resumeCount = profile?.stats.resumeCount ?? 0;
  const reviewCount = profile?.stats.reviewCount ?? 0;
  const favoriteCount = profile?.stats.favoriteCount ?? 0;
  const level = computeLevel(reviewCount);

  const displayName = profile?.name || profile?.email || "加载中…";

  const tabs: Array<{ id: TabId; label: string; emoji: string; count: number }> = [
    { id: "resume", label: "简历库", emoji: "📄", count: resumeCount },
    { id: "roasts", label: "锐评记录", emoji: "🔥", count: reviewCount },
    { id: "favs", label: "收藏夹", emoji: "⭐", count: favoriteCount },
  ];

  return (
    <div className={styles.me}>
      <div className={styles.ph}>
        <div className={styles.phKicker}>· PROFILE · 你的专属毒打档案</div>
        <h1 className={styles.phTitle}>
          个人<em>中心</em>
        </h1>
      </div>

      {/* Profile card */}
      <div className={styles.profile}>
        <div className={styles.ava}>
          <div className={styles.avaBg} />
          <Mascot size={96} mood="cool" />
        </div>

        <div className={styles.info}>
          <div className={styles.row}>
            <h2>{displayName}</h2>
            <span className="sticker flame">毒打 LV.{level.lv}</span>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}><b>{resumeCount}</b><span>份简历</span></div>
            <div className={styles.stat}><b>{reviewCount}</b><span>次锐评</span></div>
            <div className={styles.stat}><b>{favoriteCount}</b><span>个收藏</span></div>
            <div className={styles.stat}><b>{maxScore}</b><span>最高分</span></div>
          </div>
          <div>
            <div className={styles.mbLabel}>距离下一等级</div>
            <div className={styles.mbTrack}>
              <div className={styles.mbFill} style={{ width: `${level.progress}%` }} />
            </div>
            <div className={styles.mbMeta}>再挨 {level.remain} 次骂就能升级</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${tab === t.id ? styles.on : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className={styles.tabEmoji}>{t.emoji}</span>
            <span>{t.label}</span>
            <span className={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {tab === "resume" && (
          <>
            <div className={styles.actions}>
              <UploadResumeDialog onUploaded={() => { loadResumes(); loadProfile(); }} />
              <div className={styles.tip}>💡 PDF / DOCX，建议不超过 10MB</div>
            </div>
            {resumes.length === 0 ? (
              <div className={styles.empty}>
                <Mascot size={96} mood="cry" />
                <div className={styles.emptyTitle}>还没上传任何简历</div>
                <div className={styles.emptySub}>上传一份，AI 才能开始骂。</div>
              </div>
            ) : (
              <div className={styles.list}>
                {resumes.map((r) => (
                  <ResumeCard
                    key={r.id}
                    resume={r}
                    onDelete={handleDeleteResume}
                    onDownload={handleDownloadResume}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "roasts" && (
          <>
            {reviews.length === 0 ? (
              <div className={styles.empty}>
                <Mascot size={96} mood="smug" />
                <div className={styles.emptyTitle}>还没被骂过</div>
                <div className={styles.emptySub}>去 AI 锐评挨第一顿毒打。</div>
              </div>
            ) : (
              <div className={styles.list}>
                {reviews.map((r) => (
                  <ReviewHistoryItem key={r.id} review={r} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "favs" && (
          <>
            {favorites.length === 0 ? (
              <div className={styles.empty}>
                <Mascot size={96} mood="cry" />
                <div className={styles.emptyTitle}>还没收藏任何公司</div>
                <div className={styles.emptySub}>去实习广场看看？挑几家心动的。</div>
              </div>
            ) : (
              <div className={styles.list}>
                {favorites.map((f) => (
                  <div key={f.id} className={styles.favItem}>
                    <div className={styles.favLogo}>{f.abbr || f.name.charAt(0)}</div>
                    <div className={styles.favMain}>
                      <div className={styles.favName}>{f.name}</div>
                      {f.categories && f.categories.length > 0 && (
                        <div className={styles.favCats}>{f.categories.join("、")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
