import { memo } from "react";
import styles from "../../App.module.css";
import { Button } from "../Button/Button";
import { COPY } from "../../constants/copy";
import type { ActiveInterviewSectionProps } from "../../types";

const ActiveInterviewSectionComponent = ({
  isInterviewActive,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  narrationError,
  isNarrating,
  isAnswering,
  interviewComplete,
  combinedTranscript,
  onPlayQuestion,
  onStartAnswer,
  onRestartAnswer,
  onSubmitAnswer,
}: ActiveInterviewSectionProps) => {
  if (!isInterviewActive) {
    return null;
  }

  const showControls = Boolean(currentQuestion);
  const canSubmitAnswer = combinedTranscript.trim().length > 0;

  return (
    <div className={styles.interviewSection}>
      {currentQuestion ? (
        <div className={styles.currentQuestion}>
          <span className={styles.questionLabel}>
            {COPY.activeInterview.startSpeaking} {currentQuestionIndex + 1} of{" "}
            {totalQuestions}
          </span>
          <p className={styles.questionText}>{currentQuestion}</p>
        </div>
      ) : null}

      {narrationError ? (
        <p className={styles.narrationError}>{narrationError}</p>
      ) : null}

      {showControls ? (
        <div className={styles.questionControls}>
          <Button
            variant="secondary"
            onClick={onPlayQuestion}
            disabled={isNarrating || isAnswering}
          >
            {COPY.activeInterview.playQuestion}
          </Button>

          {isAnswering ? (
            <>
              <Button variant="secondary" onClick={onRestartAnswer}>
                {COPY.activeInterview.restartAnswer}
              </Button>
              <Button
                variant="primary"
                onClick={onSubmitAnswer}
                disabled={!canSubmitAnswer}
              >
                {COPY.activeInterview.submitAnswer}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={onStartAnswer}
              disabled={isNarrating}
            >
              {COPY.activeInterview.startSpeaking}
            </Button>
          )}
        </div>
      ) : (
        <p className={styles.completionMessage}>
          {interviewComplete
            ? COPY.activeInterview.completionMessage.complete
            : COPY.activeInterview.completionMessage.loading}
        </p>
      )}
    </div>
  );
};

export const ActiveInterviewSection = memo(ActiveInterviewSectionComponent);
