"use client";

import { useState, useEffect, useCallback } from "react";
import { JobFiltersBar } from "@/components/jobs/job-filters";
import { JobTable } from "@/components/jobs/job-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobItem, JobFilters } from "@/types";

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ page: 1, pageSize: 20 });
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    params.set("page", String(filters.page || 1));
    params.set("pageSize", String(filters.pageSize || 20));

    const res = await fetch(`/api/jobs?${params}`);
    const json = await res.json();
    setJobs(json.data || []);
    setTotal(json.pagination?.total || 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounce search input
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout>>();
  const handleFilterChange = (newFilters: JobFilters) => {
    if (newFilters.search !== filters.search) {
      clearTimeout(searchTimer);
      const timer = setTimeout(() => setFilters(newFilters), 300);
      setSearchTimer(timer);
    } else {
      setFilters(newFilters);
    }
  };

  const toggleFavorite = async (jobId: string, isFavorited: boolean) => {
    // Optimistic update: immediately reflect in UI
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, isFavorited: !isFavorited } : job
      )
    );

    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${jobId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
      }
    } catch {
      // Revert on failure
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, isFavorited } : job
        )
      );
    }
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 20));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">实习广场</h1>

      <JobFiltersBar filters={filters} onChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          <JobTable jobs={jobs} onToggleFavorite={toggleFavorite} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page || 1) <= 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {filters.page || 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page || 1) >= totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
