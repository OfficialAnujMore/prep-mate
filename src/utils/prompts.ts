import type { BuildQuestionPromptArgs, InterviewDifficulty } from "../types";

export const KEYWORD_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an ATS scanner to extract keywords from the job description",
  tone: "formal",
  format: "plain-text",
  length: "long",
};

export const QUESTION_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an real life interviewer and generate a interview question",
  tone: "formal",
  format: "plain-text",
  length: "long",
};

export const JOB_DESCRIPTION_PROMPT_OPTIONS = {
  sharedContext: "Verify relevant job description",
  tone: "formal",
  format: "plain-text",
  length: "long",
};

export const buildKeywordPrompt = (jobDescription: string) =>
  [
    "Act as an ATS scanner and read the following job description.",
    jobDescription.trim(),
    "Extract only the technical keywords that would inform generating interview questions.",
    'Return ONLY valid JSON with this schema: {"keywords":["Keyword1","Keyword2",...]}.',
    'If the description is irrelevant or lacks technical details, return {"keywords":[]}.',
    "Do not include any text outside the JSON response.",
  ].join("\n\n");

export const analyseJD = (jobDescription: string) =>
  [
    "Following is the job description",
    jobDescription.trim(),
    'If the job description is irrelevant or lacks technical details, return {"result":false} else return {"result":true}',
    "Do not include any text outside the JSON response.",
  ].join("\n\n");

export const buildQuestionPrompt = ({
  keywords,
  questionCount,
  difficulty,
  candidateName,
}: BuildQuestionPromptArgs) => {
  const targetName = candidateName?.trim() || "";
  const difficultyLabel =
    difficulty === "easy"
      ? "an easy, introductory"
      : difficulty === "hard"
      ? "a challenging, senior-level"
      : "a balanced, mid-level";

  return (
    `You are an expert interviewer speaking to ${targetName}. From these keywords:\n${JSON.stringify(
      keywords
    )}\n\n` +
    `Generate ${questionCount} interview questions in natural, conversational language.\n` +
    `Requirements:\n` +
    `- Calibrate each question to ${difficultyLabel} difficulty.\n` +
    `- Sound like a real interviewer speaking aloud and use second person ("you").\n` +
    `- The first questions should always be about introducing the candidate with the ${targetName} and the last questions should always be about why you or why you are fit for this role?` +
    `- Keep each question to one sentence, maximum 25 words.\n` +
    `- Do not add numbering, bullets, headings, or explanations.\n\n` +
    `Output format:\n` +
    `Return ONLY valid JSON with exactly this schema:\n` +
    `{"questions":["q1","q2","..."]}\n` +
    `- Use standard double quotes.\n` +
    `- No trailing commas.\n` +
    `- No extra text outside the JSON.`
  );
};

export const ANSWER_ANALYSIS_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an interview coach who highlights gaps and improvement ideas in candidate answers",
  tone: "formal",
  format: "plain-text",
  length: "medium",
};

export const buildAnswerAnalysisPrompt = (question: string, answer: string) =>
  `You are reviewing an interview response and must deliver constructive feedback.\n` +
  `Question: ${question}\n` +
  `Answer: ${answer || "No answer provided."}\n\n` +
  `Evaluate how well the answer addresses the question, call out any gaps, missing specifics, or misconceptions, and provide concrete suggestions to improve it.\n\n` +
  `Provide the feedback using second person ("you")` +
  `Return ONLY valid JSON with exactly this schema:\n` +
  `{"feedback":"Your concise feedback here"}\n` +
  `- Use plain sentences.\n` +
  `- Keep feedback under 120 words.\n` +
  `- Do not include lists, bullets, or numbering.\n` +
  `- Do not add any text outside the JSON.`;
