import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingPrepare } from "../meeting-prepare";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockPreviousMeeting = {
  id: "meeting-1",
  date: new Date("2026-02-17"),
  topics: [
    { id: "t1", category: "WORK_PROGRESS", title: "進捗報告", notes: "順調" },
    { id: "t2", category: "CAREER", title: "キャリア相談", notes: "" },
  ],
  actionItems: [{ id: "a1", title: "資料作成", status: "TODO", dueDate: new Date("2026-02-28") }],
};

const mockPendingActions = [
  {
    id: "a1",
    title: "資料作成",
    status: "TODO",
    dueDate: new Date("2026-02-28"),
    meeting: { date: new Date("2026-02-17") },
  },
  {
    id: "a2",
    title: "レビュー依頼",
    status: "IN_PROGRESS",
    dueDate: null,
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("MeetingPrepare", () => {
  afterEach(() => cleanup());

  it("renders previous meeting topics", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={mockPreviousMeeting}
        pendingActions={mockPendingActions}
      />,
    );
    expect(screen.getByText("進捗報告")).toBeDefined();
    expect(screen.getByText("キャリア相談")).toBeDefined();
  });

  it("renders pending action items", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={mockPreviousMeeting}
        pendingActions={mockPendingActions}
      />,
    );
    expect(screen.getByText("資料作成")).toBeDefined();
    expect(screen.getByText("レビュー依頼")).toBeDefined();
  });

  it("shows empty state when no previous meeting", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={null}
        pendingActions={[]}
      />,
    );
    expect(screen.getByText("前回の記録はありません")).toBeDefined();
  });

  it("renders template selector", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={null}
        pendingActions={[]}
      />,
    );
    expect(screen.getByText("定期チェックイン")).toBeDefined();
    expect(screen.getByText("キャリア面談")).toBeDefined();
  });

  it("populates topics when template is selected", async () => {
    const user = userEvent.setup();
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={null}
        pendingActions={[]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /定期チェックイン/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs[0]).toHaveProperty("value", "今週の進捗報告");
    expect(inputs[1]).toHaveProperty("value", "困っていること");
  });

  it("can add a topic manually", async () => {
    const user = userEvent.setup();
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={null}
        pendingActions={[]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders start meeting button", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        memberName="山本 和也"
        previousMeeting={null}
        pendingActions={[]}
      />,
    );
    expect(screen.getByRole("link", { name: /ミーティングを開始/ })).toBeDefined();
  });
});
