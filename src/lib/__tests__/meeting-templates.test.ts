import { describe, it, expect } from "vitest";
import { MEETING_TEMPLATES } from "../meeting-templates";

describe("MEETING_TEMPLATES", () => {
  it("contains exactly 4 templates", () => {
    expect(MEETING_TEMPLATES).toHaveLength(4);
  });

  it("each template has required fields", () => {
    for (const template of MEETING_TEMPLATES) {
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("description");
      expect(template).toHaveProperty("topics");
      expect(typeof template.id).toBe("string");
      expect(typeof template.name).toBe("string");
      expect(typeof template.description).toBe("string");
      expect(Array.isArray(template.topics)).toBe(true);
    }
  });

  it("each topic has valid category and title", () => {
    const validCategories = ["WORK_PROGRESS", "CAREER", "ISSUES", "FEEDBACK", "OTHER"];
    for (const template of MEETING_TEMPLATES) {
      for (const topic of template.topics) {
        expect(validCategories).toContain(topic.category);
        expect(topic.title.length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique template ids", () => {
    const ids = MEETING_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes a free template with no topics", () => {
    const free = MEETING_TEMPLATES.find((t) => t.id === "free");
    expect(free).toBeDefined();
    expect(free!.topics).toHaveLength(0);
  });
});
