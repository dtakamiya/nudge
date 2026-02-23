import { useEffect, useState } from "react";

export type ElapsedTime = {
  minutes: number;
  seconds: number;
  formatted: string;
};

const ZERO_ELAPSED: ElapsedTime = { minutes: 0, seconds: 0, formatted: "00:00" };

function calculateElapsed(startedAt: Date): ElapsedTime {
  const diffMs = Date.now() - startedAt.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const formatted = hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;

  return { minutes, seconds, formatted };
}

export function useElapsedTime(startedAt: Date | null): ElapsedTime {
  const [elapsed, setElapsed] = useState<ElapsedTime>(() =>
    startedAt ? calculateElapsed(startedAt) : ZERO_ELAPSED,
  );

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const interval = setInterval(() => {
      setElapsed(calculateElapsed(startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) {
    return ZERO_ELAPSED;
  }

  return elapsed;
}
