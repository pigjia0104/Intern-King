"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResumeCard } from "@/components/profile/resume-card";
import { ReviewHistoryItem } from "@/components/profile/review-history-item";
import { UploadResumeDialog } from "@/components/profile/upload-resume-dialog";
import { ResumeItem, ReviewItem, UserProfile } from "@/types";
import { FileText, Star, FileSearch } from "lucide-react";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [favorites, setFavorites] = useState<Array<{ id: string; company: string; title: string }>>([]);

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

  return (
    <div>
      {/* User Card */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clerkUser?.imageUrl} />
            <AvatarFallback className="bg-flame/10 text-flame text-lg">
              {profile?.name?.[0] || profile?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || profile?.email}</h2>
            <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {profile?.stats.resumeCount || 0} 份简历
              </span>
              <span className="flex items-center gap-1">
                <FileSearch className="h-4 w-4" /> {profile?.stats.reviewCount || 0} 次锐评
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {profile?.stats.favoriteCount || 0} 个收藏
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumes">
        <TabsList className="mb-4">
          <TabsTrigger value="resumes">简历库</TabsTrigger>
          <TabsTrigger value="reviews">锐评记录</TabsTrigger>
          <TabsTrigger value="favorites">收藏夹</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes">
          <div className="mb-4">
            <UploadResumeDialog onUploaded={() => { loadResumes(); loadProfile(); }} />
          </div>
          <div className="grid gap-3">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有上传简历</p>
            ) : (
              resumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  onDelete={handleDeleteResume}
                  onDownload={handleDownloadResume}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有锐评记录</p>
            ) : (
              reviews.map((r) => <ReviewHistoryItem key={r.id} review={r} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid gap-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有收藏岗位</p>
            ) : (
              favorites.map((f) => (
                <div key={f.id} className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium">{f.company} · {f.title}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
