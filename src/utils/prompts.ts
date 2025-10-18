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
export const ANSWER_ANALYSIS_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an expert interview coach who critically analyzes candidate answers, identifying gaps, strengths, and specific areas for improvement.",
  tone: "formal",
  format: "plain-text",
  length: "medium",
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
  const targetName = (candidateName ?? "").trim();
  const addressedName = targetName || "the candidate";
  const difficultyLabel =
    difficulty === "easy"
      ? "easy, introductory"
      : difficulty === "hard"
      ? "challenging, senior-level"
      : "balanced, mid-level";
  const introGreeting = targetName ? `Hi ${targetName}` : "Hi there";
  const introQuestion = `${introGreeting}, could you please walk me through your background?`;

  return [
    "You are an expert technical interviewer.",
    "",
    "Input Keywords:",
    JSON.stringify(Array.isArray(keywords) ? keywords : []),
    "",
    "Task:",
    `Generate exactly ${questionCount} interview questions in natural, conversational language, each tailored to ${difficultyLabel} difficulty.`,
    "",
    "Hard Requirements:",
    `1) Use second person ("you") and speak as if talking directly to ${addressedName}.`,
    "2) Each question must be ONE sentence and at most 25 words.",
    "3) Do not include numbering, bullets, headings, notes, or explanations.",
    "4) Questions must be unique (no duplicates or near-duplicates).",
    "5) Ground questions ONLY in the provided keywords; do not invent tools/tech that aren’t present.",
    "6) If no meaningful technical keywords are present, return an empty list (no generic questions).",
    "",
    "Ordering Rules:",
    `- Q1 MUST be exactly: "${introQuestion}".`,
    "- Q2..Q(n-1): cover the provided keywords (mix fundamentals, applied problem-solving, design, trade-offs).",
    "- Qn: ask motivation/fit for the role (e.g., “Why do you think you’re a strong fit for this role?”).",
    "",
    "Style & Calibration:",
    `- Calibrate difficulty to ${difficultyLabel}.`,
    "- Prefer realistic, scenario-based prompts over trivia.",
    "- Avoid company-specific details, soft-skill-only prompts, or leading answers.",
    "",
    "Validation (must pass all):",
    `- Exactly ${questionCount} strings in the array (unless empty due to no keywords).`,
    "- Each string ≤ 25 words, single sentence, second person, no prefixes like “Q1:” or numbering.",
    "",
    "Output format (strict):",
    "Return ONLY valid JSON with this exact schema:",
    '{"questions":["q1","q2","..."]}',
    "Use standard double quotes, no trailing commas, and no extra text outside the JSON.",
  ].join("\n");
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
