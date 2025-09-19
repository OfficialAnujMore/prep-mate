import { useState } from 'react';
import styles from './App.module.css';
import { Button } from './components/Button/Button';
import { TextArea } from './components/TextArea/TextArea';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleStart = () => {
    if (!jobDescription.trim()) {
      return;
    }

    setStatusMessage('Preparing your conversational flow...');
    // Placeholder for future integration with speech and prompt analysis.
  };

  const handleClear = () => {
    setJobDescription('');
    setStatusMessage(null);
  };

  return (
    <div className={styles.app}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>PrepMate</h1>
          <p className={styles.subtitle}>
            Paste a job description or prompt to kick-start a tailored voice-led preparation
            session.
          </p>
        </header>

        <section className={styles.form}>
          <TextArea
            label="Job description / prompt"
            placeholder="Paste the prompt you'd like PrepMate to explore with you..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.currentTarget.value)}
            helperText="Your text stays on this device—nothing gets stored."
          />

          <div className={styles.actions}>
            <Button
              className={styles.actionButton}
              variant="primary"
              onClick={handleStart}
              disabled={!jobDescription.trim()}
            >
              Start discovery
            </Button>
            <Button
              className={styles.actionButton}
              variant="secondary"
              onClick={handleClear}
              disabled={!jobDescription}
            >
              Clear
            </Button>
          </div>

          {statusMessage && <p className={styles.status}>{statusMessage}</p>}
        </section>
      </div>
    </div>
  );
}

export default App;
