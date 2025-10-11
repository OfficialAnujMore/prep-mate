import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeAnswersWithWriter,
  generateInterviewQuestions,
  generateKeywords,
  verifyJobDescription,
} from "../services/interviewService";
import { COPY } from "../constants/copy";
import type {
  AnswerFeedback,
  InterviewAnswer,
  InterviewDifficulty,
  InterviewManagerReturn,
  LoaderConfig,
  SessionPhase,
  WriterGlobal,
} from "../types";
import { useSpeechRecognition } from "./useSpeechRecognition";

export function useInterviewManager(): InterviewManagerReturn {
  const copy = COPY.interviewManager;
  const { status, errors, loaders, logs } = copy;

  const [candidateName, setCandidateName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [phase, setPhase] = useState<SessionPhase>("request-permission");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualPause, setManualPause] = useState(false);
  const startInFlightRef = useRef(false);
  const [activeLoaders, setActiveLoaders] = useState<LoaderConfig[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [autoListeningEnabled, setAutoListeningEnabled] = useState(true);
  const [generatedQuestionsList, setGeneratedQuestionsList] = useState<
    string[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewQnA, setInterviewQnA] = useState<InterviewAnswer[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnswerFeedback[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzingAnswers, setIsAnalyzingAnswers] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sessionTokenRef = useRef(0);
  
  const startLoader = useCallback((id: string, messages: string[]) => {
    setActiveLoaders((prev) => {
      const withoutCurrent = prev.filter((loader) => loader.id !== id);
      return [...withoutCurrent, { id, messages }];
    });
  }, []);

  const stopLoader = useCallback((id: string) => {
    setActiveLoaders((prev) => prev.filter((loader) => loader.id !== id));
  }, []);

  const {
    isSupported,
    hasPermission,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const hasDescription = jobDescription.trim().length > 0;
  const hasCandidateName = candidateName.trim().length > 0;

  useEffect(() => {
    if (!isSupported) {
      setStatusMessage(status.speechUnsupported);
    }
  }, [isSupported, status.speechUnsupported]);

  useEffect(() => {
    if (isInterviewActive) {
      return;
    }

    if (!autoListeningEnabled) {
      startInFlightRef.current = false;
      stopListening();
      return;
    }

    if (!hasPermission) {
      setManualPause(false);
      setPhase("request-permission");
      setStatusMessage(status.allowMic);
      stopListening();
      resetTranscript();
      return;
    }

    if (!hasCandidateName) {
      setManualPause(false);
      setPhase("paste-description");
      setStatusMessage(status.nameRequired);
      stopListening();
      resetTranscript();
      return;
    }

    if (!hasDescription) {
      setManualPause(false);
      setPhase("paste-description");
      setStatusMessage(status.descriptionRequired);
      stopListening();
      resetTranscript();
      return;
    }

    if (manualPause) {
      setPhase("paused");
      setStatusMessage(status.paused);
      return;
    }

    if (isListening) {
      setPhase("listening");
      setStatusMessage(status.listening);
      return;
    }

    if (startInFlightRef.current) {
      setPhase("starting-listener");
      setStatusMessage(status.preparingMic);
      return;
    }

    setPhase("starting-listener");
    setStatusMessage(status.preparingMic);
    startInFlightRef.current = true;

    (async () => {
      try {
        await startListening();
        setPhase("listening");
        setStatusMessage(status.listening);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : errors.microphoneAccess;
        setStatusMessage(message);
        setManualPause(true);
        setPhase("paused");
      } finally {
        startInFlightRef.current = false;
      }
    })();
  }, [
    errors.microphoneAccess,
    autoListeningEnabled,
    hasCandidateName,
    hasDescription,
    hasPermission,
    isInterviewActive,
    isListening,
    manualPause,
    resetTranscript,
    startListening,
    status.allowMic,
    status.descriptionRequired,
    status.listening,
    status.nameRequired,
    status.paused,
    status.preparingMic,
    stopListening,
  ]);

  useEffect(() => {
    if (!hasDescription) {
      resetTranscript();
    }
  }, [hasDescription, resetTranscript]);

  const combinedTranscript = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(" ").trim(),
    [interimTranscript, transcript]
  );

  const currentQuestion = useMemo(() => {
    if (
      currentQuestionIndex < 0 ||
      currentQuestionIndex >= generatedQuestionsList.length
    ) {
      return null;
    }

    return generatedQuestionsList[currentQuestionIndex];
  }, [currentQuestionIndex, generatedQuestionsList]);

  const speakQuestion = useCallback(
    (text: string) => {
      if (!text) {
        return Promise.resolve();
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setNarrationError(errors.speechSynthesisUnsupported);
        return Promise.resolve();
      }

      setNarrationError(null);
      window.speechSynthesis.cancel();

      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        setIsNarrating(true);

        utterance.onend = () => {
          setIsNarrating(false);
          utteranceRef.current = null;
          resolve();
        };

        utterance.onerror = () => {
          setIsNarrating(false);
          setNarrationError(errors.playQuestion);
          utteranceRef.current = null;
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [errors.playQuestion, errors.speechSynthesisUnsupported]
  );

  const endInterview = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    stopListening();
    resetTranscript();

    utteranceRef.current = null;

    setAutoListeningEnabled(false);
    setIsInterviewActive(false);
    setInterviewComplete(false);
    setManualPause(false);
    setIsAnswering(false);
    setIsNarrating(false);
    setNarrationError(null);
    setStatusMessage(status.interviewEnded);

    setGeneratedQuestionsList([]);
    setCurrentQuestionIndex(0);
    setInterviewQnA([]);
    setAnalysisResults([]);
    setAnalysisError(null);
    setIsAnalyzingAnswers(false);
    setActiveLoaders([]);

    startInFlightRef.current = false;
    sessionTokenRef.current += 1;
  }, [resetTranscript, status.interviewEnded, stopListening]);

  const handlePlayQuestion = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    speakQuestion(currentQuestion);
  }, [currentQuestion, speakQuestion]);

  const handleStartAnswer = useCallback(async () => {
    try {
      if (!isInterviewActive || !currentQuestion) {
        return;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      resetTranscript();
      await startListening();
      setIsAnswering(true);
      setStatusMessage(status.recordingAnswer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : errors.startRecording;
      setStatusMessage(message);
    }
  }, [
    currentQuestion,
    errors.startRecording,
    isInterviewActive,
    resetTranscript,
    startListening,
    status.recordingAnswer,
  ]);

  const handleRestartAnswer = useCallback(async () => {
    if (!isAnswering) {
      return;
    }

    resetTranscript();
    if (!isListening) {
      try {
        await startListening();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : errors.restartRecording;
        setStatusMessage(message);
        return;
      }
    }
    setStatusMessage(status.recordingRestarted);
  }, [
    errors.restartRecording,
    isAnswering,
    isListening,
    resetTranscript,
    startListening,
    status.recordingRestarted,
  ]);

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    const answer = combinedTranscript.trim();
    stopListening();
    setIsAnswering(false);

    setInterviewQnA((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer,
      },
    ]);

    setCurrentQuestionIndex((prev) => prev + 1);
  }, [combinedTranscript, currentQuestion, stopListening]);

  const runAnswerAnalysis = useCallback(async () => {
    if (interviewQnA.length === 0) {
      return;
    }

    const analysisLoader = loaders.analysis;
    startLoader(analysisLoader.id, analysisLoader.messages);
    setIsAnalyzingAnswers(true);
    setAnalysisError(null);

    try {
      const feedback = await analyzeAnswersWithWriter(interviewQnA);
      setAnalysisResults(feedback);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : errors.analyzeAnswers;
      setAnalysisError(message);
      setAnalysisResults([]);
    } finally {
      setIsAnalyzingAnswers(false);
      stopLoader(analysisLoader.id);
    }
  }, [
    errors.analyzeAnswers,
    interviewQnA,
    loaders.analysis,
    startLoader,
    stopLoader,
  ]);

  useEffect(() => {
    if (analysisResults.length > 0) {
      setAutoListeningEnabled(false);
      stopListening();
    }
  }, [analysisResults.length, stopListening]);

  useEffect(() => {
    if (!isInterviewActive) {
      return;
    }

    stopListening();
    setIsAnswering(false);
    resetTranscript();

    if (!currentQuestion) {
      setInterviewComplete(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setStatusMessage(status.interviewComplete);
      return;
    }

    setInterviewComplete(false);
    setStatusMessage(
      status.questionProgress(
        currentQuestionIndex + 1,
        generatedQuestionsList.length
      )
    );

    speakQuestion(currentQuestion);
  }, [
    currentQuestion,
    currentQuestionIndex,
    generatedQuestionsList.length,
    isInterviewActive,
    resetTranscript,
    speakQuestion,
    status.interviewComplete,
    status.questionProgress,
    stopListening,
  ]);

  useEffect(() => {
    if (!interviewComplete || interviewQnA.length === 0) {
      return;
    }

    if (analysisResults.length > 0 || isAnalyzingAnswers || analysisError) {
      return;
    }

    runAnswerAnalysis();
  }, [
    analysisResults.length,
    analysisError,
    interviewComplete,
    interviewQnA,
    isAnalyzingAnswers,
    runAnswerAnalysis,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startInterview = useCallback(async () => {
    const writerGlobal = (self as typeof self & { Writer?: WriterGlobal })
      .Writer;

    if (!writerGlobal) {
      return;
    }

    setAutoListeningEnabled(true);

    const trimmedName = candidateName.trim();
    if (!trimmedName) {
      setStatusMessage(status.nameRequired);
      return;
    }

    const availability = await writerGlobal.availability();

    if (availability === "unavailable") {
      return;
    }

    if (availability === "available") {
      const sessionToken = ++sessionTokenRef.current;
      const keywordLoader = loaders.keywords;
      const questionLoader = loaders.questions;

      setInterviewQnA([]);
      setGeneratedQuestionsList([]);
      setCurrentQuestionIndex(0);
      setInterviewComplete(false);
      setIsInterviewActive(false);
      setAnalysisResults([]);
      setAnalysisError(null);
      setIsAnalyzingAnswers(false);

      startLoader(keywordLoader.id, keywordLoader.messages);

      let keywordGenerator: { keywords: string[] } | null = null;

      try {
        const jdVerification = await verifyJobDescription(jobDescription);

        if (sessionToken !== sessionTokenRef.current) {
          return;
        }

        if (!jdVerification.result) {
          setStatusMessage(errors.jobDescriptionInvalid);
          return;
        }

        keywordGenerator = await generateKeywords(jobDescription);
        if (sessionToken !== sessionTokenRef.current) {
          return;
        }
      } catch (error) {
        if (sessionToken !== sessionTokenRef.current) {
          return;
        }
        console.error("Failed to generate keywords", error);
        setStatusMessage(errors.keywordsUnavailable);
        return;
      } finally {
        stopLoader(keywordLoader.id);
      }

      if (sessionToken !== sessionTokenRef.current) {
        return;
      }

      if (
        !keywordGenerator ||
        !Array.isArray(keywordGenerator.keywords) ||
        keywordGenerator.keywords.length === 0
      ) {
        console.warn(logs.noKeywordsReturned);
        setStatusMessage(errors.noKeywordsFound);
        return;
      }

      startLoader(questionLoader.id, questionLoader.messages);

      try {
        const generatedQuestions = await generateInterviewQuestions({
          keywords: keywordGenerator.keywords,
          questionCount,
          difficulty,
          candidateName: trimmedName,
        });
        if (sessionToken !== sessionTokenRef.current) {
          return;
        }

        if (
          generatedQuestions &&
          Array.isArray(generatedQuestions.questions) &&
          generatedQuestions.questions.length > 0
        ) {
          setGeneratedQuestionsList(generatedQuestions.questions);
          setCurrentQuestionIndex(0);
          setInterviewQnA([]);
          setIsInterviewActive(true);
          setStatusMessage(status.preparingFirstQuestion(trimmedName));
        } else {
          setStatusMessage(errors.noQuestionsReturned);
        }
      } catch (error) {
        if (sessionToken !== sessionTokenRef.current) {
          return;
        }
        console.error("Failed to generate questions", error);
        setStatusMessage(errors.questionsUnavailable);
        return;
      } finally {
        stopLoader(questionLoader.id);
      }

      if (sessionToken !== sessionTokenRef.current) {
        return;
      }
    }
  }, [
    candidateName,
    errors.jobDescriptionInvalid,
    errors.keywordsUnavailable,
    errors.noKeywordsFound,
    errors.noQuestionsReturned,
    errors.questionsUnavailable,
    difficulty,
    jobDescription,
    loaders.keywords,
    loaders.questions,
    logs.noKeywordsReturned,
    questionCount,
    startLoader,
    status.nameRequired,
    status.preparingFirstQuestion,
    stopLoader,
  ]);

  return {
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
    endInterview,
    activeLoaders,
    isInterviewActive,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: generatedQuestionsList.length,
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
  };
}
