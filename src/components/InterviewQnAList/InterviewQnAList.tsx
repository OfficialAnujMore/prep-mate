import { memo } from "react";
import styles from "../../App.module.css";
import { COPY } from "../../constants/copy";
import type { InterviewQnAListProps } from "../../types";

const InterviewQnAListComponent = ({ entries, show }: InterviewQnAListProps) => {
  if (!show || entries.length === 0) {
    return null;
  }

  return (
    <div className={styles.qnaList}>
      <strong className={styles.qnaTitle}>{COPY.qna.title}</strong>
      <ul className={styles.qnaItems}>
        {entries.map((entry, index) => (
          <li key={index} className={styles.qnaItem}>
            <div className={styles.qnaField}>
              <span className={styles.qnaLabel}>{COPY.qna.questionLabel}</span>
              <span className={styles.qnaValue}>{entry.question}</span>
            </div>
            <div className={styles.qnaField}>
              <span className={styles.qnaLabel}>{COPY.qna.answerLabel}</span>
              <span className={styles.qnaValue}>
                {entry.answer || COPY.qna.fallbackAnswer}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const InterviewQnAList = memo(InterviewQnAListComponent);
