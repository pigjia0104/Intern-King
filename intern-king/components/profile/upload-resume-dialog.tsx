"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/app/(main)/profile/profile.module.css";

interface Props {
  onUploaded: () => void;
}

export function UploadResumeDialog({ onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploading) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, uploading]);

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "上传失败");
      } else {
        setOpen(false);
        onUploaded();
      }
    } catch {
      setError("网络错误");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ds-btn primary"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        <UploadIcon /> 上传新简历
      </button>

      {open && (
        <div
          className={styles.dialogOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading) setOpen(false);
          }}
        >
          <div className={styles.dialog} role="dialog" aria-modal>
            <div className={styles.dialogHead}>
              <h2 className={styles.dialogTitle}>上传简历</h2>
              <button
                type="button"
                className={styles.dialogClose}
                onClick={() => !uploading && setOpen(false)}
                aria-label="关闭"
                disabled={uploading}
              >
                <CloseIcon />
              </button>
            </div>

            <div
              className={styles.dropzone}
              onClick={() => !uploading && inputRef.current?.click()}
            >
              <div style={{ fontSize: 32 }}>📄</div>
              <p>点击选择文件</p>
              <small>支持 PDF / DOCX · 最大 10MB</small>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />

            {error && <div className={styles.uploadErr}>{error}</div>}
            {uploading && (
              <div className={styles.uploading}>
                <span className={styles.uploadSpin} />
                上传中…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
