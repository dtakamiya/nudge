"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type TagFilterProps = {
  tags: Tag[];
};

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateTagFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("tag");
    } else {
      params.set("tag", value);
    }
    const query = params.toString();
    router.push(query ? `?${query}` : "?");
  }

  return (
    <Select value={searchParams.get("tag") ?? "all"} onValueChange={updateTagFilter}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="タグ" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべて</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
