interface DownloadProgress {
  loaded: number;
}

export interface WriterOptions {
  sharedContext?: string;
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  onDownloadProgress?: (progress: number) => void;
  onDownloadComplete?: () => void;
  onError?: (error: string) => void;
}

export interface WriterInstance {
  write: (prompt: string) => Promise<string>;
}

declare global {
  interface Window {
    Writer?: {
      availability: () => Promise<'available' | 'unavailable' | 'requires-install'>;
      create: (options: any) => Promise<WriterInstance>;
    };
  }
}

export async function initializeWriter(options: WriterOptions): Promise<WriterInstance | null> {
  if (!window.Writer) {
    options.onError?.('Writer API is not available');
    return null;
  }

  try {
    const available = await window.Writer.availability();
    
    if (available === 'unavailable') {
      options.onError?.('Writer API is not supported on this device');
      return null;
    }

    if (available === 'available') {
      // Model is already downloaded and ready
      const writer = await window.Writer.create(options);
      options.onDownloadComplete?.();
      return writer;
    }

    // Model needs to be downloaded
    return await window.Writer.create({
      ...options,
      monitor(m: { addEventListener: (event: string, callback: (e: DownloadProgress) => void) => void }) {
        m.addEventListener("downloadprogress", (e: DownloadProgress) => {
          const progress = Math.round(e.loaded * 100);
          options.onDownloadProgress?.(progress);
          if (progress === 100) {
            options.onDownloadComplete?.();
          }
        });
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error initializing Writer';
    options.onError?.(errorMessage);
    console.error('Error initializing Writer:', error);
    return null;
  }
}

export const DEFAULT_WRITER_OPTIONS: Partial<WriterOptions> = {
  tone: 'formal',
  format: 'plain-text',
  length: 'medium'
};