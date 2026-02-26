import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TagData } from "../sortable-action-item";
import { TopicListSection } from "../topic-list-section";

const mockAnnouncements = {
  onDragStart: vi.fn(() => ""),
  onDragOver: vi.fn(() => ""),
  onDragEnd: vi.fn(() => ""),
  onDragCancel: vi.fn(() => ""),
};

const defaultTopic = (overrides = {}) => ({
  category: "WORK_PROGRESS",
  title: "テスト話題",
  notes: "",
  sortOrder: 0,
  tags: [] as TagData[],
  ...overrides,
});

describe("TopicListSection", () => {
  afterEach(() => cleanup());

  it("話題リストが表示される", () => {
    render(
      <TopicListSection
        topics={[defaultTopic()]}
        topicIds={["topic-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("テスト話題")).toBeTruthy();
  });

  it("「+ 話題を追加」ボタンが表示される", () => {
    render(
      <TopicListSection
        topics={[defaultTopic()]}
        topicIds={["topic-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /話題を追加/ })).toBeTruthy();
  });

  it("「+ 話題を追加」ボタンクリックで onAdd が呼ばれる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <TopicListSection
        topics={[defaultTopic()]}
        topicIds={["topic-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("複数話題が正しく表示される", () => {
    const topics = [
      defaultTopic({ title: "話題1", sortOrder: 0 }),
      defaultTopic({ title: "話題2", category: "CAREER", sortOrder: 1 }),
    ];
    render(
      <TopicListSection
        topics={topics}
        topicIds={["topic-0", "topic-1"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("話題1")).toBeTruthy();
    expect(screen.getByDisplayValue("話題2")).toBeTruthy();
  });

  it("話題が1件のときは削除ボタンが表示されない", () => {
    render(
      <TopicListSection
        topics={[defaultTopic()]}
        topicIds={["topic-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    // showDelete=false のため削除ボタンは存在しない
    expect(screen.queryByRole("button", { name: /削除/ })).toBeNull();
  });

  it("話題が2件以上のとき削除ボタンが表示される", () => {
    const topics = [
      defaultTopic({ title: "話題1", sortOrder: 0 }),
      defaultTopic({ title: "話題2", sortOrder: 1 }),
    ];
    render(
      <TopicListSection
        topics={topics}
        topicIds={["topic-0", "topic-1"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    expect(deleteButtons.length).toBe(2);
  });
});
