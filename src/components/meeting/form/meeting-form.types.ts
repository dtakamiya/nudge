import type { TagData } from "../recording/sortable-action-item";

export type TopicFormData = {
  id?: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
  tags: TagData[];
};

export type ActionFormData = {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  dueDate: string;
  tags: TagData[];
};

export type MeetingInitialData = {
  readonly meetingId: string;
  readonly date: string;
  readonly mood?: number | null;
  readonly conditionHealth?: number | null;
  readonly conditionMood?: number | null;
  readonly conditionWorkload?: number | null;
  readonly checkinNote?: string;
  readonly topics: ReadonlyArray<{
    readonly id: string;
    readonly category: string;
    readonly title: string;
    readonly notes: string;
    readonly sortOrder: number;
    readonly tags?: ReadonlyArray<TagData>;
  }>;
  readonly actionItems: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly sortOrder: number;
    readonly dueDate: string;
    readonly status: string;
    readonly tags?: ReadonlyArray<TagData>;
  }>;
};

export type PreviousConditions = {
  readonly health: number | null;
  readonly mood: number | null;
  readonly workload: number | null;
};

export type MeetingFormProps = {
  memberId: string;
  initialTopics?: Array<{ category: string; title: string; notes: string; sortOrder: number }>;
  initialData?: MeetingInitialData;
  previousConditions?: PreviousConditions;
  onSuccess?: () => void;
};

export function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder, tags: [] };
}

export function createEmptyAction(sortOrder: number): ActionFormData {
  return { title: "", description: "", sortOrder, dueDate: "", tags: [] };
}

export function buildTagParams(tags: TagData[]) {
  const tagIds = tags.filter((t) => t.id).map((t) => t.id!);
  const newTagNames = tags.filter((t) => !t.id).map((t) => t.name);
  return { tagIds, newTagNames };
}
