"use client";

import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeItem } from "@/types";

interface Props {
  resume: ResumeItem;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onDownload }: Props) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-flame/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-flame" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{resume.fileName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{resume.fileType.toUpperCase()}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(resume.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onDownload(resume.id)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(resume.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
