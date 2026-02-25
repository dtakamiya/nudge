import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { NotificationSettings } from "@/components/notification/notification-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "設定" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">設定</h1>

      <div className="space-y-6 max-w-2xl">
        <NotificationSettings />

        <Card>
          <CardHeader>
            <CardTitle>テンプレート管理</CardTitle>
            <CardDescription>カスタムミーティングテンプレートを管理します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings/templates"
              className="text-sm text-primary underline underline-offset-4 hover:no-underline"
            >
              テンプレート管理ページへ →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
