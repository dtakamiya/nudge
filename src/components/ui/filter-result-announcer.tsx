"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  readonly count: number;
  readonly itemLabel: string;
  readonly emptyMessage?: string;
};

export function FilterResultAnnouncer({ count, itemLabel, emptyMessage }: Props) {
  const [message, setMessage] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      setMessage(
        count === 0
          ? (emptyMessage ?? `該当する${itemLabel}が見つかりませんでした`)
          : `${count} 件の${itemLabel}が見つかりました`,
      );
    }, 0);
    return () => clearTimeout(id);
  }, [count, itemLabel, emptyMessage]);

  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
