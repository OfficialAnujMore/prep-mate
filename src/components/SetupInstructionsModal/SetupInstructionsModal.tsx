import { useEffect, useState } from 'react';
import styles from './SetupInstructionsModal.module.css';
import { Button } from '../Button/Button';

type SetupInstructionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SetupInstructionsModal({ isOpen, onClose }: SetupInstructionsModalProps) {
  const [chromeVersion, setChromeVersion] = useState<number | null>(null);

  useEffect(() => {
    // Get Chrome version from user agent
    const match = navigator.userAgent.match(/Chrome\/(\d+)/);
    if (match) {
      setChromeVersion(parseInt(match[1], 10));
    }
  }, []);

  if (!isOpen) return null;

  const isChrome = navigator.userAgent.includes('Chrome');
  const isVersionCompatible = chromeVersion !== null && chromeVersion >= 138;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Setup Required</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          {!isChrome ? (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Browser Not Supported</h3>
              <p>PrepMate requires Google Chrome to use AI features. Please switch to Chrome and try again.</p>
            </div>
          ) : !isVersionCompatible ? (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Chrome Update Required</h3>
              <p>Please update Chrome to version 138 or higher to use AI features.</p>
              <p>Current version: {chromeVersion}</p>
              <Button 
                variant="primary"
                onClick={() => window.open('chrome://settings/help', '_blank')}
              >
                Update Chrome
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Enable Writer API</h3>
                <ol className={styles.instructions}>
                  <li>
                    <span className={styles.step}>1</span>
                    Open <code>chrome://flags/#writer-api-for-gemini-nano</code> in a new tab
                    <Button 
                      variant="secondary"
                      onClick={() => window.open('chrome://flags/#writer-api-for-gemini-nano', '_blank')}
                    >
                      Open Flags
                    </Button>
                  </li>
                  <li>
                    <span className={styles.step}>2</span>
                    Find "Writer API" and set it to "Enabled"
                  </li>
                  <li>
                    <span className={styles.step}>3</span>
                    Click "Relaunch" at the bottom of the page
                  </li>
                </ol>
              </div>
              <div className={styles.note}>
                <p>After relaunching Chrome, return to PrepMate to continue your interview preparation.</p>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}