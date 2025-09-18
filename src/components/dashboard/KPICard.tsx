"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type KPICardProps = {
  title: string;
  value: string | number;
  description?: string;
  progress?: number;
  accent?: string; // css color
};

export function KPICard({ title, value, description, progress, accent }: KPICardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {typeof progress === "number" && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">{progress}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default KPICard;