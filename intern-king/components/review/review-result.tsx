import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/review/score-ring";
import { ReviewResult } from "@/types";
import { AlertTriangle, Info, XCircle, Lightbulb, MessageSquare } from "lucide-react";

interface Props {
  result: ReviewResult;
}

const severityConfig = {
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "严重" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "注意" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "建议" },
};

export function ReviewResultDisplay({ result }: Props) {
  return (
    <div className="space-y-6">
      {/* Score + Summary */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <ScoreRing score={result.score} />
          <p className="mt-4 text-lg font-medium">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Roasts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-flame" />
            毒舌锐评
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.roasts.map((roast, i) => {
            const config = severityConfig[roast.severity];
            const Icon = config.icon;
            return (
              <div key={i} className={`p-3 rounded-lg ${config.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  <span className="font-medium text-sm">{roast.point}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{roast.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-flame" />
            修改建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-sm mb-1">{s.title}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interview Questions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-flame" />
            高频面试题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {result.interviewQuestions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground">{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Sources */}
      {result.sourcesUsed && result.sourcesUsed !== "无" && (
        <p className="text-xs text-muted-foreground">面经来源：{result.sourcesUsed}</p>
      )}
    </div>
  );
}
