"use client";

import Link from "next/link";
import { Star, ExternalLink, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  jobs: JobItem[];
  onToggleFavorite: (jobId: string, isFavorited: boolean) => void;
}

export function JobTable({ jobs, onToggleFavorite }: Props) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">公司</TableHead>
            <TableHead>岗位</TableHead>
            <TableHead className="w-[100px]">类型</TableHead>
            <TableHead className="w-[160px]">地点</TableHead>
            <TableHead className="w-[200px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                暂无岗位数据
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>
                  <Badge variant={job.type === "summer" ? "default" : "secondary"}>
                    {job.type === "summer" ? "暑期" : "日常"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {job.location.split(",").map((loc) => (
                      <Badge key={loc} variant="outline" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/review?jobId=${job.id}`}>
                      <Button size="sm" className="bg-flame hover:bg-flame-600">
                        <FileSearch className="h-3.5 w-3.5 mr-1" />
                        测简历
                      </Button>
                    </Link>
                    {job.applyUrl && (
                      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleFavorite(job.id, job.isFavorited)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          job.isFavorited ? "fill-flame text-flame" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
