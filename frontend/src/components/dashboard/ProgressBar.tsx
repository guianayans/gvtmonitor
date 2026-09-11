interface ProgressBarProps {
  value: number;
  accent?: string;
}

export function ProgressBar({ value, accent = '#67e8f9' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${accent}, #a855f7)` }}
      />
    </div>
  );
}
