import { AlertCircle, CheckCircle2, Clock, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatAverageDays(averageDays: number): {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClassName: string;
} {
  if (averageDays === 0) {
    return {
      label: "平均完了日数",
      value: "期限通り",
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
      valueClassName: "text-2xl font-bold",
    };
  }
  if (averageDays < 0) {
    return {
      label: "平均完了日数",
      value: `${Math.abs(averageDays).toFixed(1)} 日前倒し`,
      icon: <TrendingDown className="h-4 w-4 text-emerald-500" />,
      valueClassName: "text-2xl font-bold text-emerald-600",
    };
  }
  return {
    label: "平均完了日数",
    value: `${averageDays.toFixed(1)} 日遅延`,
    icon: <AlertCircle className="h-4 w-4 text-destructive" />,
    valueClassName: "text-2xl font-bold text-destructive",
  };
}

export function ActionKpiCards({
  onTimeRate,
  averageDays,
}: {
  onTimeRate: number;
  averageDays: number;
}) {
  const avgDaysDisplay = formatAverageDays(averageDays);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">期限遵守率</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(onTimeRate)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{avgDaysDisplay.label}</CardTitle>
          {avgDaysDisplay.icon}
        </CardHeader>
        <CardContent>
          <div className={avgDaysDisplay.valueClassName} data-testid="avg-days-value">
            {avgDaysDisplay.value}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
