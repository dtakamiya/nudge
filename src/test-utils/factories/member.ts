import { faker } from "@faker-js/faker";

export interface MemberData {
  name: string;
  role?: string;
  team?: string;
  memo?: string;
}

export function buildMemberData(overrides: Partial<MemberData> = {}): MemberData {
  return {
    name: faker.person.fullName(),
    role: faker.person.jobTitle(),
    team: faker.commerce.department(),
    memo: faker.lorem.sentence(),
    ...overrides,
  };
}

export function buildMemberProps(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    role: faker.person.jobTitle(),
    team: faker.commerce.department(),
    memo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
