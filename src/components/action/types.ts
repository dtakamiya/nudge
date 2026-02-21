export type ActionItemData = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: "TODO" | "IN_PROGRESS" | "DONE";
  readonly dueDate: Date | null;
};
