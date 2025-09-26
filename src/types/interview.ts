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
