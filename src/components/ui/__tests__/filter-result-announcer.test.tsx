import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FilterResultAnnouncer } from "../filter-result-announcer";

afterEach(() => {
  cleanup();
});

describe("FilterResultAnnouncer", () => {
  it("aria-live='polite' の通知エリアが存在する", () => {
    const { container } = render(<FilterResultAnnouncer count={5} itemLabel="アクション" />);
    const region = container.querySelector("[aria-live='polite']");
    expect(region).not.toBeNull();
  });

  it("初回レンダリング時はメッセージが空（通知を発しない）", () => {
    const { container } = render(<FilterResultAnnouncer count={5} itemLabel="アクション" />);
    const region = container.querySelector("[aria-live='polite']");
    // aria-live region は存在するが初回はメッセージが空
    expect(region?.textContent).toBe("");
  });

  it("sr-only クラスが付与されている", () => {
    const { container } = render(<FilterResultAnnouncer count={5} itemLabel="アクション" />);
    const region = container.querySelector("[aria-live='polite']");
    expect(region?.className).toContain("sr-only");
  });
});
