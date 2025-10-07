import { ChangeEvent, memo, useMemo } from "react";
import styles from "../../App.module.css";
import { Button } from "../Button/Button";
import { TextArea } from "../TextArea/TextArea";
import { COPY } from "../../constants/copy";
import { SessionInputControl } from "./SessionInputControl";
import { DIFFICULTY_LEVELS } from "../../types";
import type { SessionControlsProps } from "../../types";

const SessionControlsComponent = ({
  candidateName,
  onCandidateNameChange,
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  jobDescription,
  onJobDescriptionChange,
  onStartInterview,
  onEndInterview,
  canStart,
  disableStart,
  showEndButton,
  availability,
  onStartDownload,
}: SessionControlsProps) => {
  const difficultyIndex = useMemo(
    () => Math.max(0, DIFFICULTY_LEVELS.indexOf(difficulty)),
    [difficulty]
  );
  const difficultyLabel = useMemo(
    () => difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    [difficulty]
  );
  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onJobDescriptionChange(event.currentTarget.value);
  };

  return (
    <>
      <SessionInputControl
        type="text"
        id="candidate-name"
        label={COPY.sessionControls.nameLabel}
        value={candidateName}
        placeholder={COPY.sessionControls.namePlaceholder}
        onChange={(value) => onCandidateNameChange(value)}
      />

      <SessionInputControl
        type="range"
        id="question-count"
        label={COPY.sessionControls.questionLabel}
        value={questionCount}
        min={5}
        max={15}
        step={1}
        onChange={(value) => onQuestionCountChange(value)}
      />

      <SessionInputControl
        type="range"
        id="difficulty-level"
        label={COPY.sessionControls.difficultyLabel}
        value={difficultyIndex}
        min={0}
        max={DIFFICULTY_LEVELS.length - 1}
        step={1}
        onChange={(value) => {
          const nextDifficulty = DIFFICULTY_LEVELS[value] ?? difficulty;
          onDifficultyChange(nextDifficulty);
        }}
        valueDisplay={
          <span className={styles.sliderValue}>{difficultyLabel}</span>
        }
      />

      <TextArea
        label={COPY.sessionControls.jobDescriptionLabel}
        placeholder={COPY.sessionControls.jobDescriptionPlaceholder}
        value={jobDescription}
        onChange={handleDescriptionChange}
        helperText={COPY.sessionControls.jobDescriptionHelper}
      />

      <div className={styles.actions}>
        {availability === "available" ? (
          <Button
            className={styles.actionButton}
            variant="primary"
            onClick={onStartInterview}
            disabled={!canStart || disableStart}
          >
            {COPY.sessionControls.startInterview}
          </Button>
        ) : (
          <Button
            className={styles.actionButton}
            variant="secondary"
            onClick={onStartDownload}
          >
            {COPY.sessionControls.prepareEngine}
          </Button>
        )}
        {showEndButton ? (
          <Button
            className={styles.actionButton}
            variant="secondary"
            onClick={onEndInterview}
          >
            {COPY.sessionControls.endInterview}
          </Button>
        ) : null}
      </div>
    </>
  );
};

export const SessionControls = memo(SessionControlsComponent);
