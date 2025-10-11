import { memo } from "react";
import styles from "../../App.module.css";
import type { StatusMessagesProps } from "../../types";

const StatusMessagesComponent = ({
  statusMessage,
  speechError,
}: StatusMessagesProps) => {
  if (!statusMessage && !speechError) {
    return null;
  }

  return (
    <>
      {statusMessage ? (
        <p className={styles.status}>{statusMessage}</p>
      ) : null}
      {speechError ? <p className={styles.error}>{speechError}</p> : null}
    </>
  );
};

export const StatusMessages = memo(StatusMessagesComponent);
