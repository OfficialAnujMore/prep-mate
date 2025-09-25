import styles from "./App.module.css";
import { Button } from "./components/Button/Button";
import { Loader } from "./components/Loader/Loader";
import { TextArea } from "./components/TextArea/TextArea";
import { useInterviewManager } from "./hooks/useInterviewManager";
import { DIFFICULTY_LEVELS } from "./types/interview";

function App() {
  const {
    jobDescription,
    setJobDescription,
    hasDescription,
    candidateName,
    setCandidateName,
    questionCount,
    setQuestionCount,
    difficulty,
    setDifficulty,
    statusMessage,
    speechError,
    combinedTranscript,
    startInterview,
    activeLoaders,
    isInterviewActive,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    handlePlayQuestion,
    handleStartAnswer,
    handleRestartAnswer,
    handleSubmitAnswer,
    isNarrating,
    isAnswering,
    interviewComplete,
    interviewQnA,
    narrationError,
    analysisResults,
    analysisError,
    endInterview,
  } = useInterviewManager();

  const hasCandidateName = candidateName.trim().length > 0;
  const isReadyToStart = hasDescription && hasCandidateName;
  const difficultyIndex = Math.max(
    0,
    DIFFICULTY_LEVELS.indexOf(difficulty)
  );
  const difficultyLabel =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const hasActiveSession =
    isInterviewActive ||
    interviewQnA.length > 0 ||
    analysisResults.length > 0 ||
    activeLoaders.length > 0;

  return (
    <div className={styles.app}>
      <div className={styles.panel}>
        <header className={styles.header}>
          {/* Reserved for future hero copy */}
        </header>

        <section className={styles.form}>
          <div className={styles.formControl}>
            <label className={styles.inputLabel} htmlFor="candidate-name">
              Your name
            </label>
            <input
              id="candidate-name"
              className={styles.textInput}
              type="text"
              placeholder="e.g., Alex Smith"
              value={candidateName}
              onChange={(event) => setCandidateName(event.currentTarget.value)}
            />
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="question-count">
              Number of questions
            </label>
            <div className={styles.sliderControl}>
              <input
                id="question-count"
                className={styles.slider}
                type="range"
                min={3}
                max={15}
                step={1}
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(Number(event.currentTarget.value))
                }
              />
              <span className={styles.sliderValue}>{questionCount}</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="difficulty-level">
              Difficulty
            </label>
            <div className={styles.sliderControl}>
              <input
                id="difficulty-level"
                className={styles.slider}
                type="range"
                min={0}
                max={DIFFICULTY_LEVELS.length - 1}
                step={1}
                value={difficultyIndex}
                onChange={(event) =>
                  setDifficulty(
                    DIFFICULTY_LEVELS[Number(event.currentTarget.value)]
                  )
                }
              />
              <span className={styles.sliderValue}>{difficultyLabel}</span>
            </div>
          </div>

          <TextArea
            label="Job description / prompt"
            placeholder="Paste the prompt you'd like PrepMate to explore with you..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.currentTarget.value)}
            helperText="Your text stays on this device—nothing gets stored."
          />

          <Button
            className={styles.actionButton}
            variant="primary"
            onClick={startInterview}
            disabled={!isReadyToStart || isInterviewActive}
          >
            Start interview
          </Button>

          {hasActiveSession ? (
            <Button
              className={styles.actionButton}
              variant="secondary"
              onClick={endInterview}
            >
              End interview
            </Button>
          ) : null}

          {isInterviewActive ? (
            <div className={styles.interviewSection}>
              {currentQuestion ? (
                <div className={styles.currentQuestion}>
                  <span className={styles.questionLabel}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <p className={styles.questionText}>{currentQuestion}</p>
                </div>
              ) : null}

              {narrationError ? (
                <p className={styles.narrationError}>{narrationError}</p>
              ) : null}

              {currentQuestion ? (
                <div className={styles.questionControls}>
                  <Button
                    variant="secondary"
                    onClick={handlePlayQuestion}
                    disabled={isNarrating}
                  >
                    Play question
                  </Button>

                  {isAnswering ? (
                    <>
                      <Button variant="secondary" onClick={handleRestartAnswer}>
                        Restart
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSubmitAnswer}
                        disabled={combinedTranscript.trim().length === 0}
                      >
                        Submit answer
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleStartAnswer}
                      disabled={isNarrating}
                    >
                      Start speaking
                    </Button>
                  )}
                </div>
              ) : (
                <p className={styles.completionMessage}>
                  {interviewComplete
                    ? "All questions complete. Review your notes below."
                    : "Preparing next question..."}
                </p>
              )}
            </div>
          ) : null}

          {activeLoaders.length > 0 ? (
            <div className={styles.loaders}>
              {activeLoaders.map((loader) => (
                <Loader key={loader.id} messages={loader.messages} />
              ))}
            </div>
          ) : null}



          {statusMessage ? (
            <p className={styles.status}>{statusMessage}</p>
          ) : null}
          {speechError ? <p className={styles.error}>{speechError}</p> : null}

          {combinedTranscript ? (
            <div className={styles.transcript}>
              <strong className={styles.transcriptTitle}>
                Captured transcript
              </strong>
              <p className={styles.transcriptText}>{combinedTranscript}</p>
              <p className={styles.transcriptHint}>
                This transcription is ready to send to Gemini Nano for deep-dive
                analysis.
              </p>
            </div>
          ) : null}

          {interviewQnA.length > 0 && analysisResults.length === 0 ? (
            <div className={styles.qnaList}>
              <strong className={styles.qnaTitle}>Interview Q&amp;A</strong>
              <ul className={styles.qnaItems}>
                {interviewQnA.map((entry, index) => (
                  <li key={index} className={styles.qnaItem}>
                    <div className={styles.qnaField}>
                      <span className={styles.qnaLabel}>Question:</span>
                      <span className={styles.qnaValue}>{entry.question}</span>
                    </div>
                    <div className={styles.qnaField}>
                      <span className={styles.qnaLabel}>Your answer:</span>
                      <span className={styles.qnaValue}>
                        {entry.answer || "No answer captured."}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysisResults.length > 0 ? (
            <div className={styles.analysisList}>
              <strong className={styles.analysisTitle}>
                Answer review &amp; improvements
              </strong>
              <ul className={styles.analysisItems}>
                {analysisResults.map((entry, index) => (
                  <li key={index} className={styles.analysisItem}>
                    <div className={styles.analysisField}>
                      <span className={styles.analysisLabel}>Question:</span>
                      <span className={styles.analysisValue}>{entry.question}</span>
                    </div>
                    <div className={styles.analysisField}>
                      <span className={styles.analysisLabel}>Your answer:</span>
                      <span className={styles.analysisValue}>
                        {entry.answer || "No answer captured."}
                      </span>
                    </div>
                    <div className={styles.analysisField}>
                      <span className={styles.analysisLabel}>Feedback:</span>
                      <span className={styles.analysisValue}>{entry.feedback}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysisError ? (
            <p className={styles.analysisError}>{analysisError}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default App;
