"use client";

import { useState, useEffect, useCallback } from "react";
import { CompanyItem, CompanyFilters } from "@/types";
import { Star, ExternalLink, Search } from "lucide-react";

const LOCATIONS = ["北京", "上海", "深圳", "杭州", "广州", "成都", "南京", "武汉", "西安"];
const CATEGORIES = ["后端", "前端", "算法", "产品", "设计", "运营", "测试", "数据", "硬件", "游戏"];
const TYPES = ["暑期实习", "日常实习"];

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
    // Optimistic update
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
      // Revert on failure
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, isFavorited } : c))
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        实习<span className="text-flame">广场</span>
      </h1>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索公司名称..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20 focus:border-flame/50"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
          />
        </div>

        {/* Location Filter */}
        <select
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20"
          value={filters.location || ""}
          onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined, page: 1 })}
        >
          <option value="">全部地点</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20"
          value={filters.category || ""}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined, page: 1 })}
        >
          <option value="">全部岗位</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-flame/20"
          value={filters.type || ""}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
        >
          <option value="">全部类型</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="ml-auto text-sm text-muted-foreground self-center">
          共 <span className="text-flame font-semibold">{total}</span> 家公司
        </span>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">没有找到匹配的公司</p>
          <p className="text-sm">试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
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
  onToggleFavorite,
}: {
  company: CompanyItem;
  onToggleFavorite: (id: string, isFavorited: boolean) => void;
}) {
  const gradientColors = [
    "from-green-900/30 to-green-950/30 text-green-400 border-green-400/20",
    "from-orange-900/30 to-orange-950/30 text-orange-400 border-orange-400/20",
    "from-blue-900/30 to-blue-950/30 text-blue-400 border-blue-400/20",
    "from-purple-900/30 to-purple-950/30 text-purple-400 border-purple-400/20",
    "from-yellow-900/30 to-yellow-950/30 text-yellow-400 border-yellow-400/20",
    "from-red-900/30 to-red-950/30 text-red-400 border-red-400/20",
  ];
  const colorIndex = company.name.charCodeAt(0) % gradientColors.length;

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-flame/30 hover:bg-card/80 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientColors[colorIndex]} border flex items-center justify-center text-lg font-bold shrink-0`}>
          {company.abbr}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{company.name}</h3>
          <div className="flex gap-1.5 flex-wrap">
            {company.types.map((t) => (
              <span
                key={t}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  t === "暑期实习"
                    ? "bg-flame/10 text-flame border border-flame/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-400/20"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(company.id, company.isFavorited)}
          className={`p-1.5 rounded-full transition-colors ${
            company.isFavorited
              ? "text-yellow-400 hover:text-yellow-300"
              : "text-muted-foreground hover:text-muted hover:bg-muted"
          }`}
          title={company.isFavorited ? "取消收藏" : "收藏"}
        >
          <Star className="h-4 w-4" fill={company.isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Categories */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">在招岗位</p>
        <div className="flex flex-wrap gap-1.5">
          {company.categories.map((c) => (
            <span key={c} className="text-xs px-2.5 py-1 bg-muted/50 rounded-full text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">工作地点</p>
        <div className="flex flex-wrap gap-1.5">
          {company.locations.slice(0, 5).map((l) => (
            <span key={l} className="text-xs px-2.5 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              {l}
            </span>
          ))}
          {company.locations.length > 5 && (
            <span className="text-xs px-2.5 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              +{company.locations.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-3 border-t border-border">
        <a
          href={company.careerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-flame to-flame-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-flame/20 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          官网投递
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
