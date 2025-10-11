export const COPY = {
  app: {
    heading: "AI Interview Coach",
    title: "PrepMate",
    subtitle:
      "Practice realistic interviews powered by on-device AI coaching. Paste a job description, speak your answers, and get instant feedback.",
  },
  sessionControls: {
    nameLabel: "Your name",
    namePlaceholder: "e.g., John Doe",
    questionLabel: "Number of questions",
    difficultyLabel: "Difficulty",
    jobDescriptionLabel: "Job description / Prompt",
    jobDescriptionPlaceholder:
      "Paste the prompt you'd like PrepMate to explore with you...",
    jobDescriptionHelper: "Your text stays on this device—nothing gets stored.",
    startInterview: "Start interview",
    endInterview: "End interview",
    prepareEngine: "Prepare AI Engine",
  },
  activeInterview: {
    question: "Questions",
    playQuestion: "Play question",
    restartAnswer: "Restart",
    submitAnswer: "Submit answer",
    startSpeaking: "Start speaking",
    completionMessage: {
      complete: "All questions complete. Review your notes below.",
      loading: "Preparing next question...",
    },
  },
  transcript: {
    title: "Captured transcript",
    hint: "This transcription is ready for analysis and feedback.",
  },
  qna: {
    title: "Interview Q&A",
    questionLabel: "Question:",
    answerLabel: "Your answer:",
    fallbackAnswer: "No answer captured.",
  },
  analysis: {
    title: "Answer review & improvements",
    questionLabel: "Question:",
    answerLabel: "Your answer:",
    feedbackLabel: "Feedback:",
    fallbackAnswer: "No answer captured.",
    retryAnalysis: "Retry analysis",
  },
  interviewManager: {
    status: {
      allowMic: "Allow microphone access to begin.",
      speechUnsupported: "Speech recognition is not supported in this browser.",
      nameRequired: "Add your name to personalise your interview.",
      descriptionRequired: "Paste the job description to start voice capture.",
      paused: "Voice capture paused. Resume when you are ready.",
      listening:
        "Listening — your answers will be transcribed for the AI engine",
      preparingMic: "Preparing microphone...",
      interviewEnded: "Interview ended. Start again when you're ready.",
      recordingAnswer: "Recording your answer...",
      recordingRestarted: "Recording restarted. Speak when ready.",
      interviewComplete: "Interview complete. Review your answers below.",
      questionProgress: (current: number, total: number) =>
        `Question ${current} of ${total}`,
      preparingFirstQuestion: (name: string) =>
        `Preparing your first interview question, ${name}...`,
    },
    errors: {
      microphoneAccess: "Unable to access your microphone right now.",
      speechSynthesisUnsupported:
        "Speech synthesis is not supported in this browser.",
      playQuestion: "Unable to play the question audio.",
      startRecording: "Unable to start recording your answer.",
      restartRecording: "Unable to restart recording.",
      analyzeAnswers: "Unable to analyse your answers right now.",
      keywordsUnavailable: "Unable to generate keywords right now.",
      questionsUnavailable: "Unable to generate interview questions right now.",
      jobDescriptionInvalid:
        "We couldn't recognise that job description. Try another one.",
      noKeywordsFound: "No keywords found. Please refine the job description.",
      noQuestionsReturned: "No questions were returned. Try again later.",
    },
    loaders: {
      keywords: {
        id: "keyword-extraction",
        messages: [
          "Analysing keywords",
          "Extracting relevant keywords from the job description",
        ],
      },
      questions: {
        id: "question-generation",
        messages: [
          "Generating questions",
          "Crafting tailored interview prompts",
        ],
      },
      analysis: {
        id: "answer-analysis",
        messages: [
          "Reviewing your answers",
          "Highlighting improvement opportunities",
        ],
      },
    },
    logs: {
      noKeywordsReturned: "No keywords returned; skipping question generation.",
    },
  },
  downloadManager: {
    defaultLabel:
      "As PrepMate executes all AI processing locally on device, please use Google Chrome desktop version 137–142 on Windows 10 or 11, macOS 13 or later, Linux, or Chromebook Plus (Platform 16389.0.0 or later) with at least 22 GB of free storage, 16 GB of RAM, four CPU cores, more than 4 GB of VRAM, and an unmetered network connection. Mobile browsers are not currently supported.",
    availableLabel: "AI engine ready",
    downloadingLabel: "Downloading resources",
    downloadableLabel: "Preparing AI engine…",
    checkingLabel: "Checking AI engine…",
    errorLabel: "We couldn't initialise the AI engine. Refresh to try again.",
  },
};
