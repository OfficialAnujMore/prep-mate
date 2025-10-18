import styles from "./App.module.css";
import { useInterviewManager } from "./hooks/useInterviewManager";
import { COPY } from "./constants/copy";
import { SessionControls } from "./components/SessionControls/SessionControls";
import { ActiveInterviewSection } from "./components/ActiveInterviewSection/ActiveInterviewSection";
import { LoaderList } from "./components/LoaderList/LoaderList";
import { StatusMessages } from "./components/StatusMessages/StatusMessages";
import { TranscriptPanel } from "./components/TranscriptPanel/TranscriptPanel";
import { InterviewQnAList } from "./components/InterviewQnAList/InterviewQnAList";
import { AnalysisList } from "./components/AnalysisList/AnalysisList";
import useDownloadManager from "./hooks/useDownloadManager";
import { useMemo, useState } from "react";
import { Button } from "./components/Button/Button";
import { Footer } from "./components/Footer/Footer";

const WRITER_LOADER_ID = "writer-status";

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
    isAnalyzingAnswers,
    runAnswerAnalysis,
    resetAnalysisResults,
    endInterview,
  } = useInterviewManager();

  const { writerStatus, availability, onStartDownload } = useDownloadManager();

  const hasCandidateName = candidateName.trim().length > 0;
  const isReadyToStart = hasDescription && hasCandidateName;
  const hasActiveSession =
    isInterviewActive ||
    interviewQnA.length > 0 ||
    analysisResults.length > 0 ||
    activeLoaders.length > 0;
  const [isWriterLoaderActive, setIsWriterLoaderActive] = useState(false);

  const startAIEngineDownload = async () => {
    setIsWriterLoaderActive(true);
    try {
      await onStartDownload();
    } finally {
      setIsWriterLoaderActive(false);
    }
  };

  const mergedLoaders = useMemo(() => {
    if (!isWriterLoaderActive) {
      return activeLoaders;
    }

    const withoutWriterLoader = activeLoaders.filter(
      (loader) => loader.id !== WRITER_LOADER_ID
    );

    return [
      ...withoutWriterLoader,
      {
        id: WRITER_LOADER_ID,
        messages: [writerStatus.label],
      },
    ];
  }, [activeLoaders, isWriterLoaderActive, writerStatus.label]);

  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>{COPY.app.heading}</span>
          <h1 className={styles.title}>{COPY.app.title}</h1>
          <p className={styles.subtitle}>{COPY.app.subtitle}</p>
        </section>

        <div className={styles.panel}>
          <div
            className={`${styles.writerStatusBar} ${
              styles[
                `writerStatus${writerStatus.tone
                  .charAt(0)
                  .toUpperCase()}${writerStatus.tone.slice(1)}`
              ]
            }`}
          >
            <span
              className={`${styles.statusDot} ${
                styles[
                  `statusDot${writerStatus.tone
                    .charAt(0)
                    .toUpperCase()}${writerStatus.tone.slice(1)}`
                ]
              }`}
              aria-hidden="true"
            />
            <span className={styles.statusText}>{writerStatus.label}</span>
          </div>

          {availability !== "unavailable" && availability !== "error" ? (
            <section className={styles.form}>
              <SessionControls
                candidateName={candidateName}
                onCandidateNameChange={setCandidateName}
                questionCount={questionCount}
                onQuestionCountChange={setQuestionCount}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onStartInterview={startInterview}
                onEndInterview={endInterview}
                canStart={isReadyToStart}
                disableStart={isInterviewActive}
                showEndButton={hasActiveSession}
                availability={availability}
                onStartDownload={startAIEngineDownload}
                canResetFeedback={analysisResults.length > 0}
                onResetFeedback={resetAnalysisResults}
              />

              <ActiveInterviewSection
                isInterviewActive={isInterviewActive}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                narrationError={narrationError}
                isNarrating={isNarrating}
                isAnswering={isAnswering}
                interviewComplete={interviewComplete}
                combinedTranscript={combinedTranscript}
                onPlayQuestion={handlePlayQuestion}
                onStartAnswer={handleStartAnswer}
                onRestartAnswer={handleRestartAnswer}
                onSubmitAnswer={handleSubmitAnswer}
              />

              <LoaderList loaders={mergedLoaders} />

              <StatusMessages
                statusMessage={statusMessage}
                speechError={speechError}
              />

              <TranscriptPanel transcript={combinedTranscript} />

              {analysisError ? (
                <div className={styles.analysisErrorBlock}>
                  <p className={styles.analysisError}>{analysisError}</p>
                  <Button
                    variant="secondary"
                    onClick={runAnswerAnalysis}
                    disabled={isAnalyzingAnswers}
                  >
                    {COPY.analysis.retryAnalysis}
                  </Button>
                </div>
              ) : null}

              <InterviewQnAList
                entries={interviewQnA}
                show={analysisResults.length === 0}
              />

              <AnalysisList entries={analysisResults} />
            </section>
          ) : null}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
