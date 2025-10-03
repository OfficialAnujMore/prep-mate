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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WriterAvailability =
  | "checking"
  | "unavailable"
  | "available"
  | "downloadable"
  | "downloading"
  | "error";

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

  const [availability, setAvailability] =
    useState<WriterAvailability>("checking");
  const [writer, setWriter] = useState<any>(null);
  const [downloadPct, setDownloadPct] = useState<number | null>(null);
  const [awaitingActivation, setAwaitingActivation] = useState(false);
  const writerInitRef = useRef(false);
  const downloadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("Writer" in self)) {
      setAvailability("unavailable");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const status = await (self as any).Writer.availability();
        if (cancelled) {
          return;
        }

        if (status === "available") {
          setAvailability("available");
          return;
        }

        if (status === "downloadable" || status === "downloading") {
          setAvailability(status);
          return;
        }

        setAvailability("unavailable");
      } catch (err) {
        console.error("Failed to check Writer availability", err);
        if (!cancelled) {
          setAvailability("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const prepareWriter = useCallback(async (needsDownload: boolean) => {
    if (!("Writer" in self)) {
      return;
    }

    const baseOptions: Record<string, unknown> = {
      sharedContext: "Prime the AI interview coach for candidate sessions.",
      tone: "formal",
      format: "plain-text",
      length: "medium",
    };

    try {
      if (needsDownload) {
        setAvailability("downloading");
        setDownloadPct(0);

        baseOptions.monitor = (monitor: any) => {
          const updateProgress = (fraction: number | null) => {
            if (fraction == null) {
              return;
            }

            const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
            setDownloadPct(pct);
          };

          monitor.addEventListener("downloadprogress", (event: any) => {
            if (typeof event.loaded === "number") {
              updateProgress(event.loaded);
            }
          });

          monitor.addEventListener("downloadcomplete", () => {
            updateProgress(1);
          });
        };
      }

      const createdWriter = await (self as any).Writer.create(baseOptions);
      setWriter(createdWriter);
      if (needsDownload) {
        if (downloadTimerRef.current != null) {
          window.clearTimeout(downloadTimerRef.current);
          downloadTimerRef.current = null;
        }

        setDownloadPct(100);
        downloadTimerRef.current = window.setTimeout(() => {
          setDownloadPct(null);
          setAvailability("available");
          downloadTimerRef.current = null;
        }, 320);
      } else {
        setAvailability("available");
        setDownloadPct(null);
      }
    } catch (err) {
      console.error("Failed to create Writer", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setAvailability("downloadable");
        setAwaitingActivation(true);
      } else {
        setAvailability("error");
        setDownloadPct(null);
      }
      writerInitRef.current = false;
    }
  }, [setAwaitingActivation]);

  useEffect(() => {
    if (!("Writer" in self)) {
      setAwaitingActivation(false);
      return;
    }

    if (writer || writerInitRef.current) {
      setAwaitingActivation(false);
      return;
    }

    if (availability !== "downloadable" && availability !== "downloading") {
      setAwaitingActivation(false);
      return;
    }

    setAwaitingActivation(true);

    let activated = false;

    const activate = () => {
      if (activated) {
        return;
      }
      activated = true;
      writerInitRef.current = true;
      setAwaitingActivation(false);
      void prepareWriter(true);
    };

    const handlePointer = () => activate();
    const handleKey = () => activate();

    window.addEventListener("pointerdown", handlePointer, { once: true });
    window.addEventListener("keydown", handleKey, { once: true });

    return () => {
      activated = true;
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [availability, prepareWriter, writer]);

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current != null) {
        window.clearTimeout(downloadTimerRef.current);
        downloadTimerRef.current = null;
      }

      // cleanup if you created a writer
      try {
        writer?.destroy?.();
      } catch {}
    };
  }, [writer]);

  const writerStatus = useMemo(() => {
    switch (availability) {
      case "available":
        return {
          label: "AI engine ready",
          tone: "ready" as const,
        };
      case "downloading":
        return {
          label: `Downloading resources ${downloadPct ?? 0}%`,
          tone: "progress" as const,
        };
      case "downloadable":
        return {
          label: "Preparing AI engine…",
          tone: "progress" as const,
        };
      case "checking":
        return {
          label: "Checking AI engine…",
          tone: "progress" as const,
        };
      case "error":
        return {
          label: "We couldn't initialise the AI engine. Refresh to try again.",
          tone: "warn" as const,
        };
      case "unavailable":
      default:
        return {
          label: "AI engine unavailable in this browser.",
          tone: "warn" as const,
        };
    }
  }, [availability, downloadPct]);

  const showDownloadOverlay =
    availability === "downloading" || awaitingActivation;
  const overlayProgress = Math.max(0, Math.min(100, downloadPct ?? 0));

  return (
    <div className={styles.app}>
      {showDownloadOverlay ? (
        <div className={styles.overlay} role="status" aria-live="polite">
          <div className={styles.overlayContent}>
            <p className={styles.overlayHeading}>
              AI Interview Coach — Prepmate
            </p>
            <p className={styles.overlayBody}>
              downloading necessary content for AI Interview Coach - Prepmate
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${overlayProgress}%`,
                }}
              />
            </div>
            <span className={styles.progressValue}>
              {downloadPct != null
                ? `${Math.max(0, Math.min(100, downloadPct))}%`
                : "Preparing"}
            </span>
          </div>
        </div>
      ) : null}

      <div className={styles.shell}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>AI Interview Coach</span>
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
    </div>
  );
}

export default App;
