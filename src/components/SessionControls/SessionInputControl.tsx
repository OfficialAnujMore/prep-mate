import { ChangeEvent, memo } from "react";
import styles from "../../App.module.css";
import type { SessionInputControlProps } from "../../types";

const SessionInputControlComponent = (props: SessionInputControlProps) => {
  if (props.type === "text") {
    const { id, label, value, placeholder, onChange } = props;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.value);
    };

    return (
      <div className={styles.formControl}>
        <label className={styles.inputLabel} htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          className={styles.textInput}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      </div>
    );
  }

  const { id, label, value, min, max, step, onChange, valueDisplay } = props;

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value));
  };

  return (
    <div className={styles.sliderGroup}>
      <label className={styles.sliderLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.sliderControl}>
        <input
          id={id}
          className={styles.slider}
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={handleRangeChange}
        />
        {valueDisplay ?? (
          <span className={styles.sliderValue}>{value}</span>
        )}
      </div>
    </div>
  );
};

export const SessionInputControl = memo(SessionInputControlComponent);
