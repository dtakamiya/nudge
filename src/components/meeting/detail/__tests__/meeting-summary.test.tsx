import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MeetingSummary } from "../meeting-summary";

afterEach(() => {
  cleanup();
});

const baseProps = {
  date: "2026-02-23",
  conditionHealth: null,
  conditionMood: null,
  conditionWorkload: null,
  checkinNote: "",
  topicCount: 2,
  actionItemCount: 3,
};

describe("MeetingSummary", () => {
  describe("日付表示", () => {
    it("日付が表示されること", () => {
      render(<MeetingSummary {...baseProps} />);
      expect(screen.getByText(/2026/)).toBeDefined();
    });
  });

  describe("コンディション表示", () => {
    it("コンディションが設定されている場合に体調が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={3} />);
      expect(screen.getByText(/体調/)).toBeDefined();
    });

    it("コンディションが設定されている場合に気分が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionMood={4} />);
      expect(screen.getByText(/気分/)).toBeDefined();
    });

    it("コンディションが設定されている場合に業務量が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionWorkload={2} />);
      expect(screen.getByText(/業務量/)).toBeDefined();
    });

    it("体調が null の場合は体調が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={null} />);
      expect(screen.queryByText(/体調/)).toBeNull();
    });

    it("気分が null の場合は気分が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} conditionMood={null} />);
      expect(screen.queryByText(/気分/)).toBeNull();
    });

    it("業務量が null の場合は業務量が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} conditionWorkload={null} />);
      expect(screen.queryByText(/業務量/)).toBeNull();
    });

    it("コンディション値がビジュアルバーで表示されること（3/5）", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={3} />);
      expect(screen.getByText(/3\/5/)).toBeDefined();
    });
  });

  describe("トピック・アクションアイテム数", () => {
    it("トピック数が表示されること", () => {
      render(<MeetingSummary {...baseProps} topicCount={2} />);
      expect(screen.getByText("2件", { selector: "span.font-medium" })).toBeDefined();
    });

    it("アクションアイテム数が表示されること", () => {
      render(<MeetingSummary {...baseProps} actionItemCount={3} />);
      expect(screen.getByText("3件", { selector: "span.font-medium" })).toBeDefined();
    });
  });

  describe("話題タイトル一覧", () => {
    it("topicTitles が渡された場合にタイトルが表示されること", () => {
      render(
        <MeetingSummary
          {...baseProps}
          topicTitles={["業務進捗 - 今週の進捗報告", "課題・相談 - 困っていること"]}
        />,
      );
      expect(screen.getByText("業務進捗 - 今週の進捗報告")).toBeDefined();
      expect(screen.getByText("課題・相談 - 困っていること")).toBeDefined();
    });

    it("topicTitles が渡されない場合はタイトル一覧が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} />);
      expect(screen.queryByText(/業務進捗/)).toBeNull();
    });

    it("topicTitles が空配列の場合はタイトル一覧が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} topicTitles={[]} />);
      expect(screen.queryByRole("list")).toBeNull();
    });
  });

  describe("アクションアイテムタイトル一覧", () => {
    it("actionItemTitles が渡された場合にタイトルが表示されること", () => {
      render(
        <MeetingSummary
          {...baseProps}
          actionItemTitles={["QAテスト完了レポートを共有する", "設計書を更新する"]}
        />,
      );
      expect(screen.getByText("QAテスト完了レポートを共有する")).toBeDefined();
      expect(screen.getByText("設計書を更新する")).toBeDefined();
    });

    it("actionItemTitles が渡されない場合はタイトル一覧が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} />);
      expect(screen.queryByText(/QAテスト/)).toBeNull();
    });
  });

  describe("アクションアイテム警告", () => {
    it("アクションアイテムが0件の場合に警告が表示されること", () => {
      render(<MeetingSummary {...baseProps} actionItemCount={0} />);
      expect(screen.getByText(/アクションアイテムが設定されていません/)).toBeDefined();
    });

    it("アクションアイテムが1件以上の場合は警告が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} actionItemCount={1} />);
      expect(screen.queryByText(/アクションアイテムが設定されていません/)).toBeNull();
    });

    it("アクションアイテムが複数件の場合は警告が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} actionItemCount={5} />);
      expect(screen.queryByText(/アクションアイテムが設定されていません/)).toBeNull();
    });
  });

  describe("前回との差分表示", () => {
    it("前回データがない場合は差分が表示されないこと", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={3} />);
      expect(screen.queryByText(/前回より/)).toBeNull();
      expect(screen.queryByText(/前回と同じ/)).toBeNull();
    });

    it("体調が前回より上がった場合に差分が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={4} previousConditionHealth={3} />);
      expect(screen.getByText("↑ 前回より+1")).toBeInTheDocument();
    });

    it("体調が前回と同じ場合に差分が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={3} previousConditionHealth={3} />);
      expect(screen.getByText("─ 前回と同じ")).toBeInTheDocument();
    });

    it("体調が前回より下がった場合に差分が表示されること", () => {
      render(<MeetingSummary {...baseProps} conditionHealth={1} previousConditionHealth={3} />);
      expect(screen.getByText("↓ 前回より-2")).toBeInTheDocument();
    });

    it("気分・業務量の差分も表示されること", () => {
      render(
        <MeetingSummary
          {...baseProps}
          conditionHealth={4}
          previousConditionHealth={3}
          conditionMood={3}
          previousConditionMood={3}
          conditionWorkload={2}
          previousConditionWorkload={4}
        />,
      );
      expect(screen.getByText("↑ 前回より+1")).toBeInTheDocument();
      expect(screen.getByText("─ 前回と同じ")).toBeInTheDocument();
      expect(screen.getByText("↓ 前回より-2")).toBeInTheDocument();
    });
  });
});
