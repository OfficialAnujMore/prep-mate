import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Loader.module.css";
import type { LoaderProps } from "../../types";

const DEFAULT_MESSAGE = "Working on it...";

export function Loader({ messages = [] }: LoaderProps) {
  const items = useMemo(() => {
    return messages.length > 0 ? messages : [DEFAULT_MESSAGE];
  }, [messages]);

  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number>();

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length < 2) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items]);

  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <div className={styles.textContainer}>
        <span className={styles.statusLabel}>Please wait</span>
        <span className={styles.message}>{items[index]}</span>
      </div>
    </div>
  );
}
