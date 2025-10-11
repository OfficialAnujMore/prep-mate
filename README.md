# PrepMate

PrepMate is an AI-powered interview coach that runs entirely on-device in Google Chrome desktop browser. It captures spoken responses, analyses answers with Gemini Nano, and offers targeted feedback to help candidates prepare for technical interviews.

Webiste URL `https://my-ai-interview-rehearsal-coach.netlify.app/`

## Prerequisites

- Node.js 18.0.0 or later
- npm 9+ (bundled with Node 18)
- Google Chrome desktop version 137–142 on a supported operating system for on-device AI features

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Duplicate `.env.sample` as `.env`.
   - Replace the placeholder  values with your project credentials.
3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app is available at `http://localhost:5173`. Any code changes trigger hot module replacement.

## Environment variables

| Key                     | Description                                   |
| ----------------------- | --------------------------------------------- |
| `WRITER_API_TOKEN`      | Token to enable writer API.                   |
| `FIREBASE_API_KEY`      | Firebase API key for the web app              |
| `FIREBASE_AUTH_DOMAIN`  | Firebase Auth domain                          |
| `FIREBASE_PROJECT_ID`   | Firebase project identifier                   |
| `FIREBASE_APP_ID`       | Firebase app identifier                       |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID (GA4)    |

These values power Firebase Analytics and crash reporting. Analytics initialises automatically when all variables are present.

## Available scripts

```bash
npm run dev       # Start the Vite dev server
npm run build     # Type-check and build for production
npm run preview   # Preview the production build locally
npm run lint      # Lint the TypeScript sources
```

## Testing and validation

1. Run `npm run lint` to ensure code quality checks pass.
2. Run `npm run build` to confirm the project type-checks and bundles successfully.
3. Visit the running app and simulate an error (e.g., trigger `throw new Error('test')` in the console) to verify Firebase Analytics captures exceptions in the DebugView.

## Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the contents of the `dist/` directory to your hosting provider (e.g., Vercel, Netlify, GitHub Pages). Ensure the production environment sets the same Firebase variables used locally.
3. Provide the live URL alongside this repository when submitting for judging. If access restrictions apply, include valid credentials in your submission.

## License

This project is licensed under the [MIT License](./LICENSE).
