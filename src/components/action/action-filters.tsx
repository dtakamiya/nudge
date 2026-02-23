"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TagFilter } from "@/components/tag/tag-filter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

type Member = { id: string; name: string };
type Tag = { id: string; name: string; color: string };
type Props = { members: Member[]; tags?: Tag[] };

export function buildFilterUrl(currentParams: string, key: string, value: string): string {
  const params = new URLSearchParams(currentParams);
  if (value === "all" || value === "") {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  return `/actions?${params.toString()}`;
}

export function ActionFilters({ members, tags = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const debouncedKeyword = useDebounce(keyword, 300);

  function updateFilter(key: string, value: string) {
    router.push(buildFilterUrl(searchParams.toString(), key, value));
  }

  useEffect(() => {
    router.push(buildFilterUrl(searchParams.toString(), "q", debouncedKeyword));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="アクション名・内容で検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(val) => updateFilter("status", val)}
        >
          <SelectTrigger className="w-36">
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
          <SelectTrigger className="w-44">
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
        <Select
          value={searchParams.get("dateFilter") ?? "all"}
          onValueChange={(val) => updateFilter("dateFilter", val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="期限" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての期限</SelectItem>
            <SelectItem value="overdue">期限切れ</SelectItem>
            <SelectItem value="this-week">今週期限</SelectItem>
            <SelectItem value="this-month">今月期限</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("sort") ?? "dueDate"}
          onValueChange={(val) => updateFilter("sort", val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">期限日順</SelectItem>
            <SelectItem value="createdAt">作成日順</SelectItem>
            <SelectItem value="memberName">メンバー名順</SelectItem>
          </SelectContent>
        </Select>
        {tags.length > 0 && <TagFilter tags={tags} />}
      </div>
    </div>
  );
}
