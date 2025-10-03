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
// import { useCallback, useEffect, useState } from "react";

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
  const hasActiveSession =
    isInterviewActive ||
    interviewQnA.length > 0 ||
    analysisResults.length > 0 ||
    activeLoaders.length > 0;

  // const [availability, setAvailability] = useState<
  //   "unavailable" | "available" | "downloadable" | "downloading" | null
  // >(null);
  // const [writer, setWriter] = useState<any>(null);
  // const [downloadPct, setDownloadPct] = useState<number | null>(null);

  // useEffect(() => {
  //   if (!("Writer" in self)) return;
  //   // availability() is async—wrap in IIFE
  //   (async () => {
  //     try {
  //       console.log("Writer supported");
  //       const a = await (self as any).Writer.availability();
  //       setAvailability(a);
  //     } catch (err) {
  //       console.error("Failed to check Writer availability", err);
  //       setAvailability("unavailable");
  //     }
  //   })();
  // }, []);

  // const startWriter = useCallback(async () => {
  //   if (!("Writer" in self)) return;
  //   if (availability === "unavailable" || availability == null) return;

  //   const options = {
  //     sharedContext:
  //       "This is an email to acquaintances about an upcoming event.",
  //     tone: "casual",
  //     format: "plain-text",
  //     length: "medium",
  //   };

  //   try {
  //     let w;
  //     if (availability === "available") {
  //       w = await (self as any).Writer.create(options);
  //     } else {
  //       // downloadable / downloading — monitor progress
  //       // mark as downloading so UI can show overlay
  //       setAvailability("downloading");
  //       setDownloadPct(0);
  //       w = await (self as any).Writer.create({
  //         ...options,
  //         monitor(m: any) {
  //           m.addEventListener("downloadprogress", (e: any) => {
  //             const pct = Math.round((e.loaded ?? 0) * 100);
  //             console.log(`Downloaded ${pct}%`);
  //             setDownloadPct(pct);
  //             // keep availability as downloading until finished
  //             if (pct >= 100) {
  //               // slight delay to allow UI to show 100%
  //               setTimeout(() => setAvailability("available"), 250);
  //               setDownloadPct(null);
  //             }
  //           });
  //           m.addEventListener("downloadcomplete", () => {
  //             // ensure we flip state when complete
  //             setAvailability("available");
  //             setDownloadPct(null);
  //           });
  //         },
  //       });
  //     }
  //     setWriter(w);
  //   } catch (err) {
  //     console.error("Failed to create Writer", err);
  //   }
  // }, [availability]);

  // useEffect(() => {
  //   return () => {
  //     // cleanup if you created a writer
  //     try {
  //       writer?.destroy?.();
  //     } catch {}
  //   };
  // }, [writer]);

  return (
    <div className={styles.app}>
      {/* <button onClick={startWriter} disabled={availability === "unavailable"}>
        Start Writer
      </button> */}

      {/* overlay shown while writer is downloading */}
      {/* {availability === "downloading" ? (
        <div className={styles.overlay} role="status" aria-live="polite">
          <div className={styles.overlayContent}>
            <div className={styles.spinner} aria-hidden="true" />
            <div className={styles.downloadPct}>
              {downloadPct != null ? `Downloading ${downloadPct}%` : "Downloading..."}
            </div>
          </div>
        </div>
      ) : null} */}

      <div className={styles.panel}>
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
    </div>
  );
}

export default App;
