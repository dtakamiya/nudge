"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { MemberList } from "@/components/member/member-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

type MemberWithStats = {
  readonly id: string;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly _count: { readonly actionItems: number };
  readonly meetings: readonly { readonly date: Date }[];
  readonly overdueActionCount: number;
};

type Props = {
  readonly members: readonly MemberWithStats[];
};

export function MemberListPage({ members }: Props) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isSearching = search !== debouncedSearch;

  const departments = useMemo(() => {
    const set = new Set(members.map((m) => m.department).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [members]);

  const positions = useMemo(() => {
    const set = new Set(members.map((m) => m.position).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [members]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = search === "" || m.name.includes(search);
      const matchesDept = department === "" || m.department === department;
      const matchesPos = position === "" || m.position === position;
      return matchesSearch && matchesDept && matchesPos;
    });
  }, [members, search, department, position]);

  const liveMessage = isSearching
    ? "検索中..."
    : filtered.length === 0
      ? "該当するメンバーが見つかりませんでした"
      : `${filtered.length} 件のメンバーが見つかりました`;

  return (
    <div>
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="名前で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          aria-label="部署で絞り込む"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">すべての部署</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          aria-label="役職で絞り込む"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">すべての役職</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className="flex items-center text-sm text-muted-foreground sm:ml-auto shrink-0">
          <Users className="w-4 h-4 mr-1.5" />
          <span>{filtered.length}人</span>
        </div>
      </div>

      {filtered.length === 0 && members.length > 0 ? (
        <EmptyState
          icon={Users}
          title="条件に一致するメンバーが見つかりません"
          description="検索条件やフィルターを変更してお試しください"
        />
      ) : (
        <MemberList members={filtered} />
      )}
    </div>
  );
}
