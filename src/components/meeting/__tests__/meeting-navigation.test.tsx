import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MeetingNavigation } from "../meeting-navigation";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const previous = { id: "prev-1", date: new Date("2025-01-15"), mood: 4 };
const next = { id: "next-1", date: new Date("2025-03-12"), mood: 2 };

describe("MeetingNavigation", () => {
  describe("両方 null の場合", () => {
    it("何も表示されない", () => {
      const { container } = render(
        <MeetingNavigation memberId="member-1" previous={null} next={null} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("両方存在する場合", () => {
    beforeEach(() => {
      render(<MeetingNavigation memberId="member-1" previous={previous} next={next} />);
    });

    it("前回の1on1が表示される", () => {
      expect(screen.getByText(/前回の1on1/)).toBeDefined();
    });

    it("次回の1on1が表示される", () => {
      expect(screen.getByText(/次回の1on1/)).toBeDefined();
    });

    it("前回リンクをクリックすると前回ページへ遷移する", async () => {
      const user = userEvent.setup();
      const prevBtn = screen.getByRole("button", { name: /前回の1on1/ });
      await user.click(prevBtn);
      expect(mockPush).toHaveBeenCalledWith("/members/member-1/meetings/prev-1");
    });

    it("次回リンクをクリックすると次回ページへ遷移する", async () => {
      const user = userEvent.setup();
      const nextBtn = screen.getByRole("button", { name: /次回の1on1/ });
      await user.click(nextBtn);
      expect(mockPush).toHaveBeenCalledWith("/members/member-1/meetings/next-1");
    });

    it("ムード絵文字が表示される（前回: 🙂）", () => {
      expect(screen.getByText(/🙂/)).toBeDefined();
    });

    it("ムード絵文字が表示される（次回: 😕）", () => {
      expect(screen.getByText(/😕/)).toBeDefined();
    });
  });

  describe("previous のみ null の場合", () => {
    it("前回がグレーアウト表示される（ボタンではない）", () => {
      render(<MeetingNavigation memberId="member-1" previous={null} next={next} />);
      expect(screen.queryByRole("button", { name: /前回の1on1/ })).toBeNull();
      expect(screen.getByText(/前回の1on1/)).toBeDefined();
    });

    it("次回ボタンは有効でクリック可能", async () => {
      const user = userEvent.setup();
      render(<MeetingNavigation memberId="member-1" previous={null} next={next} />);
      const nextBtn = screen.getByRole("button", { name: /次回の1on1/ });
      await user.click(nextBtn);
      expect(mockPush).toHaveBeenCalledWith("/members/member-1/meetings/next-1");
    });
  });

  describe("next のみ null の場合", () => {
    it("次回がグレーアウト表示される（ボタンではない）", () => {
      render(<MeetingNavigation memberId="member-1" previous={previous} next={null} />);
      expect(screen.queryByRole("button", { name: /次回の1on1/ })).toBeNull();
      expect(screen.getByText(/次回の1on1/)).toBeDefined();
    });

    it("前回ボタンは有効でクリック可能", async () => {
      const user = userEvent.setup();
      render(<MeetingNavigation memberId="member-1" previous={previous} next={null} />);
      const prevBtn = screen.getByRole("button", { name: /前回の1on1/ });
      await user.click(prevBtn);
      expect(mockPush).toHaveBeenCalledWith("/members/member-1/meetings/prev-1");
    });
  });
});
