import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorEventLike,
  SpeechRecognitionEventLike,
  SpeechRecognitionInstance,
  SpeechRecognitionResultLike,
  WindowSpeech,
} from '../types';

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const speechWindow = window as WindowSpeech;
    const SpeechRecognitionImpl =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) {
          continue;
        }

        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => `${prev} ${finalText}`.trim());
        setInterimTranscript('');
      }

      if (interimText) {
        setInterimTranscript(interimText.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone permissions are unavailable in this browser.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setHasPermission(false);
      throw err instanceof Error ? err : new Error('Microphone access was declined.');
    }
  }, []);

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current;
    if (!isSupported || !recognition) {
      throw new Error('Speech recognition is not supported.');
    }

    if (!hasPermission) {
      await requestPermission();
    }

    setError(null);
    setInterimTranscript('');

    recognition.start();
    setIsListening(true);
  }, [hasPermission, isSupported, requestPermission]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    recognition.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return useMemo(
    () => ({
      isSupported,
      hasPermission,
      isListening,
      transcript,
      interimTranscript,
      error,
      requestPermission,
      startListening,
      stopListening,
      resetTranscript,
    }),
    [
      error,
      hasPermission,
      interimTranscript,
      isListening,
      isSupported,
      requestPermission,
      startListening,
      stopListening,
      transcript,
      resetTranscript,
    ],
  );
}
