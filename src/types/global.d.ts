declare global {
  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
    // Add Writer API type
    Writer?: {
      availability: () => Promise<'available' | 'unavailable' | 'requires-install'>;
      create: (options: {
        sharedContext?: string;
        tone?: string;
        format?: string;
        length?: string;
      }) => Promise<{
        write: (prompt: string) => Promise<string>;
      }>;
    };
  }
}

export {};
