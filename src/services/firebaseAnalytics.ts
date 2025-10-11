import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';

let analytics: Analytics | undefined;
let crashHandlersRegistered = false;

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
  measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID,
} as const;

const isConfigComplete = () =>
  Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.length > 0);

export const initFirebaseAnalytics = () => {
  if (analytics || typeof window === 'undefined') return;

  if (!isConfigComplete()) {
    console.warn('Firebase analytics skipped: configuration values are missing.');
    return;
  }

  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  registerCrashHandlers();
};

export const logFirebaseEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (!analytics) return;
  logEvent(analytics, eventName, eventParams);
};

export const getFirebaseAnalytics = () => analytics;

type ReportContext = {
  source?: string;
  fatal?: boolean;
  extra?: Record<string, unknown>;
};

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack ?? null };
  }

  if (typeof error === 'string') {
    return { message: error, stack: null };
  }

  try {
    return { message: JSON.stringify(error), stack: null };
  } catch {
    return { message: 'Unknown error', stack: null };
  }
};

export const reportException = (error: unknown, context: ReportContext = {}) => {
  if (!analytics) return;

  const { message, stack } = normalizeError(error);

  logEvent(analytics, 'exception', {
    description: context.source ? `${context.source}: ${message}` : message,
    fatal: context.fatal ?? false,
    stack,
    ...context.extra,
  });
};

const registerCrashHandlers = () => {
  if (crashHandlersRegistered || typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportException(event.error ?? event.message, {
      source: 'window.onerror',
      fatal: true,
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportException(event.reason, {
      source: 'unhandledrejection',
      fatal: true,
    });
  });

  crashHandlersRegistered = true;
};
