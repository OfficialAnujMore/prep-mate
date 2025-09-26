import { memo } from "react";
import styles from "../../App.module.css";

type StatusMessagesProps = {
  statusMessage: string | null;
  speechError: string | null;
};

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
