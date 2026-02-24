import Link from "next/link";

import { AvatarInitial } from "@/components/ui/avatar-initial";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

import { TaskItemRow } from "./task-item-row";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: ActionItemStatusType;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
  tags: Tag[];
};

type TaskMemberGroupProps = {
  readonly memberId: string;
  readonly memberName: string;
  readonly items: TaskItem[];
};

export function TaskMemberGroup({ memberId, memberName, items }: TaskMemberGroupProps) {
  return (
    <div className="mb-4">
      <Link
        href={`/members/${memberId}`}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <AvatarInitial name={memberName} size="sm" />
        <span>{memberName}</span>
        <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5">{items.length}</span>
      </Link>
      <div className="pl-4">
        {items.map((item) => (
          <TaskItemRow
            key={item.id}
            title={item.title}
            status={item.status}
            dueDate={item.dueDate}
            memberId={item.member.id}
            meetingId={item.meeting.id}
            tags={item.tags}
          />
        ))}
      </div>
    </div>
  );
}
