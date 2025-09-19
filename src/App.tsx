import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.css';
import { Button } from './components/Button/Button';
import { TextArea } from './components/TextArea/TextArea';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

type SessionPhase =
  | 'request-permission'
  | 'paste-description'
  | 'starting-listener'
  | 'listening'
  | 'paused';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [phase, setPhase] = useState<SessionPhase>('request-permission');
  const [statusMessage, setStatusMessage] = useState<string | null>(
    'Allow microphone access to begin.',
  );
  const [manualPause, setManualPause] = useState(false);
  const startInFlightRef = useRef(false);

  const {
    isSupported,
    hasPermission,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    requestPermission,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const hasDescription = jobDescription.trim().length > 0;

  useEffect(() => {
    if (!isSupported) {
      setStatusMessage('Speech recognition is not supported in this browser.');
    }
  }, [isSupported]);

  useEffect(() => {
    if (!hasPermission) {
      setManualPause(false);
      setPhase('request-permission');
      setStatusMessage('Allow microphone access to begin.');
      stopListening();
      resetTranscript();
      return;
    }

    if (!hasDescription) {
      setManualPause(false);
      setPhase('paste-description');
      setStatusMessage('Paste the job description to start voice capture.');
      stopListening();
      resetTranscript();
      return;
    }

    if (manualPause) {
      setPhase('paused');
      setStatusMessage('Voice capture paused. Resume when you are ready.');
      return;
    }

    if (isListening) {
      setPhase('listening');
      setStatusMessage('Listening — your answers will be transcribed for Gemini Nano.');
      return;
    }

    if (startInFlightRef.current) {
      setPhase('starting-listener');
      setStatusMessage('Preparing microphone...');
      return;
    }

    setPhase('starting-listener');
    setStatusMessage('Preparing microphone...');
    startInFlightRef.current = true;

    (async () => {
      try {
        await startListening();
        setPhase('listening');
        setStatusMessage('Listening — your answers will be transcribed for Gemini Nano.');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to access your microphone right now.';
        setStatusMessage(message);
        setManualPause(true);
        setPhase('paused');
      } finally {
        startInFlightRef.current = false;
      }
    })();
  }, [
    hasPermission,
    hasDescription,
    isListening,
    manualPause,
    resetTranscript,
    startListening,
    stopListening,
  ]);

  useEffect(() => {
    if (!hasDescription) {
      resetTranscript();
    }
  }, [hasDescription, resetTranscript]);

  const combinedTranscript = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(' ').trim(),
    [interimTranscript, transcript],
  );

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      setStatusMessage('Microphone enabled. Paste the job description next.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Microphone access was declined.';
      setStatusMessage(message);
    }
  };

  const handlePause = () => {
    setManualPause(true);
    stopListening();
    setPhase('paused');
    setStatusMessage('Voice capture paused. Resume when you are ready.');
  };

  const handleResume = async () => {
    setManualPause(false);
    setPhase('starting-listener');
    setStatusMessage('Preparing microphone...');
    try {
      await startListening();
      setPhase('listening');
      setStatusMessage('Listening — your answers will be transcribed for Gemini Nano.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resume listening.';
      setStatusMessage(message);
      setManualPause(true);
      setPhase('paused');
    }
  };

  const handleClear = () => {
    setJobDescription('');
    setManualPause(false);
    stopListening();
    resetTranscript();
    setPhase(hasPermission ? 'paste-description' : 'request-permission');
    setStatusMessage(
      hasPermission ? 'Paste the job description to start voice capture.' : 'Allow microphone access to begin.',
    );
  };

  const primaryAction = useMemo(() => {
    if (!hasPermission) {
      return {
        label: 'Enable microphone',
        onClick: handleRequestPermission,
        disabled: !isSupported,
      };
    }

    if (!hasDescription) {
      return {
        label: 'Waiting for job description',
        onClick: () => {},
        disabled: true,
      };
    }

    if (phase === 'starting-listener') {
      return {
        label: 'Preparing...',
        onClick: () => {},
        disabled: true,
      };
    }

    if (phase === 'listening') {
      return {
        label: 'Pause listening',
        onClick: handlePause,
        disabled: false,
      };
    }

    return {
      label: 'Resume listening',
      onClick: handleResume,
      disabled: false,
    };
  }, [handlePause, handleRequestPermission, handleResume, hasDescription, hasPermission, isSupported, phase]);

  const secondaryAction = useMemo(() => {
    if (!hasPermission && !jobDescription) {
      return null;
    }
    console.log({combinedTranscript});

    return {
      label: 'Clear',
      onClick: handleClear,
      disabled: !jobDescription && !combinedTranscript,
    };
    
  }, [combinedTranscript, handleClear, hasPermission, jobDescription]);


  return (
    <div className={styles.app}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>PrepMate</h1>
          <p className={styles.subtitle}>
            Paste a job description, then speak your responses. PrepMate will transcribe everything
            locally so Gemini Nano can analyse it next.
          </p>
        </header>

        <section className={styles.form}>
          <TextArea
            label="Job description / prompt"
            placeholder="Paste the prompt you'd like PrepMate to explore with you..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.currentTarget.value)}
            helperText="Your text stays on this device—nothing gets stored."
            disabled={!hasPermission}
          />

          <div className={styles.actions}>
            <Button
              className={styles.actionButton}
              variant="primary"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
            {secondaryAction ? (
              <Button
                className={styles.actionButton}
                variant="secondary"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>

          {statusMessage && <p className={styles.status}>{statusMessage}</p>}
          {speechError && <p className={styles.error}>{speechError}</p>}

          {combinedTranscript ? (
            <div className={styles.transcript}>
              <strong className={styles.transcriptTitle}>Captured transcript</strong>
              <p className={styles.transcriptText}>{combinedTranscript}</p>
              <p className={styles.transcriptHint}>
                This transcription is ready to send to Gemini Nano for deep-dive analysis.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default App;
