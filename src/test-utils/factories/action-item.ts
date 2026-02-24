import { faker } from "@faker-js/faker";

export interface ActionItemData {
  content: string;
  dueDate?: string | null;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export function buildActionItemData(overrides: Partial<ActionItemData> = {}): ActionItemData {
  return {
    content: faker.lorem.sentence(),
    dueDate: null,
    status: "PENDING",
    ...overrides,
  };
}

export function buildActionItemProps(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    dueDate: null,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
    meetingId: faker.string.uuid(),
    ...overrides,
  };
}
