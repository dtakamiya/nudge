import { describe, expect, it } from "vitest";

import { createGoalSchema, goalStatus, updateGoalProgressSchema, updateGoalSchema } from "../goal";

describe("goalStatus", () => {
  it("有効なステータスを受け付ける", () => {
    for (const status of ["IN_PROGRESS", "COMPLETED", "CANCELLED"]) {
      const result = goalStatus.safeParse(status);
      expect(result.success).toBe(true);
    }
  });

  it("無効なステータスを拒否する", () => {
    const result = goalStatus.safeParse("INVALID");
    expect(result.success).toBe(false);
  });
});

describe("createGoalSchema", () => {
  it("有効な入力を受け付ける", () => {
    const result = createGoalSchema.safeParse({
      title: "TypeScript習得",
      description: "型システムの理解を深める",
      progress: 30,
      dueDate: "2026-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("タイトル空文字を拒否する", () => {
    const result = createGoalSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("進捗が0未満を拒否する", () => {
    const result = createGoalSchema.safeParse({ title: "目標", progress: -1 });
    expect(result.success).toBe(false);
  });

  it("進捗が100超を拒否する", () => {
    const result = createGoalSchema.safeParse({ title: "目標", progress: 101 });
    expect(result.success).toBe(false);
  });

  it("description・progress・dueDateは省略可能", () => {
    const result = createGoalSchema.safeParse({ title: "目標" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
      expect(result.data.progress).toBe(0);
      expect(result.data.status).toBe("IN_PROGRESS");
    }
  });

  it("小数の進捗を拒否する", () => {
    const result = createGoalSchema.safeParse({ title: "目標", progress: 33.3 });
    expect(result.success).toBe(false);
  });
});

describe("updateGoalSchema", () => {
  it("部分更新を受け付ける", () => {
    const result = updateGoalSchema.safeParse({ progress: 50 });
    expect(result.success).toBe(true);
  });

  it("全フィールド更新を受け付ける", () => {
    const result = updateGoalSchema.safeParse({
      title: "更新後",
      description: "詳細",
      progress: 80,
      status: "COMPLETED",
      dueDate: "2026-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトを受け付ける", () => {
    const result = updateGoalSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("goalProgressMode", () => {
  it("有効なモードを受け付ける", () => {
    for (const mode of ["MANUAL", "AUTO"]) {
      const result = createGoalSchema.safeParse({ title: "目標", progressMode: mode });
      expect(result.success).toBe(true);
    }
  });

  it("無効なモードを拒否する", () => {
    const result = createGoalSchema.safeParse({ title: "目標", progressMode: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("省略時はデフォルトMANUAL", () => {
    const result = createGoalSchema.safeParse({ title: "目標" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progressMode).toBe("MANUAL");
    }
  });
});

describe("updateGoalProgressSchema", () => {
  it("有効な進捗を受け付ける", () => {
    const result = updateGoalProgressSchema.safeParse({ progress: 50 });
    expect(result.success).toBe(true);
  });

  it("小数を拒否する", () => {
    const result = updateGoalProgressSchema.safeParse({ progress: 33.3 });
    expect(result.success).toBe(false);
  });

  it("0を受け付ける", () => {
    const result = updateGoalProgressSchema.safeParse({ progress: 0 });
    expect(result.success).toBe(true);
  });

  it("100を受け付ける", () => {
    const result = updateGoalProgressSchema.safeParse({ progress: 100 });
    expect(result.success).toBe(true);
  });
});
