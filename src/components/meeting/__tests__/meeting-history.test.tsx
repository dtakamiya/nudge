import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MeetingHistory } from "../meeting-history";

afterEach(() => {
  cleanup();
});

const basePagination = {
  page: 1,
  total: 0,
  pageSize: 10,
  hasNext: false,
  hasPrev: false,
};

const sampleMeeting = {
  id: "m1",
  date: new Date("2026-01-15T00:00:00Z"),
  memberId: "mem1",
  topics: [{ id: "t1", category: "WORK_PROGRESS", title: "業務進捗" }],
  actionItems: [
    { id: "a1", status: "TODO" },
    { id: "a2", status: "DONE" },
  ],
};

describe("MeetingHistory", () => {
  it("空のミーティングリストでは空状態を表示する", () => {
    render(
      <MeetingHistory meetings={[]} memberId="mem1" pagination={{ ...basePagination, total: 0 }} />,
    );
    expect(screen.getByText("まだ1on1の記録がありません")).toBeDefined();
  });

  it("ミーティング一覧を表示する", () => {
    render(
      <MeetingHistory
        meetings={[sampleMeeting]}
        memberId="mem1"
        pagination={{ ...basePagination, total: 1 }}
      />,
    );
    expect(screen.getByText("アクション: 1/2")).toBeDefined();
  });

  it("total が pageSize 以下の場合はページネーションを表示しない", () => {
    render(
      <MeetingHistory
        meetings={[sampleMeeting]}
        memberId="mem1"
        pagination={{ ...basePagination, total: 1, pageSize: 10 }}
      />,
    );
    expect(screen.queryByText("前へ")).toBeNull();
    expect(screen.queryByText("次へ")).toBeNull();
  });

  it("total が pageSize を超える場合はページネーションを表示する", () => {
    render(
      <MeetingHistory
        meetings={[sampleMeeting]}
        memberId="mem1"
        pagination={{ page: 1, total: 15, pageSize: 10, hasNext: true, hasPrev: false }}
      />,
    );
    expect(screen.getByText("前へ")).toBeDefined();
    expect(screen.getByText("次へ")).toBeDefined();
    expect(screen.getByText("15件中 1〜10件")).toBeDefined();
  });

  it("2ページ目では前へが有効、hasNext=false なら次へが無効", () => {
    render(
      <MeetingHistory
        meetings={[sampleMeeting]}
        memberId="mem1"
        pagination={{ page: 2, total: 15, pageSize: 10, hasNext: false, hasPrev: true }}
      />,
    );
    const prevBtn = screen.getByText("前へ").closest("button");
    const nextBtn = screen.getByText("次へ").closest("button");
    expect(prevBtn?.hasAttribute("disabled")).toBe(false);
    expect(nextBtn?.hasAttribute("disabled")).toBe(true);
  });
});
