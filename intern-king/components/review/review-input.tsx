"use client";

import { useState, useEffect, useRef } from "react";
import { MascotMini } from "@/components/brand/mascot";
import { ResumeItem } from "@/types";
import styles from "@/app/(main)/review/review.module.css";

interface Props {
  onSubmit: (data: { company: string; position: string; jobDescription: string; resumeId: string; category?: string; type?: string }) => void;
  isProcessing: boolean;
  prefillCompany?: string;
}

const CATEGORY_OPTIONS = ["后端", "前端", "算法", "产品", "设计", "运营", "测试", "数据", "硬件", "游戏"];
const TYPE_OPTIONS = ["暑期实习", "日常实习"];

export function ReviewInput({ onSubmit, isProcessing, prefillCompany }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [company, setCompany] = useState(prefillCompany || "");
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
        company,
        position,
        jobDescription,
        resumeId: selectedResume,
        category: category || undefined,
        type: type || undefined,
      });
    }
  };

  const canSubmit = !!(company && position && jobDescription && selectedResume) && !isProcessing;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.num}>01</div>
        <div>
          <h3>锐评设置</h3>
          <p>告诉我你要打的是哪场仗</p>
        </div>
        <div className={styles.headMascot}>
          <MascotMini size={32} />
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.fg}>
          <label className="ds-label">🎯 目标公司</label>
          <div className={styles.suggestWrap}>
            <input
              type="text"
              className="ds-field"
              placeholder="例：蚂蚁集团、字节跳动…"
              value={company}
              onChange={(e) => handleCompanySearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggest}>
                {suggestions.map((s) => (
                  <div
                    key={s.name}
                    className={styles.suggestItem}
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

        <div className={styles.fg}>
          <label className="ds-label">💼 目标岗位</label>
          <input
            type="text"
            className="ds-field"
            placeholder="例：AI 产品实习生、后端开发实习生…"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.fg}>
            <label className="ds-label">岗位类别</label>
            <div className={styles.selectWrap}>
              <select
                className={`ds-field ${styles.select}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">选择类别（可选）</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.fg}>
            <label className="ds-label">实习类型</label>
            <div className={styles.selectWrap}>
              <select
                className={`ds-field ${styles.select}`}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">选择类型（可选）</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.fg}>
          <label className="ds-label">📋 岗位 JD</label>
          <textarea
            className={`ds-field ${styles.textarea}`}
            rows={5}
            placeholder="粘贴岗位描述（Job Description）… AI 会结合 JD 对简历进行针对性点评。"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className={styles.fgHint}>💡 粘得越详细，骂得越精准</div>
        </div>

        <div className={styles.fg}>
          <label className="ds-label">📄 选择简历</label>
          {resumes.length > 0 ? (
            <div className={styles.selectWrap}>
              <select
                className={`ds-field ${styles.select}`}
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                <option value="">选择一份简历</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.fileName}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.fgHint}>
              暂无简历，请先去
              <a href="/profile" style={{ color: "var(--flame-ink)", fontWeight: 700, marginLeft: 4, marginRight: 4 }}>
                个人中心
              </a>
              上传。
            </div>
          )}
        </div>

        <button
          type="button"
          className={`ds-btn primary xl ${styles.submit}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isProcessing ? (
            <>
              <span className={styles.spin} />
              AI 正在磨刀…
            </>
          ) : (
            <>🔥 开始锐评（建议戴好耳塞）</>
          )}
        </button>
      </div>
    </div>
  );
}
