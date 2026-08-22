import { useEffect, useRef } from "react";

export interface ThrottledUpdatesHandle<T> {
  enqueue(value: T): void;
  flushNow(): void;
  readonly pending: number;
}

export function useThrottledUpdates<T>(
  onFlush: (values: T[]) => void
): ThrottledUpdatesHandle<T> {
  const onFlushRef = useRef(onFlush);
  onFlushRef.current = onFlush;

  const queueRef = useRef<T[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  const flush = () => {
    rafRef.current = undefined;
    const batch = queueRef.current;
    queueRef.current = [];

    if (batch.length > 0) {
      onFlushRef.current(batch);
    }
  };

  useEffect(
    () => () => {
      if (rafRef.current !== undefined) {
        window.cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  const enqueue = (value: T) => {
    queueRef.current.push(value);

    if (rafRef.current === undefined) {
      rafRef.current = window.requestAnimationFrame(flush);
    }
  };

  const flushNow = () => {
    if (rafRef.current !== undefined) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }

    flush();
  };

  const handle: ThrottledUpdatesHandle<T> = {
    enqueue,
    flushNow,
    get pending() {
      return queueRef.current.length;
    },
  };

  return handle;
}

export default useThrottledUpdates;
