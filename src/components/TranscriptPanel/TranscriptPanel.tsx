import { memo } from "react";
import styles from "../../App.module.css";
import { COPY } from "../../constants/copy";

type TranscriptPanelProps = {
  transcript: string;
};

const TranscriptPanelComponent = ({ transcript }: TranscriptPanelProps) => {
  if (!transcript) {
    return null;
  }

  return (
    <div className={styles.transcript}>
      <strong className={styles.transcriptTitle}>{COPY.transcript.title}</strong>
      <p className={styles.transcriptText}>{transcript}</p>
      <p className={styles.transcriptHint}>{COPY.transcript.hint}</p>
    </div>
  );
};

export const TranscriptPanel = memo(TranscriptPanelComponent);
