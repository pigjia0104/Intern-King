"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2 } from "lucide-react";
import { ResumeItem } from "@/types";

interface JobInfo {
  id: string;
  company: string;
  title: string;
  type: string;
  location: string;
}

interface Props {
  job: JobInfo | null;
  onSubmit: (jobId: string, resumeId: string) => void;
  isProcessing: boolean;
}

export function ReviewInput({ job, onSubmit, isProcessing }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState("");

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((json) => setResumes(json.data || []));
  }, []);

  const handleSubmit = () => {
    if (job && selectedResume) {
      onSubmit(job.id, selectedResume);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">锐评设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Job */}
        {job ? (
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">目标岗位</p>
            <p className="font-medium">{job.company} · {job.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {job.type === "summer" ? "暑期实习" : "日常实习"} · {job.location}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
            请从实习广场选择目标岗位
          </div>
        )}

        {/* Resume Select */}
        <div>
          <label className="text-sm font-medium mb-2 block">选择简历</label>
          {resumes.length > 0 ? (
            <Select value={selectedResume} onValueChange={(v) => setSelectedResume(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="选择一份简历" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground p-3 rounded bg-muted/50">
              暂无简历，请先在<a href="/profile" className="text-flame hover:underline mx-1">个人中心</a>上传
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          className="w-full bg-flame hover:bg-flame-600"
          size="lg"
          disabled={!job || !selectedResume || isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              AI 正在锐评中...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 mr-2" />
              开始锐评
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
