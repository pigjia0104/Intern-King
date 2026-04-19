"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CompanyItem, CompanyFilters } from "@/types";
import { Mascot } from "@/components/brand/mascot";
import styles from "./plaza.module.css";

const LOCATIONS = ["北京", "上海", "深圳", "杭州", "广州", "成都", "南京", "武汉", "西安"];
const CATEGORIES = ["后端", "前端", "算法", "产品", "设计", "运营", "测试", "数据", "硬件", "游戏"];
const TYPES = ["暑期实习", "日常实习"];

const CARD_COLORS = ["ink", "flame", "acid", "mint", "grape", "sky", "rose"] as const;
type CardColor = (typeof CARD_COLORS)[number];

function pickColor(name: string): CardColor {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return CARD_COLORS[sum % CARD_COLORS.length];
}

export default function JobsPage() {
  const [filters, setFilters] = useState<CompanyFilters>({ page: 1, pageSize: 50 });
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.category) params.set("category", filters.category);
    if (filters.type) params.set("type", filters.type);
    params.set("page", String(filters.page || 1));
    params.set("pageSize", String(filters.pageSize || 50));

    const res = await fetch(`/api/companies?${params}`);
    const json = await res.json();
    setCompanies(json.data || []);
    setTotal(json.pagination?.total || 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const toggleFavorite = async (companyId: string, isFavorited: boolean) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, isFavorited: !isFavorited } : c))
    );
    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${companyId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId }),
        });
      }
    } catch {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, isFavorited } : c))
      );
    }
  };

  const clearFilters = () =>
    setFilters({ page: 1, pageSize: filters.pageSize });

  const favCount = companies.filter((c) => c.isFavorited).length;

  return (
    <div className={styles.plaza}>
      {/* Page Header */}
      <div className={styles.ph}>
        <div>
          <div className={styles.phKicker}>· PLAZA · {total} 家在招 · 每天都在更新</div>
          <h1 className={styles.phTitle}>
            实习<span style={{ color: "var(--flame-ink)" }}>广场</span>
          </h1>
        </div>
        <div className={styles.phStats}>
          <div className={styles.pstat}>
            <b>{companies.length}</b>
            <span>当前筛选</span>
          </div>
          <div className={styles.pstat}>
            <b>{favCount}</b>
            <span>本页收藏</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterbar}>
        <div className={styles.fbSearch}>
          <SearchIcon />
          <input
            placeholder="搜公司名，比如…字节？拼多多？"
            value={filters.search || ""}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value || undefined, page: 1 })
            }
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: undefined, page: 1 })}
              aria-label="清空搜索"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <FilterSelect
          label="地点"
          value={filters.location || ""}
          onChange={(v) =>
            setFilters({ ...filters, location: v || undefined, page: 1 })
          }
          options={LOCATIONS}
        />
        <FilterSelect
          label="岗位"
          value={filters.category || ""}
          onChange={(v) =>
            setFilters({ ...filters, category: v || undefined, page: 1 })
          }
          options={CATEGORIES}
        />
        <FilterSelect
          label="类型"
          value={filters.type || ""}
          onChange={(v) =>
            setFilters({ ...filters, type: v || undefined, page: 1 })
          }
          options={TYPES}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loading}>加载中…</div>
      ) : companies.length === 0 ? (
        <div className={styles.empty}>
          <Mascot size={120} mood="cry" />
          <div className={styles.peTitle}>一个都没找到…</div>
          <div className={styles.peSub}>换个条件试试？别太挑了。</div>
          <button className="ds-btn ghost sm" onClick={clearFilters}>
            清空筛选
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              color={pickColor(c.name)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  color,
  onToggleFavorite,
}: {
  company: CompanyItem;
  color: CardColor;
  onToggleFavorite: (id: string, isFavorited: boolean) => void;
}) {
  const topStyle: React.CSSProperties = {
    background:
      color === "ink"
        ? "#1a1613"
        : color === "flame"
        ? "var(--flame)"
        : `var(--${color})`,
    color:
      color === "ink" || color === "flame"
        ? "#fff"
        : `var(--${color}-ink)`,
  };

  return (
    <div className={styles.pcard}>
      <div className={styles.pcardTop} style={topStyle}>
        <div className={styles.pcardName}>{company.name}</div>
        <button
          className={`${styles.pcardFav} ${company.isFavorited ? styles.on : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(company.id, company.isFavorited);
          }}
          aria-label={company.isFavorited ? "取消收藏" : "收藏"}
        >
          <StarIcon filled={company.isFavorited} />
        </button>
      </div>
      <div className={styles.pcardBody}>
        <div className={styles.pcardSeasons}>
          {company.types.map((t) => (
            <span
              key={t}
              className={`sticker ${t === "暑期实习" ? "acid" : "mint"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className={styles.pcardSec}>
          <div className={styles.pcardSecLabel}>在招岗位</div>
          <div className={styles.pcardTags}>
            {company.categories.slice(0, 5).map((r) => (
              <span key={r} className={styles.rtag}>
                {r}
              </span>
            ))}
            {company.categories.length > 5 && (
              <span className={`${styles.rtag} ${styles.more}`}>
                +{company.categories.length - 5}
              </span>
            )}
          </div>
        </div>
        <div className={styles.pcardSec}>
          <div className={styles.pcardSecLabel}>工作地点</div>
          <div className={styles.pcardTags}>
            {company.locations.map((loc) => (
              <span key={loc} className={styles.ctag}>
                📍 {loc}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.pcardFoot}>
          <Link
            href={`/review?company=${encodeURIComponent(company.name)}`}
            className="ds-btn sm ghost"
          >
            🔥 让 AI 骂我
          </Link>
          {company.careerUrl ? (
            <a
              href={company.careerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn sm primary"
            >
              官网投递 <ExternalIcon />
            </a>
          ) : (
            <button className="ds-btn sm primary" disabled>
              暂无链接
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="ds-select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">全部{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l2.6 5.8 6.4.7-4.8 4.4 1.4 6.3L12 17l-5.6 3.2L7.8 14 3 9.5l6.4-.7L12 3Z" />
    </svg>
  );
}
