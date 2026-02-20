import { describe, it, expect } from "vitest";

describe("prisma client", () => {
  it("exports prisma instance", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(prisma).toBeDefined();
  });
});
