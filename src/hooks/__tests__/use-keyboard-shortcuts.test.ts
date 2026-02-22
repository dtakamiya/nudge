import { fireEvent } from "@testing-library/dom";
import { renderHook } from "@testing-library/react";
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardShortcuts } from "../use-keyboard-shortcuts";

const defaultCallbacks = () => ({
  onNewMember: vi.fn(),
  onNewMeeting: vi.fn(),
  onShowHelp: vi.fn(),
});

afterEach(() => {
  vi.clearAllMocks();
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
