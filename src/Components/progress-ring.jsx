// Shared circular progress indicator — used by the Dashboard, Progress page,
// and the completion overlay, so the ring only needs to be built once.

export default function ProgressRing({ value = 0, max = 10, size = 96, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="ss-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ss-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="ss-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ss-ring__center">
        <span className="ss-ring__num" style={{ fontSize: size * 0.28 }}>
          {value}
        </span>
        <span className="ss-ring__denom">/ {max}</span>
      </div>
    </div>
  );
}
