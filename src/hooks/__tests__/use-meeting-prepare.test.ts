import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMeetingPrepare } from "../use-meeting-prepare";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@dnd-kit/core", () => ({
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

describe("useMeetingPrepare", () => {
  it("初期状態で空トピックが1つある", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].title).toBe("");
    expect(result.current.topics[0].category).toBe("WORK_PROGRESS");
  });

  it("addTopic() でトピックが1つ増える", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.addTopic();
    });
    expect(result.current.topics).toHaveLength(2);
  });

  it("removeTopic(index) で対象トピックが削除される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.addTopic();
      result.current.updateTopic(0, "title", "最初のトピック");
      result.current.updateTopic(1, "title", "2番目のトピック");
    });
    expect(result.current.topics).toHaveLength(2);
    act(() => {
      result.current.removeTopic(0);
    });
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].title).toBe("2番目のトピック");
  });

  it("updateTopic(index, 'title', value) でタイトルが更新される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.updateTopic(0, "title", "更新済みタイトル");
    });
    expect(result.current.topics[0].title).toBe("更新済みタイトル");
  });

  it("handleCarryoverToggle(id) でIDが選択される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.handleCarryoverToggle("action-1");
    });
    expect(result.current.selectedFollowUpIds.has("action-1")).toBe(true);
  });

  it("handleCarryoverToggle(id) を2回呼ぶとIDが解除される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.handleCarryoverToggle("action-1");
    });
    expect(result.current.selectedFollowUpIds.has("action-1")).toBe(true);
    act(() => {
      result.current.handleCarryoverToggle("action-1");
    });
    expect(result.current.selectedFollowUpIds.has("action-1")).toBe(false);
  });

  it("buildStartUrl() はデフォルトでクエリなしのURLを返す (/members/m1/meetings/new)", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    expect(result.current.buildStartUrl()).toBe("/members/m1/meetings/new");
  });

  it("buildStartUrl() はトピックがある場合 preparedTopics クエリを含む", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.updateTopic(0, "title", "有効なトピック");
    });
    const url = result.current.buildStartUrl();
    expect(url).toContain("preparedTopics");
    expect(url).toContain("/members/m1/meetings/new?");
  });

  it("buildStartUrl() はフォローアップIDがある場合 followUpActionIds クエリを含む", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.handleCarryoverToggle("action-abc");
    });
    const url = result.current.buildStartUrl();
    expect(url).toContain("followUpActionIds");
    expect(url).toContain("action-abc");
  });

  it("handleTopicDragEnd でドラッグ後にsortOrderが更新される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.addTopic();
      result.current.updateTopic(0, "title", "トピックA");
      result.current.updateTopic(1, "title", "トピックB");
    });
    const topicId0 = result.current.topics[0].id;
    const topicId1 = result.current.topics[1].id;
    act(() => {
      result.current.handleTopicDragEnd({
        active: { id: topicId0 },
        over: { id: topicId1 },
      } as never);
    });
    expect(result.current.topics[0].title).toBe("トピックB");
    expect(result.current.topics[0].sortOrder).toBe(0);
    expect(result.current.topics[1].title).toBe("トピックA");
    expect(result.current.topics[1].sortOrder).toBe(1);
  });

  it("handleTemplateReplace でトピックが置換される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.addTopic();
      result.current.updateTopic(0, "title", "既存のトピック");
    });
    expect(result.current.topics).toHaveLength(2);
    const template = {
      id: "regular-checkin",
      name: "定期チェックイン",
      description: "テスト",
      topics: [
        { category: "WORK_PROGRESS" as const, title: "今週の進捗" },
        { category: "ISSUES" as const, title: "困っていること" },
      ],
    };
    act(() => {
      result.current.handleTemplateReplace(template);
    });
    expect(result.current.topics).toHaveLength(2);
    expect(result.current.topics[0].title).toBe("今週の進捗");
    expect(result.current.topics[1].title).toBe("困っていること");
    expect(result.current.selectedTemplateId).toBe("regular-checkin");
  });

  it("appendTopicsFromTemplate で既存トピックにテンプレートの話題が追加される", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    act(() => {
      result.current.updateTopic(0, "title", "既存のトピック");
    });
    const template = {
      id: "regular-checkin",
      name: "定期チェックイン",
      description: "テスト",
      topics: [
        { category: "WORK_PROGRESS" as const, title: "今週の進捗" },
        { category: "ISSUES" as const, title: "困っていること" },
      ],
    };
    act(() => {
      result.current.appendTopicsFromTemplate(template);
    });
    expect(result.current.topics).toHaveLength(3);
    expect(result.current.topics[0].title).toBe("既存のトピック");
    expect(result.current.topics[1].title).toBe("今週の進捗");
    expect(result.current.topics[2].title).toBe("困っていること");
    expect(result.current.topics.map((t) => t.sortOrder)).toEqual([0, 1, 2]);
  });

  it("isPendingActionsOpen, isTemplateOpen の初期値はfalse", () => {
    const { result } = renderHook(() => useMeetingPrepare({ memberId: "m1" }));
    expect(result.current.isPendingActionsOpen).toBe(false);
    expect(result.current.isTemplateOpen).toBe(false);
  });
});
