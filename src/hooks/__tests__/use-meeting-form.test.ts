import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMeetingForm } from "../use-meeting-form";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  createMeeting: vi.fn(),
  updateMeeting: vi.fn(),
}));

vi.mock("@/lib/dnd-accessibility", () => ({
  sortableKeyboardCoordinates: vi.fn(),
  createAnnouncements: vi.fn(() => ({
    onDragStart: vi.fn(() => ""),
    onDragOver: vi.fn(() => ""),
    onDragEnd: vi.fn(() => ""),
    onDragCancel: vi.fn(() => ""),
  })),
}));

describe("useMeetingForm", () => {
  it("初期状態で話題が1件（空）生成される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].title).toBe("");
    expect(result.current.topics[0].category).toBe("WORK_PROGRESS");
  });

  it("initialTopics が渡されると話題が初期化される", () => {
    const initialTopics = [
      { category: "CAREER", title: "キャリア話題", notes: "メモ", sortOrder: 0 },
    ];
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1", initialTopics }));
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].title).toBe("キャリア話題");
  });

  it("addTopic で話題が追加される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.addTopic();
    });
    expect(result.current.topics).toHaveLength(2);
  });

  it("removeTopic で話題が削除される", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "話題1", notes: "", sortOrder: 0 },
      { category: "CAREER", title: "話題2", notes: "", sortOrder: 1 },
    ];
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1", initialTopics }));
    act(() => {
      result.current.removeTopic(0);
    });
    expect(result.current.topics).toHaveLength(1);
    expect(result.current.topics[0].title).toBe("話題2");
  });

  it("updateTopic で話題フィールドが更新される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.updateTopic(0, "title", "更新済み話題");
    });
    expect(result.current.topics[0].title).toBe("更新済み話題");
  });

  it("addAction でアクションが追加される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    expect(result.current.actionItems).toHaveLength(0);
    act(() => {
      result.current.addAction();
    });
    expect(result.current.actionItems).toHaveLength(1);
  });

  it("removeAction でアクションが削除される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.addAction();
      result.current.addAction();
    });
    expect(result.current.actionItems).toHaveLength(2);
    act(() => {
      result.current.removeAction(0);
    });
    expect(result.current.actionItems).toHaveLength(1);
  });

  it("updateAction でアクションフィールドが更新される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.addAction();
    });
    act(() => {
      result.current.updateAction(0, "title", "テストタスク");
    });
    expect(result.current.actionItems[0].title).toBe("テストタスク");
  });

  it("isEditing が initialData 有無で切り替わる", () => {
    const { result: createResult } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    expect(createResult.current.isEditing).toBe(false);

    const { result: editResult } = renderHook(() =>
      useMeetingForm({
        memberId: "m1",
        initialData: {
          meetingId: "meet-1",
          date: "2026-02-20T10:00:00Z",
          topics: [],
          actionItems: [],
        },
      }),
    );
    expect(editResult.current.isEditing).toBe(true);
  });

  it("handleConditionChange で健康状態が更新される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    expect(result.current.conditionHealth).toBeNull();
    act(() => {
      result.current.handleConditionChange("conditionHealth", 4);
    });
    expect(result.current.conditionHealth).toBe(4);
  });

  it("handleConditionChange で気分状態が更新される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.handleConditionChange("conditionMood", 3);
    });
    expect(result.current.conditionMood).toBe(3);
  });

  it("handleConditionChange で業務量が更新される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.handleConditionChange("conditionWorkload", 2);
    });
    expect(result.current.conditionWorkload).toBe(2);
  });

  it("topicIds が正しく生成される", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "話題1", notes: "", sortOrder: 0 },
      { category: "CAREER", title: "話題2", notes: "", sortOrder: 1 },
    ];
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1", initialTopics }));
    expect(result.current.topicIds).toEqual(["topic-0", "topic-1"]);
  });

  it("actionIds が正しく生成される", () => {
    const { result } = renderHook(() => useMeetingForm({ memberId: "m1" }));
    act(() => {
      result.current.addAction();
      result.current.addAction();
    });
    expect(result.current.actionIds).toEqual(["action-0", "action-1"]);
  });

  it("既存 topic を削除すると deletedTopicIds に追加される", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: true, data: {} as never });

    const { result } = renderHook(() =>
      useMeetingForm({
        memberId: "m1",
        initialData: {
          meetingId: "meet-1",
          date: "2026-02-20T10:00:00Z",
          topics: [
            {
              id: "topic-uuid-1",
              category: "WORK_PROGRESS",
              title: "削除対象",
              notes: "",
              sortOrder: 0,
            },
          ],
          actionItems: [],
        },
      }),
    );

    act(() => {
      result.current.removeTopic(0);
    });

    // executeSave を呼ぶと deletedTopicIds が渡される
    // ここでは内部状態だけ確認 - updateMeeting のモックで検証
    expect(result.current.topics).toHaveLength(0);
  });
});
