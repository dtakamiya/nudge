"use client";

import { Bell, BellOff, BellRing } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/use-notifications";

const PERMISSION_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  granted: { label: "許可済み", variant: "default" },
  denied: { label: "拒否済み", variant: "destructive" },
  default: { label: "未設定", variant: "secondary" },
};

export function NotificationSettings() {
  const { isSupported, permission, isEnabled, setEnabled, requestPermission } = useNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            ブラウザ通知
          </CardTitle>
          <CardDescription>このブラウザはWeb通知に対応していません。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const permissionInfo = PERMISSION_LABELS[permission] ?? PERMISSION_LABELS.default;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          ブラウザ通知
        </CardTitle>
        <CardDescription>
          期限当日・前日のアクションアイテムをブラウザ通知でお知らせします。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">通知の許可状態</span>
          <Badge variant={permissionInfo.variant}>{permissionInfo.label}</Badge>
        </div>

        {permission === "denied" && (
          <p className="text-sm text-muted-foreground rounded-md bg-muted p-3">
            通知が拒否されています。ブラウザのサイト設定から通知を許可してください。
          </p>
        )}

        {permission === "default" && (
          <button
            type="button"
            onClick={requestPermission}
            className="text-sm text-primary underline underline-offset-4 hover:no-underline"
          >
            通知を許可する
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">リマインダー通知</span>
          </div>
          <Switch
            checked={isEnabled && permission === "granted"}
            disabled={permission !== "granted"}
            onCheckedChange={setEnabled}
            aria-label="リマインダー通知を有効にする"
          />
        </div>

        {permission === "granted" && isEnabled && (
          <p className="text-sm text-muted-foreground">
            期限当日・前日のアクションアイテムを1日1回お知らせします。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
