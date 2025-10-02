import styles from "./App.module.css";
import { useState, useEffect } from 'react';
import { useInterviewManager } from "./hooks/useInterviewManager";
import { COPY } from "./constants/copy";
import { SetupInstructionsModal } from './components/SetupInstructionsModal/SetupInstructionsModal';
import { checkWriterApiAvailability } from './utils/writerApiCheck';
import { SessionControls } from "./components/SessionControls/SessionControls";
import { ActiveInterviewSection } from "./components/ActiveInterviewSection/ActiveInterviewSection";
import { LoaderList } from "./components/LoaderList/LoaderList";
import { StatusMessages } from "./components/StatusMessages/StatusMessages";
import { TranscriptPanel } from "./components/TranscriptPanel/TranscriptPanel";
import { InterviewQnAList } from "./components/InterviewQnAList/InterviewQnAList";
import { AnalysisList } from "./components/AnalysisList/AnalysisList";


function App() {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isCheckingApi, setIsCheckingApi] = useState(true);

  useEffect(() => {
    const checkApi = async () => {
      const result = await checkWriterApiAvailability();
      setShowSetupModal(result.needsSetup);
      setIsCheckingApi(false);
    };
    checkApi();
  }, []);

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
  const hasActiveSession =
    isInterviewActive ||
    interviewQnA.length > 0 ||
    analysisResults.length > 0 ||
    activeLoaders.length > 0;

  return (
    <div className={styles.app}>
      <div className={styles.panel} style={{ opacity: isCheckingApi ? 0.5 : 1, pointerEvents: isCheckingApi ? 'none' : 'auto' }}>
        <header className={styles.header}>
          <h1 className={styles.title}>{COPY.app.title}</h1>
          <p className={styles.subtitle}>{COPY.app.subtitle}</p>
        </header>

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

          <LoaderList loaders={activeLoaders} />

          <StatusMessages
            statusMessage={statusMessage}
            speechError={speechError}
          />

          <TranscriptPanel transcript={combinedTranscript} />

          <InterviewQnAList
            entries={interviewQnA}
            show={analysisResults.length === 0}
          />

          <AnalysisList entries={analysisResults} />

          {analysisError ? (
            <p className={styles.analysisError}>{analysisError}</p>
          ) : null}
        </section>
      </div>
      <SetupInstructionsModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </div>
  );
}

export default App;
