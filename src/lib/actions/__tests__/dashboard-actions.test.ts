import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getDashboardSummary } from "../dashboard-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";
import { updateActionItemStatus } from "../action-item-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("getDashboardSummary", () => {
  it("returns zeros when no data exists", async () => {
    const summary = await getDashboardSummary();
    expect(summary).toEqual({
      needsFollowUp: 0,
      actionCompletionRate: 0,
      totalActions: 0,
      completedActions: 0,
      meetingsThisMonth: 0,
      overdueActions: 0,
    });
  });

  it("counts members needing follow-up (no meeting in 14+ days)", async () => {
    const member1Result = await createMember({ name: "Recent" });
    const member2Result = await createMember({ name: "Old" });
    await createMember({ name: "Never" });
    if (!member1Result.success) throw new Error(member1Result.error);
    if (!member2Result.success) throw new Error(member2Result.error);

    // member1: meeting today
    await createMeeting({
      memberId: member1Result.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // member2: meeting 15 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);
    await createMeeting({
      memberId: member2Result.data.id,
      date: oldDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    // member3: no meeting at all

    const summary = await getDashboardSummary();
    expect(summary.needsFollowUp).toBe(2); // member2 + member3
  });

  it("calculates action completion rate", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Done Task", description: "" },
        { title: "Todo Task", description: "" },
        { title: "Progress Task", description: "" },
        { title: "Done Task 2", description: "" },
      ],
    });
    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");
    await updateActionItemStatus(items[3].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.totalActions).toBe(4);
    expect(summary.completedActions).toBe(2);
    expect(summary.actionCompletionRate).toBe(50);
  });

  it("counts meetings this month", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);

    // This month
    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // Last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    await createMeeting({
      memberId: memberResult.data.id,
      date: lastMonth.toISOString(),
      topics: [],
      actionItems: [],
    });

    const summary = await getDashboardSummary();
    expect(summary.meetingsThisMonth).toBe(1);
  });

  it("counts overdue actions", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue", description: "", dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", dueDate: tomorrow.toISOString() },
        { title: "No due", description: "" },
      ],
    });

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(1);
  });

  it("does not count completed items as overdue", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        {
          title: "Overdue but done",
          description: "",
          dueDate: yesterday.toISOString(),
        },
      ],
    });

    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(0);
  });
});
