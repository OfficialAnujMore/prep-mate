# PrepMate

PrepMate is an AI-powered interview coach that runs fully on-device in Google Chrome. It guides candidates through realistic mock interviews, captures spoken responses, and uses Chrome’s built-in Gemini Nano model to deliver actionable feedback—all while keeping data on the user’s machine.

- **Live demo:** https://my-ai-interview-rehearsal-coach.netlify.app/

## Problem & solution

Interview preparation usually means expensive coaching or sharing sensitive personal information with cloud services. PrepMate keeps the process private and accessible: candidates practise in Chrome, receive instant feedback, and never send recordings to external servers.

## Key features

- Voice-driven mock interviews tailored to a supplied job description.
- On-device transcription with follow-up prompts for deeper practice.
- Automated answer analysis, summaries, and rewrite suggestions.
- Analytics and crash reporting to understand usage patterns and issues.
- Works entirely in the browser when device and Chrome requirements are met.

## Chrome on-device AI APIs

- **Prompt API** – Generates tailored interview questions and follow-up prompts with Gemini Nano.
- **Summarizer API** – Condenses user responses into digestible feedback points.
- **Writer & Rewriter APIs** – Produces refined answer suggestions and alternate phrasing for improvement.

> These APIs currently require Google Chrome desktop versions 137–142 on Windows 10/11, macOS 13+, Linux, or Chromebook Plus devices running Platform 16389.0.0 or later.

## Demo video

- **Public video (YouTube/Vimeo, < 3 minutes):** `<ADD VIDEO URL BEFORE SUBMISSION>`
  - Must show the Chrome desktop application running end-to-end.

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

| Key                       | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `WRITER_API_TOKEN`        | Chrome origin-trial token enabling the Writer API        |
| `FIREBASE_API_KEY`        | Firebase API key for the web client                      |
| `FIREBASE_AUTH_DOMAIN`    | Firebase Auth domain                                     |
| `FIREBASE_PROJECT_ID`     | Firebase project identifier                              |
| `FIREBASE_APP_ID`         | Firebase app identifier                                  |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics (GA4) measurement ID                  |

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

## Deployment

1. Generate a production build:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` directory to your hosting provider (Netlify, Vercel, GitHub Pages, etc.).
3. Ensure production environment variables mirror your local `.env`.
4. Share the live URL (see above). If access is restricted, include working credentials in your submission instructions.

## Submission checklist (contest requirements)

- ✅ **Application** – Web app built for Chrome that uses on-device AI APIs (Prompt, Summarizer, Writer/Rewriter).  
- ✅ **Description** – This README documents the problem, features, and API usage.  
- ⬜ **Demo video** – Add a public YouTube/Vimeo link under “Demo video” before submitting.  
- ✅ **Open-source repo** – Public GitHub repository with an [MIT License](./LICENSE) and full setup/testing instructions.  
- ✅ **Live access** – Provide the production URL above; include credentials if you enforce authentication.  
- ✅ **Language** – Keep written materials and the video narration in English.  
- ⬜ **Optional feedback** – Complete the official feedback form after submission to qualify for the “Most Valuable Feedback” prize.

## License

PrepMate is released under the [MIT License](./LICENSE).
