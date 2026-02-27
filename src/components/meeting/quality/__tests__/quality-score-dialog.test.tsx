import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QualityScoreDialog } from "../quality-score-dialog";

describe("QualityScoreDialog", () => {
  it("open=true のときダイアログが表示される", () => {
    render(<QualityScoreDialog open={true} onSubmit={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText("ミーティングの振り返り")).toBeInTheDocument();
  });

  it("満足度と有用度の2つのレーティングが表示される", () => {
    render(<QualityScoreDialog open={true} onSubmit={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText("満足度")).toBeInTheDocument();
    expect(screen.getByText("有用度")).toBeInTheDocument();
  });

  it("スキップボタンをクリックすると onSkip が呼ばれる", () => {
    const onSkip = vi.fn();
    render(<QualityScoreDialog open={true} onSubmit={vi.fn()} onSkip={onSkip} />);
    fireEvent.click(screen.getByRole("button", { name: "スキップ" }));
    expect(onSkip).toHaveBeenCalled();
  });

  it("保存ボタンをクリックすると onSubmit がスコア付きで呼ばれる", () => {
    const onSubmit = vi.fn();
    render(<QualityScoreDialog open={true} onSubmit={onSubmit} onSkip={vi.fn()} />);

    // 満足度の3番目の星をクリック
    const radiogroups = screen.getAllByRole("radiogroup");
    const qualityStars = radiogroups[0].querySelectorAll('[role="radio"]');
    fireEvent.click(qualityStars[2]);

    // 有用度の4番目の星をクリック
    const usefulnessStars = radiogroups[1].querySelectorAll('[role="radio"]');
    fireEvent.click(usefulnessStars[3]);

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSubmit).toHaveBeenCalledWith({
      qualityScore: 3,
      usefulnessScore: 4,
    });
  });

  it("スコア未選択で保存すると null が渡される", () => {
    const onSubmit = vi.fn();
    render(<QualityScoreDialog open={true} onSubmit={onSubmit} onSkip={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSubmit).toHaveBeenCalledWith({
      qualityScore: null,
      usefulnessScore: null,
    });
  });
});
