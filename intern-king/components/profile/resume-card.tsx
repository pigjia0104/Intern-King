"use client";

import { ResumeItem } from "@/types";
import styles from "@/app/(main)/profile/profile.module.css";

interface Props {
  resume: ResumeItem;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

function formatSize() {
  // Actual size not available from API; omit if unknown
  return "";
}

export function ResumeCard({ resume, onDelete, onDownload }: Props) {
  const size = formatSize();
  const date = new Date(resume.createdAt).toLocaleDateString("zh-CN");

  return (
    <div className={styles.item}>
      <div className={styles.itemIcon}>📄</div>
      <div className={styles.itemMain}>
        <div className={styles.itemTitle}>{resume.fileName}</div>
        <div className={styles.itemMeta}>
          <span>{resume.fileType.toUpperCase()}</span>
          {size && (<><span>·</span><span>{size}</span></>)}
          <span>·</span>
          <span>上传于 {date}</span>
        </div>
      </div>
      <div className={styles.itemActions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onDownload(resume.id)}
          title="下载"
          aria-label="下载"
        >
          <DownloadIcon />
        </button>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.danger}`}
          onClick={() => onDelete(resume.id)}
          title="删除"
          aria-label="删除"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
