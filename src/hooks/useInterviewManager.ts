import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  analyzeAnswersWithWriter,
  generateInterviewQuestions,
  generateKeywords,
  verifyJobDescription,
} from "../services/interviewService";
import type {
  AnswerFeedback,
  InterviewAnswer,
  InterviewDifficulty,
} from "../types/interview";
import { useSpeechRecognition } from "./useSpeechRecognition";

type SessionPhase =
  | "request-permission"
  | "paste-description"
  | "starting-listener"
  | "listening"
  | "paused";

type LoaderConfig = { id: string; messages: string[] };

type InterviewManagerReturn = {
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  hasDescription: boolean;
  candidateName: string;
  setCandidateName: Dispatch<SetStateAction<string>>;
  questionCount: number;
  setQuestionCount: Dispatch<SetStateAction<number>>;
  difficulty: InterviewDifficulty;
  setDifficulty: Dispatch<SetStateAction<InterviewDifficulty>>;
  statusMessage: string | null;
  speechError: string | null;
  combinedTranscript: string;
  startInterview: () => Promise<void>;
  activeLoaders: LoaderConfig[];
  isInterviewActive: boolean;
  currentQuestion: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  handlePlayQuestion: () => void;
  handleStartAnswer: () => Promise<void>;
  handleRestartAnswer: () => Promise<void>;
  handleSubmitAnswer: () => void;
  endInterview: () => void;
  isNarrating: boolean;
  isAnswering: boolean;
  interviewComplete: boolean;
  interviewQnA: InterviewAnswer[];
  narrationError: string | null;
  analysisResults: AnswerFeedback[];
  analysisError: string | null;
  isAnalyzingAnswers: boolean;
};

export function useInterviewManager(): InterviewManagerReturn {
  const [jobDescription, setJobDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [phase, setPhase] = useState<SessionPhase>("request-permission");
  const [statusMessage, setStatusMessage] = useState<string | null>(
    "Allow microphone access to begin."
  );
  const [manualPause, setManualPause] = useState(false);
  const startInFlightRef = useRef(false);
  const [activeLoaders, setActiveLoaders] = useState<LoaderConfig[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
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
      setStatusMessage("Speech recognition is not supported in this browser.");
    }
  }, [isSupported]);

  useEffect(() => {
    if (isInterviewActive) {
      return;
    }

    if (!hasPermission) {
      setManualPause(false);
      setPhase("request-permission");
      setStatusMessage("Allow microphone access to begin.");
      stopListening();
      resetTranscript();
      return;
    }

    if (!hasCandidateName) {
      setManualPause(false);
      setPhase("paste-description");
      setStatusMessage("Add your name to personalise your interview.");
      stopListening();
      resetTranscript();
      return;
    }

    if (!hasDescription) {
      setManualPause(false);
      setPhase("paste-description");
      setStatusMessage("Paste the job description to start voice capture.");
      stopListening();
      resetTranscript();
      return;
    }

    if (manualPause) {
      setPhase("paused");
      setStatusMessage("Voice capture paused. Resume when you are ready.");
      return;
    }

    if (isListening) {
      setPhase("listening");
      setStatusMessage(
        "Listening — your answers will be transcribed for Gemini Nano."
      );
      return;
    }

    if (startInFlightRef.current) {
      setPhase("starting-listener");
      setStatusMessage("Preparing microphone...");
      return;
    }

    setPhase("starting-listener");
    setStatusMessage("Preparing microphone...");
    startInFlightRef.current = true;

    (async () => {
      try {
        await startListening();
        setPhase("listening");
        setStatusMessage(
          "Listening — your answers will be transcribed for Gemini Nano."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to access your microphone right now.";
        setStatusMessage(message);
        setManualPause(true);
        setPhase("paused");
      } finally {
        startInFlightRef.current = false;
      }
    })();
  }, [
    isInterviewActive,
    hasPermission,
    hasCandidateName,
    hasDescription,
    isListening,
    manualPause,
    resetTranscript,
    startListening,
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

  const speakQuestion = useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setNarrationError("Speech synthesis is not supported in this browser.");
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
        setNarrationError("Unable to play the question audio.");
        utteranceRef.current = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const endInterview = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    stopListening();
    resetTranscript();

    utteranceRef.current = null;

    setIsInterviewActive(false);
    setInterviewComplete(false);
    setManualPause(false);
    setIsAnswering(false);
    setIsNarrating(false);
    setNarrationError(null);
    setStatusMessage("Interview ended. Start again when you're ready.");

    setGeneratedQuestionsList([]);
    setCurrentQuestionIndex(0);
    setInterviewQnA([]);
    setAnalysisResults([]);
    setAnalysisError(null);
    setIsAnalyzingAnswers(false);
    setActiveLoaders([]);

    startInFlightRef.current = false;
    sessionTokenRef.current += 1;
  }, [resetTranscript, stopListening]);

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
      setStatusMessage("Recording your answer...");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start recording your answer.";
      setStatusMessage(message);
    }
  }, [currentQuestion, isInterviewActive, resetTranscript, startListening]);

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
          error instanceof Error
            ? error.message
            : "Unable to restart recording.";
        setStatusMessage(message);
        return;
      }
    }
    setStatusMessage("Recording restarted. Speak when ready.");
  }, [isAnswering, isListening, resetTranscript, startListening]);

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

    const loaderId = "answer-analysis";
    startLoader(loaderId, [
      "Reviewing your answers",
      "Highlighting improvement opportunities",
    ]);
    setIsAnalyzingAnswers(true);
    setAnalysisError(null);

    try {
      const feedback = await analyzeAnswersWithWriter(interviewQnA);
      setAnalysisResults(feedback);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to analyse your answers right now.";
      setAnalysisError(message);
      setAnalysisResults([]);
    } finally {
      setIsAnalyzingAnswers(false);
      stopLoader(loaderId);
    }
  }, [interviewQnA, startLoader, stopLoader]);

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
      setStatusMessage("Interview complete. Review your answers below.");
      return;
    }

    setInterviewComplete(false);
    setStatusMessage(
      `Question ${currentQuestionIndex + 1} of ${generatedQuestionsList.length}`
    );

    speakQuestion(currentQuestion);
  }, [
    currentQuestion,
    currentQuestionIndex,
    generatedQuestionsList.length,
    isInterviewActive,
    resetTranscript,
    speakQuestion,
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

    const trimmedName = candidateName.trim();
    if (!trimmedName) {
      setStatusMessage("Please enter your name before starting the interview.");
      return;
    }

    const availability = await writerGlobal.availability();

    if (availability === "unavailable") {
      return;
    }

    if (availability === "available") {
      const sessionToken = ++sessionTokenRef.current;
      const keywordLoaderId = "keyword-extraction";
      const questionLoaderId = "question-generation";

      setInterviewQnA([]);
      setGeneratedQuestionsList([]);
      setCurrentQuestionIndex(0);
      setInterviewComplete(false);
      setIsInterviewActive(false);
      setAnalysisResults([]);
      setAnalysisError(null);
      setIsAnalyzingAnswers(false);

      startLoader(keywordLoaderId, [
        "Analysing keywords",
        "Extracting relevant keywords from the job description",
      ]);

      let keywordGenerator: { keywords: string[] } | null = null;

      try {
        const jdVerification = await verifyJobDescription(jobDescription);

        if (sessionToken !== sessionTokenRef.current) {
          return;
        }

        if (!jdVerification.result) {
          setStatusMessage(
            "We couldn't recognise that job description. Try another one."
          );
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
        setStatusMessage("Unable to generate keywords right now.");
        return;
      } finally {
        stopLoader(keywordLoaderId);
      }

      if (sessionToken !== sessionTokenRef.current) {
        return;
      }

      if (
        !keywordGenerator ||
        !Array.isArray(keywordGenerator.keywords) ||
        keywordGenerator.keywords.length === 0
      ) {
        console.warn("No keywords returned; skipping question generation.");
        setStatusMessage(
          "No keywords found. Please refine the job description."
        );
        return;
      }

      startLoader(questionLoaderId, [
        "Generating questions",
        "Crafting tailored interview prompts",
      ]);

      try {
        const generatedQuestions = await generateInterviewQuestions({
          keywords: keywordGenerator.keywords,
          questionCount,
          difficulty,
          candidateName: trimmedName,
        });
        console.log("Generated questions", generatedQuestions);

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
          setStatusMessage(
            `Preparing your first interview question, ${trimmedName}...`
          );
        } else {
          setStatusMessage("No questions were returned. Try again later.");
        }
      } catch (error) {
        if (sessionToken !== sessionTokenRef.current) {
          return;
        }
        console.error("Failed to generate questions", error);
        setStatusMessage("Unable to generate interview questions right now.");
        return;
      } finally {
        stopLoader(questionLoaderId);
      }

      if (sessionToken !== sessionTokenRef.current) {
        return;
      }
    }
  }, [
    candidateName,
    difficulty,
    jobDescription,
    questionCount,
    startLoader,
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
  };
}
type WriterGlobal = {
  availability: () => Promise<"available" | "unavailable" | "requires-install">;
};
