"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { TagFilter } from "@/components/tag/tag-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Member = { id: string; name: string };
type Tag = { id: string; name: string; color: string };
type Props = { members: Member[]; tags?: Tag[] };

export function buildFilterUrl(currentParams: string, key: string, value: string): string {
  const params = new URLSearchParams(currentParams);
  if (value === "all") {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  return `/actions?${params.toString()}`;
}

export function ActionFilters({ members, tags = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    router.push(buildFilterUrl(searchParams.toString(), key, value));
  }

  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(val) => updateFilter("status", val)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="TODO">未着手</SelectItem>
          <SelectItem value="IN_PROGRESS">進行中</SelectItem>
          <SelectItem value="DONE">完了</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("memberId") ?? "all"}
        onValueChange={(val) => updateFilter("memberId", val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="メンバー" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全メンバー</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {tags.length > 0 && <TagFilter tags={tags} />}
    </div>
  );
}
