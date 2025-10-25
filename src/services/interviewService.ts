import {
  ANSWER_ANALYSIS_PROMPT_OPTIONS,
  JOB_DESCRIPTION_PROMPT_OPTIONS,
  KEYWORD_PROMPT_OPTIONS,
  QUESTION_PROMPT_OPTIONS,
  analyseJD,
  buildAnswerAnalysisPrompt,
  buildKeywordPrompt,
  buildQuestionPrompt,
} from "../utils/prompts";
import type {
  AnswerFeedback,
  GenerateQuestionParams,
  InterviewAnswer,
  InterviewDifficulty,
  JobDescriptionVerificationResponse,
  KeywordResponse,
  QuestionResponse,
} from "../types";

declare const Writer: {
  availability: () => Promise<"available" | "unavailable" | "requires-install">;
  create: (
    options: Record<string, unknown>
  ) => Promise<{ write: (prompt: string) => Promise<string> }>;
};

const sanitizeWriterResponse = (raw: string) =>
  raw.replace("json", "").replace(/```/g, "").trim();

export const generateKeywords = async (
  jobDescription: string
): Promise<KeywordResponse> => {
  const writer = await Writer.create(KEYWORD_PROMPT_OPTIONS);
  const result = await writer.write(buildKeywordPrompt(jobDescription));
  const cleaned = sanitizeWriterResponse(result);
  return JSON.parse(cleaned);
};

export const verifyJobDescription = async (
  jobDescription: string
): Promise<JobDescriptionVerificationResponse> => {
  const writer = await Writer.create(JOB_DESCRIPTION_PROMPT_OPTIONS);
  const result = await writer.write(analyseJD(jobDescription));

  const cleaned = sanitizeWriterResponse(result);
  const parsed = JSON.parse(cleaned);
  

  if (!parsed || typeof parsed.result !== "boolean") {
    throw new Error("Unexpected response shape from job description check.");
  }

  return parsed;
};

export const generateInterviewQuestions = async ({
  keywords,
  questionCount,
  difficulty,
  candidateName,
}: GenerateQuestionParams): Promise<QuestionResponse> => {
  
  const writer = await Writer.create(QUESTION_PROMPT_OPTIONS);
  const result = await writer.write(
    buildQuestionPrompt({
      keywords,
      questionCount,
      difficulty,
      candidateName,
    })
  );
  const cleaned = sanitizeWriterResponse(result);
  return JSON.parse(cleaned);
};

const extractFeedback = (raw: string) => {
  const cleaned = sanitizeWriterResponse(raw);
  const parsed = JSON.parse(cleaned);

  if (!parsed || typeof parsed.feedback !== "string") {
    throw new Error("Unexpected feedback shape from Writer.");
  }

  return parsed.feedback.trim();
};

export const analyzeAnswersWithWriter = async (
  entries: InterviewAnswer[]
): Promise<AnswerFeedback[]> => {
  if (entries.length === 0) {
    return [];
  }

  if (!("Writer" in globalThis)) {
    throw new Error("Writer API is unavailable in this environment.");
  }

  const writer = await Writer.create(ANSWER_ANALYSIS_PROMPT_OPTIONS);
  const feedback: AnswerFeedback[] = [];

  for (const entry of entries) {
    const prompt = buildAnswerAnalysisPrompt(entry.question, entry.answer);
    const result = await writer.write(prompt);
    const text = extractFeedback(result);
    feedback.push({ ...entry, feedback: text });
  }

  return feedback;
};
