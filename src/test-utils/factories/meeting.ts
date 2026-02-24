import { faker } from "@faker-js/faker";

export interface TopicData {
  content: string;
  order?: number;
}

export interface MeetingActionItemData {
  content: string;
  dueDate?: string | null;
}

export interface MeetingData {
  scheduledAt?: string;
  topics?: TopicData[];
  actionItems?: MeetingActionItemData[];
}

export function buildTopicData(overrides: Partial<TopicData> = {}): TopicData {
  return {
    content: faker.lorem.sentence(),
    order: 0,
    ...overrides,
  };
}

export function buildMeetingActionItemData(
  overrides: Partial<MeetingActionItemData> = {},
): MeetingActionItemData {
  return {
    content: faker.lorem.sentence(),
    dueDate: null,
    ...overrides,
  };
}

export function buildMeetingData(overrides: Partial<MeetingData> = {}): MeetingData {
  return {
    scheduledAt: faker.date.recent().toISOString(),
    topics: [buildTopicData()],
    actionItems: [buildMeetingActionItemData()],
    ...overrides,
  };
}

export function buildMeetingProps(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    scheduledAt: new Date(),
    startedAt: null,
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberId: faker.string.uuid(),
    ...overrides,
  };
}
