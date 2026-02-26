import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecordingTopicItem } from "../recording-topic-item";

const defaultTopic = {
  id: "topic-1",
  category: "WORK_PROGRESS",
  title: "業務進捗の確認",
  notes: "初期メモ内容",
};

describe("RecordingTopicItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("カテゴリとタイトルが表示される", () => {
    render(<RecordingTopicItem topic={defaultTopic} onNotesChange={vi.fn()} />);
    expect(screen.getByText("業務進捗")).toBeTruthy();
    expect(screen.getByText("業務進捗の確認")).toBeTruthy();
  });

  it("Textarea に初期ノートが表示される", () => {
    render(<RecordingTopicItem topic={defaultTopic} onNotesChange={vi.fn()} />);
    const textarea = screen.getByRole("textbox");
    expect((textarea as HTMLTextAreaElement).value).toBe("初期メモ内容");
  });

  it("notes が null の場合は空文字が表示される", () => {
    const topicWithNullNotes = { ...defaultTopic, notes: null };
    render(<RecordingTopicItem topic={topicWithNullNotes} onNotesChange={vi.fn()} />);
    const textarea = screen.getByRole("textbox");
    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("Textarea に入力すると onNotesChange が呼ばれる", async () => {
    const user = userEvent.setup();
    const onNotesChange = vi.fn();
    render(
      <RecordingTopicItem topic={{ ...defaultTopic, notes: "" }} onNotesChange={onNotesChange} />,
    );
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "A");
    expect(onNotesChange).toHaveBeenCalled();
    expect(onNotesChange).toHaveBeenCalledWith("topic-1", "A");
  });

  it("Textarea からフォーカスが外れると onBlur が呼ばれる", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<RecordingTopicItem topic={defaultTopic} onNotesChange={vi.fn()} onBlur={onBlur} />);
    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    await user.tab();
    expect(onBlur).toHaveBeenCalledWith("topic-1");
  });
});
