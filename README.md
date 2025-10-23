# PrepMate

PrepMate is an AI-powered interview coach that runs fully on-device in Google Chrome. It guides candidates through realistic mock interviews, captures spoken responses, and uses Chrome’s built-in Gemini Nano model to deliver actionable feedback—all while keeping data on the user’s machine.

- **Live demo:** [https://my-ai-interview-rehearsal-coach.netlify.app/](https://my-ai-interview-rehearsal-coach.netlify.app/)
- Video demo: [https://youtu.be/hFN5CddhqYc](https://youtu.be/hFN5CddhqYc)

## Problem & solution

A week before one of my dream job interviews, I remember sitting in front of my laptop, rehearsing answers out loud, second guessing every word. My friends were either busy or unsure how to give proper feedback. When I spoke to other university students, I found many in the same situation either relying on random YouTube videos or paying for expensive platforms.

PrepMate solves this problem by offering a **free, private, and accessible** mock interview platform powered by **on-device AI**. Candidates practice in Chrome, get instant feedback, and never send recordings to external servers.

## Key features

- Voice-driven mock interviews tailored to a supplied job description.
- On-device transcription with follow-up prompts for deeper practice.
- Automated answer analysis
- Analytics and crash reporting to understand usage patterns and issues.
- Works entirely in the browser when device and Chrome requirements are met.

## Chrome on-device AI APIs

- **Writer** – Analyse the job description, extract the keywords, generate questions and analyse user answer

> These APIs currently require Google Chrome desktop versions 137–142 on Windows 10/11, macOS 13+, Linux, or Chromebook Plus devices running Platform 16389.0.0 or later.

## Prerequisites

- Node.js 18.0.0 or later
- npm 9+ (ships with Node 18)
- Google Chrome desktop v137–142 on a supported operating system

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Copy `.env.sample` to `.env`.
   - Replace placeholder values with your Firebase project credentials and Writer API origin trial token.
3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app serves at `http://localhost:5173` with hot module replacement enabled.

## Environment variables

| Key                       | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `WRITER_API_TOKEN`        | Chrome origin-trial token enabling the Writer API |
| `FIREBASE_API_KEY`        | Firebase API key for the web client               |
| `FIREBASE_AUTH_DOMAIN`    | Firebase Auth domain                              |
| `FIREBASE_PROJECT_ID`     | Firebase project identifier                       |
| `FIREBASE_APP_ID`         | Firebase app identifier                           |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics (GA4) measurement ID           |

Firebase powers usage analytics and crash logging. The Writer API token is required to access Chrome’s on-device generative APIs.

## Available scripts

```bash
npm run dev       # Start the Vite dev server
npm run build     # Type-check and build for production
npm run preview   # Serve the production build locally
npm run lint      # Lint the TypeScript source files
```

## Testing & validation

1. Run `npm run lint` to ensure code style and best practices.
2. Run `npm run build` to confirm the project type-checks and bundles correctly.
3. Launch the dev server and trigger a sample error (e.g., `throw new Error('debug crash')` in the console) to verify Firebase Analytics logs exceptions in DebugView.
4. Use Chrome’s `chrome://on-device-internals` page to confirm Gemini Nano resources are downloaded on supported hardware.

## License

PrepMate is released under the [MIT License](./LICENSE).