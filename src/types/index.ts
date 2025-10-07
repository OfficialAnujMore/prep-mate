import type {
  ButtonHTMLAttributes,
  Dispatch,
  ReactNode,
  SetStateAction,
  TextareaHTMLAttributes,
} from "react";

export type InterviewAnswer = {
  question: string;
  answer: string;
};

export type AnswerFeedback = {
  question: string;
  answer: string;
  feedback: string;
};

export type InterviewDifficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_LEVELS: InterviewDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export type KeywordResponse = {
  keywords: string[];
};

export type QuestionResponse = {
  questions: string[];
};

export type JobDescriptionVerificationResponse = {
  result: boolean;
};

export type GenerateQuestionParams = {
  keywords: string[];
  questionCount: number;
  difficulty: InterviewDifficulty;
  candidateName: string;
};

export type BuildQuestionPromptArgs = {
  keywords: string[];
  questionCount: number;
  difficulty: InterviewDifficulty;
  candidateName: string;
};

export type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
};

export type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
};

export type SpeechRecognitionErrorEventLike = {
  readonly error: string;
};

export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export type WindowSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export type LoaderConfig = {
  id: string;
  messages: string[];
};

export type LoaderProps = {
  messages?: string[];
};

export type LoaderListProps = {
  loaders: LoaderConfig[];
};

export type AnalysisListProps = {
  entries: AnswerFeedback[];
};

export type InterviewQnAListProps = {
  entries: InterviewAnswer[];
  show: boolean;
};

export type WriterAvailability =
  | "checking"
  | "unavailable"
  | "available"
  | "downloadable"
  | "downloading"
  | "error";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: boolean;
  wrapperClassName?: string;
};

export type ButtonVariant = "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export type SessionPhase =
  | "request-permission"
  | "paste-description"
  | "starting-listener"
  | "listening"
  | "paused";

export type InterviewManagerReturn = {
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

export type TranscriptPanelProps = {
  transcript: string;
};

export type BaseSessionInputProps = {
  id: string;
  label: string;
};

export type TextInputProps = BaseSessionInputProps & {
  type: "text";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export type RangeInputProps = BaseSessionInputProps & {
  type: "range";
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueDisplay?: ReactNode;
};

export type SessionInputControlProps = TextInputProps | RangeInputProps;

export type SessionControlsProps = {
  candidateName: string;
  onCandidateNameChange: Dispatch<SetStateAction<string>>;
  questionCount: number;
  onQuestionCountChange: Dispatch<SetStateAction<number>>;
  difficulty: InterviewDifficulty;
  onDifficultyChange: Dispatch<SetStateAction<InterviewDifficulty>>;
  jobDescription: string;
  onJobDescriptionChange: Dispatch<SetStateAction<string>>;
  onStartInterview: () => void;
  onEndInterview: () => void;
  canStart: boolean;
  disableStart: boolean;
  showEndButton: boolean;
  availability: WriterAvailability;
  onStartDownload: () => Promise<void>;
};

export type StatusMessagesProps = {
  statusMessage: string | null;
  speechError: string | null;
};

export type ActiveInterviewSectionProps = {
  isInterviewActive: boolean;
  currentQuestion: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  narrationError: string | null;
  isNarrating: boolean;
  isAnswering: boolean;
  interviewComplete: boolean;
  combinedTranscript: string;
  onPlayQuestion: () => void;
  onStartAnswer: () => void | Promise<void>;
  onRestartAnswer: () => void | Promise<void>;
  onSubmitAnswer: () => void;
};

export type WriterGlobal = {
  availability: () => Promise<"available" | "unavailable" | "requires-install">;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
