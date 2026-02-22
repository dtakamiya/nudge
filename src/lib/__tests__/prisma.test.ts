import { describe, expect,it } from "vitest";

describe("prisma client", () => {
  it("exports prisma instance", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(prisma).toBeDefined();
  });
});
