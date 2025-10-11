import styles from './TextArea.module.css';
import type { TextAreaProps } from '../../types';

export function TextArea({
  label,
  helperText,
  error = false,
  className,
  wrapperClassName,
  ...rest
}: TextAreaProps) {
  const containerClass = [styles.container, wrapperClassName]
    .filter(Boolean)
    .join(' ');

  const textAreaClass = [styles.textArea, error ? styles.error : null, className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={containerClass}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea className={textAreaClass} {...rest} />
      {helperText && (
        <span className={error ? styles.errorText : styles.helperText}>{helperText}</span>
      )}
    </label>
  );
}

export default TextArea;
