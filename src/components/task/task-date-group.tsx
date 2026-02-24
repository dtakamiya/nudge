import { AlertCircle } from "lucide-react";

import type { TaskItemForGrouping } from "@/lib/group-tasks";
import { groupTasksByMember } from "@/lib/group-tasks";

import { TaskMemberGroup } from "./task-member-group";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type TaskDateGroup = {
  key: string;
  label: string;
  items: TaskItemForGrouping[];
  isOverdue: boolean;
};

type TaskDateGroupProps = {
  readonly group: TaskDateGroup;
};

export function TaskDateGroup({ group }: TaskDateGroupProps) {
  const memberGroups = groupTasksByMember(group.items);

  return (
    <div className="mb-6">
      <div
        className={`flex items-center gap-2 px-4 py-2 mb-2 rounded-lg ${
          group.isOverdue
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-muted-foreground"
        }`}
      >
        {group.isOverdue && <AlertCircle className="w-4 h-4 shrink-0" />}
        <h2 className="text-sm font-semibold">{group.label}</h2>
        <span
          className={`ml-auto text-xs rounded-full px-2 py-0.5 font-medium ${
            group.isOverdue
              ? "bg-destructive/20 text-destructive"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {group.items.length}
        </span>
      </div>
      {memberGroups.map((mg) => (
        <TaskMemberGroup
          key={mg.memberId}
          memberId={mg.memberId}
          memberName={mg.memberName}
          items={mg.items}
        />
      ))}
    </div>
  );
}
