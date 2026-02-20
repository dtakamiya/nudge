"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { formatDate } from "@/lib/format";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
};

type Props = { actionItems: ActionItemRow[] };


export function ActionListFull({ actionItems }: Props) {
  const router = useRouter();

  if (actionItems.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center">
        アクションアイテムはありません
      </p>
    );
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateActionItemStatus(id, newStatus);
      router.refresh();
    } catch {
      // Silently fail - status will remain unchanged in UI
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {actionItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select
                value={item.status}
                onValueChange={(val) => handleStatusChange(item.id, val)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">未着手</SelectItem>
                  <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                  <SelectItem value="DONE">完了</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  <Link
                    href={`/members/${item.member.id}`}
                    className="hover:underline"
                  >
                    {item.member.name}
                  </Link>
                  {" ・ "}
                  {formatDate(item.meeting.date)}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {item.dueDate && `期限: ${formatDate(item.dueDate)}`}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
