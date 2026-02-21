"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMember, updateMember } from "@/lib/actions/member-actions";

type MemberData = {
  readonly id: string;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
};

type Props = {
  readonly initialData?: MemberData;
  readonly onSuccess?: () => void;
};

export function MemberForm({ initialData, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const department = (formData.get("department") as string) || undefined;
    const position = (formData.get("position") as string) || undefined;

    try {
      if (isEditing) {
        const result = await updateMember(initialData.id, { name, department, position });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onSuccess?.();
      } else {
        const result = await createMember({ name, department, position });
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  const content = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">名前 *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialData?.name ?? ""}
          placeholder="例: 田中太郎"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="department">部署</Label>
        <Input
          id="department"
          name="department"
          defaultValue={initialData?.department ?? ""}
          placeholder="例: エンジニアリング"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="position">役職</Label>
        <Input
          id="position"
          name="position"
          defaultValue={initialData?.position ?? ""}
          placeholder="例: シニアエンジニア"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isEditing
            ? "更新中..."
            : "登録中..."
          : isEditing
            ? "更新する"
            : "登録する"}
      </Button>
    </form>
  );

  if (isEditing) {
    return content;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">メンバー登録</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
