import { memo } from "react";
import styles from "../../App.module.css";
import { COPY } from "../../constants/copy";
import type { AnalysisListProps } from "../../types";

const AnalysisListComponent = ({ entries }: AnalysisListProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={styles.analysisList}>
      <strong className={styles.analysisTitle}>{COPY.analysis.title}</strong>
      <ul className={styles.analysisItems}>
        {entries.map((entry, index) => (
          <li key={index} className={styles.analysisItem}>
            <div className={styles.analysisField}>
              <span className={styles.analysisLabel}>{COPY.analysis.questionLabel}</span>
              <span className={styles.analysisValue}>{entry.question}</span>
            </div>
            <div className={styles.analysisField}>
              <span className={styles.analysisLabel}>{COPY.analysis.answerLabel}</span>
              <span className={styles.analysisValue}>
                {entry.answer || COPY.analysis.fallbackAnswer}
              </span>
            </div>
            <div className={styles.analysisField}>
              <span className={styles.analysisLabel}>{COPY.analysis.feedbackLabel}</span>
              <span className={styles.analysisValue}>{entry.feedback}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AnalysisList = memo(AnalysisListComponent);
