"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMember } from "@/lib/actions/member-actions";

export function MemberForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const department = (formData.get("department") as string) || undefined;
    const position = (formData.get("position") as string) || undefined;

    try {
      await createMember({ name, department, position });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="font-heading text-xl">メンバー登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">名前 *</Label>
            <Input id="name" name="name" required placeholder="例: 田中太郎" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="department">部署</Label>
            <Input id="department" name="department" placeholder="例: エンジニアリング" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="position">役職</Label>
            <Input id="position" name="position" placeholder="例: シニアエンジニア" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
