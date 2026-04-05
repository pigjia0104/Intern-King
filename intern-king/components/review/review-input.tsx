"use client";

import { useState, useEffect, useRef } from "react";
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

interface Props {
  onSubmit: (data: { company: string; position: string; jobDescription: string; resumeId: string; category?: string; type?: string }) => void;
  isProcessing: boolean;
}

const CATEGORY_OPTIONS = ["后端", "前端", "算法", "产品", "设计", "运营", "测试", "数据", "硬件", "游戏"];
const TYPE_OPTIONS = ["暑期实习", "日常实习"];

export function ReviewInput({ onSubmit, isProcessing }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((json) => setResumes(json.data || []));
  }, []);

  const handleCompanySearch = (value: string) => {
    setCompany(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/companies?search=${encodeURIComponent(value)}&pageSize=8`);
      const json = await res.json();
      setSuggestions(json.data || []);
      setShowSuggestions(true);
    }, 200);
  };

  const handleSubmit = () => {
    if (company && position && jobDescription && selectedResume) {
      onSubmit({
        company, position, jobDescription, resumeId: selectedResume,
        category: category || undefined,
        type: type || undefined,
      });
    }
  };

  const canSubmit = company && position && jobDescription && selectedResume && !isProcessing;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          锐评设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Target Company */}
        <div>
          <label className="text-sm font-medium mb-2 block">目标公司</label>
          <div className="relative">
            <input
              type="text"
              value={company}
              onChange={(e) => handleCompanySearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="输入公司名称，如：腾讯"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20 focus:border-flame/50"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-elevated border border-border rounded-lg shadow-lg z-10 max-h-[180px] overflow-y-auto">
                {suggestions.map((s) => (
                  <div
                    key={s.name}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-flame/10 hover:text-flame transition-colors"
                    onMouseDown={() => {
                      setCompany(s.name);
                      setShowSuggestions(false);
                    }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Target Position */}
        <div>
          <label className="text-sm font-medium mb-2 block">目标岗位</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="如：后端开发实习生"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20 focus:border-flame/50"
          />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 block">岗位类别</label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="选择类别（可选）">
                  {category || "选择类别（可选）"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">实习类型</label>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="选择类型（可选）">
                  {type || "选择类型（可选）"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">岗位 JD</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="粘贴岗位描述（Job Description）...&#10;&#10;包括岗位职责、任职要求等内容，AI 会结合 JD 对简历进行针对性点评"
            rows={5}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-flame/20 focus:border-flame/50"
          />
          <p className="text-xs text-muted-foreground mt-1">建议从招聘官网复制完整 JD，点评效果更佳</p>
        </div>

        {/* Resume Select */}
        <div>
          <label className="text-sm font-medium mb-2 block">选择简历</label>
          {resumes.length > 0 ? (
            <Select value={selectedResume} onValueChange={(v) => setSelectedResume(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="选择一份简历">
                  {selectedResume ? resumes.find((r) => r.id === selectedResume)?.fileName : "选择一份简历"}
                </SelectValue>
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
          className="w-full bg-gradient-to-r from-flame to-flame-600 hover:shadow-lg hover:shadow-flame/20"
          size="lg"
          disabled={!canSubmit}
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
              开始锐评 🔥
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
