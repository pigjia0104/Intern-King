"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { JobFilters } from "@/types";

const LOCATIONS = ["全部", "北京", "上海", "深圳", "杭州", "广州", "成都", "南京"];
const TYPES = [
  { value: "", label: "全部类型" },
  { value: "summer", label: "暑期实习" },
  { value: "daily", label: "日常实习" },
];
const CATEGORIES = [
  { value: "", label: "全部方向" },
  { value: "研发", label: "研发" },
  { value: "产品", label: "产品" },
  { value: "运营", label: "运营" },
  { value: "设计", label: "设计" },
];

interface Props {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export function JobFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索公司或岗位..."
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
        />
      </div>

      <Select
        value={filters.location ?? ""}
        onValueChange={(v) => onChange({ ...filters, location: (v === "全部" || v === null) ? "" : (v ?? ""), page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="地点" />
        </SelectTrigger>
        <SelectContent>
          {LOCATIONS.map((loc) => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? ""}
        onValueChange={(v) => onChange({ ...filters, type: v ?? "", page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="类型" />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category ?? ""}
        onValueChange={(v) => onChange({ ...filters, category: v ?? "", page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="方向" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
