import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PastMeetingsAccordion } from "../past-meetings-accordion";

vi.mock("radix-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("radix-ui")>();
  return {
    ...actual,
    Accordion: {
      Root: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Item: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Header: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Trigger: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button onClick={onClick} {...props}>
          {children}
        </button>
      ),
      Content: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
    },
  };
});

const mockMeetings = [
  {
    id: "m1",
    date: new Date("2026-02-17"),
    topics: [
      { id: "t1", category: "WORK_PROGRESS", title: "進捗報告", notes: "順調" },
      { id: "t2", category: "CAREER", title: "キャリア相談", notes: "" },
    ],
    actionItems: [],
  },
  {
    id: "m2",
    date: new Date("2026-01-20"),
    topics: [{ id: "t3", category: "OTHER", title: "先月の話題", notes: "メモあり" }],
    actionItems: [],
  },
];

describe("PastMeetingsAccordion", () => {
  afterEach(() => cleanup());

  it("renders meeting dates as accordion items", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    expect(screen.getByText(/2026.+2.+17/)).toBeDefined();
    expect(screen.getByText(/2026.+1.+20/)).toBeDefined();
  });

  it("shows topic count badge for each meeting", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    expect(screen.getByText("2件")).toBeDefined();
    expect(screen.getByText("1件")).toBeDefined();
  });

  it("renders topic titles", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    expect(screen.getByText("進捗報告")).toBeDefined();
    expect(screen.getByText("キャリア相談")).toBeDefined();
  });

  it("renders copy button for each topic", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onCopyTopic with topic data when copy button is clicked", async () => {
    const user = userEvent.setup();
    const onCopyTopic = vi.fn();
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={onCopyTopic} />);
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    await user.click(copyButtons[0]);
    expect(onCopyTopic).toHaveBeenCalledTimes(1);
    expect(onCopyTopic).toHaveBeenCalledWith(
      expect.objectContaining({ title: "進捗報告", category: "WORK_PROGRESS" }),
    );
  });

  it("shows empty state when no meetings", () => {
    render(<PastMeetingsAccordion meetings={[]} onCopyTopic={vi.fn()} />);
    expect(screen.getByText(/過去のミーティング記録はありません/)).toBeDefined();
  });

  it("shows category labels", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    expect(screen.getByText("業務進捗")).toBeDefined();
    expect(screen.getByText("キャリア")).toBeDefined();
  });
});
