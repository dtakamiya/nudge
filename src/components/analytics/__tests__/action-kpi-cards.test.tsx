import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ActionKpiCards } from "../action-kpi-cards";

afterEach(cleanup);

describe("ActionKpiCards", () => {
  describe("期限遵守率の表示", () => {
    it("onTimeRate を丸めてパーセント表示する", () => {
      render(<ActionKpiCards onTimeRate={85.7} averageDays={0} />);
      expect(screen.getByText("86%")).toBeDefined();
    });
  });

  describe("平均完了日数の表示", () => {
    it("正の値（遅延）の場合は「X.X 日遅延」と赤系テキストで表示する", () => {
      render(<ActionKpiCards onTimeRate={80} averageDays={3.2} />);
      expect(screen.getByTestId("avg-days-value").textContent).toBe("3.2 日遅延");
    });

    it("負の値（前倒し）の場合は絶対値で「X.X 日前倒し」と緑系テキストで表示する", () => {
      render(<ActionKpiCards onTimeRate={80} averageDays={-5.9} />);
      expect(screen.getByTestId("avg-days-value").textContent).toBe("5.9 日前倒し");
    });

    it("ゼロの場合は「期限通り」と表示する", () => {
      render(<ActionKpiCards onTimeRate={80} averageDays={0} />);
      expect(screen.getByTestId("avg-days-value").textContent).toBe("期限通り");
    });

    it("負の整数値も正しく絶対値表示する", () => {
      render(<ActionKpiCards onTimeRate={80} averageDays={-2.0} />);
      expect(screen.getByTestId("avg-days-value").textContent).toBe("2.0 日前倒し");
    });

    it("大きな遅延値も正しく表示する", () => {
      render(<ActionKpiCards onTimeRate={80} averageDays={14.5} />);
      expect(screen.getByTestId("avg-days-value").textContent).toBe("14.5 日遅延");
    });
  });
});
