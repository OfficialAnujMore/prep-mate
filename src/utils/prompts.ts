import type { BuildQuestionPromptArgs, InterviewDifficulty } from "../types";

export const KEYWORD_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an advanced ATS (Applicant Tracking System) specialized in analyzing job descriptions and extracting relevant technical keywords.",
  tone: "formal",
  format: "plain-text",
  length: "long",
};

export const QUESTION_PROMPT_OPTIONS = {
  sharedContext:
    "Act as an experienced technical interviewer who creates realistic and conversational interview questions based on provided keywords.",
  tone: "formal",
  format: "plain-text",
  length: "long",
};

export const JOB_DESCRIPTION_PROMPT_OPTIONS = {
  sharedContext:
    "Act as a technical recruiter verifying whether a job description is relevant, detailed, and technically sound.",
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
    "Following is the job description",
    "Job Description:",
    jobDescription.trim(),
    'If the job description is irrelevant or lacks technical details, return {"result":false} else return {"result":true}',
    "Do not include any text outside the JSON response.",
  ].join("\n");

export const analyseJD = (jobDescription: string) =>
  [
    "You are an expert technical recruiter and software engineer specializing in analyzing job descriptions.",
    "Your task is to determine whether the following job description is relevant and technically detailed.",
    "",
    "Job Description:",
    jobDescription.trim(),
    "",
    "Evaluation Criteria:",
    "1. The job description must clearly specify technical skills, tools, or programming languages.",
    "2. It must describe responsibilities or requirements related to software development, engineering, or technology.",
    "3. If it is too vague, non-technical, or unrelated to technology, it should be considered irrelevant.",
    "",
    "Output Instruction:",
    "Return ONLY a valid JSON object in the following format:",
    '{"result": true} — if the job description is relevant and technically detailed.',
    '{"result": false} — if it is irrelevant or lacks technical details.',
    "",
    "Do not include any explanations, comments, or text outside the JSON object.",
  ].join("\n");

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
    `- Q1: a brief self-introduction icebreaker addressing ${addressedName} by name if provided (e.g., “To start, could you introduce yourself?”).`,
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
