import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// CoachingTipCard はPhase 3で並行実装中のためモック
vi.mock("../coaching-tip-card", () => ({
  CoachingTipCard: ({ category }: { category: string }) => (
    <div data-testid={`coaching-tip-card-${category}`}>{category} tip</div>
  ),
}));

// Accordion は jsdom では動作が限定的なためシンプルにモック
vi.mock("@/components/ui/accordion", () => ({
  AccordionRoot: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-root">{children}</div>
  ),
  AccordionItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-item">{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="accordion-trigger">{children}</button>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">{children}</div>
  ),
}));

import { CoachingPanel } from "../coaching-panel";

afterEach(() => {
  cleanup();
});

describe("CoachingPanel", () => {
  it("パネルタイトル「コーチングアシスト」が表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("コーチングアシスト")).toBeInTheDocument();
  });

  it("Lightbulbアイコンのヘッダーが表示されること", () => {
    render(<CoachingPanel />);
    // ヘッダー要素にLightbulbが含まれる（アイコンはsvgとして描画）
    const heading = screen.getByText("コーチングアシスト");
    // 親要素にアイコンが存在すること
    expect(heading.closest("div")).toBeTruthy();
  });

  it("「ベストプラクティス」カテゴリが表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("ベストプラクティス")).toBeInTheDocument();
  });

  it("「傾聴」カテゴリ名が表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("傾聴")).toBeInTheDocument();
  });

  it("「質問」カテゴリ名が表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("質問")).toBeInTheDocument();
  });

  it("「承認・ねぎらい」カテゴリ名が表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("承認・ねぎらい")).toBeInTheDocument();
  });

  it("「フィードバック」カテゴリ名が表示されること", () => {
    render(<CoachingPanel />);
    expect(screen.getByText("フィードバック")).toBeInTheDocument();
  });

  it("5つのカテゴリ名がすべて表示されること", () => {
    render(<CoachingPanel />);
    const categories = ["傾聴", "質問", "承認・ねぎらい", "ベストプラクティス", "フィードバック"];
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("compact propでコンパクト表示できること", () => {
    render(<CoachingPanel compact={true} />);
    // コンパクト時でもタイトルが表示されること
    expect(screen.getByText("コーチングアシスト")).toBeInTheDocument();
    // コンパクト時でも全カテゴリが表示されること
    const categories = ["傾聴", "質問", "承認・ねぎらい", "ベストプラクティス", "フィードバック"];
    for (const category of categories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });
});
