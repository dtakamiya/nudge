"use client";

import { useEffect } from "react";

import { useNotifications } from "@/hooks/use-notifications";

export function NotificationInitializer() {
  const { isSupported, isEnabled, permission, requestPermission, checkAndNotify } =
    useNotifications();

  useEffect(() => {
    if (!isSupported) return;

    // 初回起動時に通知許可をリクエスト（まだ許可/拒否していない場合のみ）
    if (permission === "default") {
      requestPermission();
      return;
    }

    // 通知が有効かつ許可済みの場合はチェックを実行
    if (isEnabled && permission === "granted") {
      checkAndNotify();
    }
  }, [isSupported, isEnabled, permission, requestPermission, checkAndNotify]);

  return null;
}
