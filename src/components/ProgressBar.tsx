interface ProgressBarProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, label, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  let colorClass = 'progress-fill--low';
  if (clamped >= 66) colorClass = 'progress-fill--high';
  else if (clamped >= 33) colorClass = 'progress-fill--mid';

  return (
    <div className={`progress-container progress-container--${size}`}>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-fill ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
