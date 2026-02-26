import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

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

  it("renders add-to-agenda button for each topic", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    const addButtons = screen.getAllByRole("button", { name: /アジェンダに追加/ });
    expect(addButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onCopyTopic with topic data when add button is clicked", async () => {
    const user = userEvent.setup();
    const onCopyTopic = vi.fn();
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={onCopyTopic} />);
    const addButtons = screen.getAllByRole("button", { name: /アジェンダに追加/ });
    await user.click(addButtons[0]);
    expect(onCopyTopic).toHaveBeenCalledTimes(1);
    expect(onCopyTopic).toHaveBeenCalledWith(
      expect.objectContaining({ title: "進捗報告", category: "WORK_PROGRESS" }),
    );
  });

  it("shows added feedback state after button click", () => {
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    const addButtons = screen.getAllByRole("button", { name: /アジェンダに追加/ });
    fireEvent.click(addButtons[0]);
    expect(screen.getByRole("button", { name: /追加済み/ })).toBeDefined();
  });

  it("resets button to normal state after 2 seconds", () => {
    vi.useFakeTimers();
    render(<PastMeetingsAccordion meetings={mockMeetings} onCopyTopic={vi.fn()} />);
    const addButtons = screen.getAllByRole("button", { name: /アジェンダに追加/ });
    fireEvent.click(addButtons[0]);
    expect(screen.getByRole("button", { name: /追加済み/ })).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const resetButtons = screen.getAllByRole("button", { name: /アジェンダに追加/ });
    expect(resetButtons.length).toBeGreaterThanOrEqual(2);
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
