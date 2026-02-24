import { fireEvent } from "@testing-library/dom";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KEYBOARD_SHORTCUTS, useKeyboardShortcuts } from "../use-keyboard-shortcuts";

const defaultCallbacks = () => ({
  onNewMember: vi.fn(),
  onNewMeeting: vi.fn(),
  onShowHelp: vi.fn(),
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("KEYBOARD_SHORTCUTS 定数", () => {
  it("global コンテキストのショートカットが含まれる", () => {
    const globalShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.context === "global");
    expect(globalShortcuts.length).toBeGreaterThan(0);
  });

  it("recording コンテキストのショートカットが含まれる", () => {
    const recordingShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.context === "recording");
    expect(recordingShortcuts.length).toBeGreaterThan(0);
  });

  it("'?' キーのグローバルショートカットが定義されている", () => {
    const helpShortcut = KEYBOARD_SHORTCUTS.find((s) => s.key === "?");
    expect(helpShortcut).toBeDefined();
    expect(helpShortcut?.context).toBe("global");
  });

  it("'Space' キーの記録中ショートカットが定義されている", () => {
    const spaceShortcut = KEYBOARD_SHORTCUTS.find((s) => s.key === "Space");
    expect(spaceShortcut).toBeDefined();
    expect(spaceShortcut?.context).toBe("recording");
  });

  it("各エントリに key, description, context が含まれる", () => {
    for (const entry of KEYBOARD_SHORTCUTS) {
      expect(entry.key).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(["global", "recording"]).toContain(entry.context);
    }
  });
});

describe("useKeyboardShortcuts", () => {
  describe("ショートカット発火", () => {
    it("'n' キーで onNewMember が呼ばれる", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "n" });

      expect(callbacks.onNewMember).toHaveBeenCalledOnce();
    });

    it("'m' キーで onNewMeeting が呼ばれる", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "m" });

      expect(callbacks.onNewMeeting).toHaveBeenCalledOnce();
    });

    it("'?' キーで onShowHelp が呼ばれる", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "?" });

      expect(callbacks.onShowHelp).toHaveBeenCalledOnce();
    });

    it("関係ないキーでは何も呼ばれない", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "x" });

      expect(callbacks.onNewMember).not.toHaveBeenCalled();
      expect(callbacks.onNewMeeting).not.toHaveBeenCalled();
      expect(callbacks.onShowHelp).not.toHaveBeenCalled();
    });
  });

  describe("入力フォーカス中はショートカットを無効化", () => {
    let input: HTMLInputElement;

    beforeEach(() => {
      input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();
    });

    afterEach(() => {
      document.body.removeChild(input);
    });

    it("input フォーカス中は 'n' が無効", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "n" });

      expect(callbacks.onNewMember).not.toHaveBeenCalled();
    });

    it("input フォーカス中は 'm' が無効", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "m" });

      expect(callbacks.onNewMeeting).not.toHaveBeenCalled();
    });

    it("input フォーカス中は '?' が無効", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "?" });

      expect(callbacks.onShowHelp).not.toHaveBeenCalled();
    });
  });

  describe("textarea フォーカス中はショートカットを無効化", () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();
    });

    afterEach(() => {
      document.body.removeChild(textarea);
    });

    it("textarea フォーカス中は 'n' が無効", () => {
      const callbacks = defaultCallbacks();
      renderHook(() => useKeyboardShortcuts(callbacks));

      fireEvent.keyDown(document, { key: "n" });

      expect(callbacks.onNewMember).not.toHaveBeenCalled();
    });
  });

  describe("アンマウント時のクリーンアップ", () => {
    it("アンマウント後はキーイベントに反応しない", () => {
      const callbacks = defaultCallbacks();
      const { unmount } = renderHook(() => useKeyboardShortcuts(callbacks));

      unmount();
      fireEvent.keyDown(document, { key: "n" });

      expect(callbacks.onNewMember).not.toHaveBeenCalled();
    });
  });
});
