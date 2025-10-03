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
  InterviewAnswer,
  InterviewDifficulty,
} from "../types/interview";

type KeywordResponse = {
  keywords: string[];
};

type QuestionResponse = {
  questions: string[];
};

type JobDescriptionVerificationResponse = {
  result: boolean;
};

type GenerateQuestionParams = {
  keywords: string[];
  questionCount: number;
  difficulty: InterviewDifficulty;
  candidateName: string;
};

// Helper function to check if Writer API is available and create a writer instance
async function createWriter(options: {
  sharedContext?: string;
  tone?: string;
  format?: string;
  length?: string;
}) {
  if (!window.Writer) {
    throw new Error('Writer API is not available');
  }

  const availability = await window.Writer.availability();
  if (availability !== 'available') {
    throw new Error('Writer API is not ready for use');
  }

  return window.Writer.create(options);
}

const sanitizeWriterResponse = (raw: string) =>
  raw.replace("json", "").replace(/```/g, "").trim();

export const generateKeywords = async (
  jobDescription: string
): Promise<KeywordResponse> => {
  const writer = await createWriter(KEYWORD_PROMPT_OPTIONS);
  const result = await writer.write(buildKeywordPrompt(jobDescription));
  const cleaned = sanitizeWriterResponse(result);
  console.log(`Generated keywords are: ${cleaned}`);
  return JSON.parse(cleaned);
};

export const verifyJobDescription = async (
  jobDescription: string
): Promise<JobDescriptionVerificationResponse> => {
  const writer = await createWriter(JOB_DESCRIPTION_PROMPT_OPTIONS);
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
  const writer = await createWriter(QUESTION_PROMPT_OPTIONS);
  const result = await writer.write(
    buildQuestionPrompt({
      keywords,
      questionCount,
      difficulty,
      candidateName,
    })
  );
  const cleaned = sanitizeWriterResponse(result);
  console.log(`Generated questions are: ${cleaned}`);
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

  const writer = await createWriter(ANSWER_ANALYSIS_PROMPT_OPTIONS);
  const feedback: AnswerFeedback[] = [];

  for (const entry of entries) {
    const prompt = buildAnswerAnalysisPrompt(entry.question, entry.answer);
    const result = await writer.write(prompt);
    const text = extractFeedback(result);
    feedback.push({ ...entry, feedback: text });
  }

  return feedback;
};
