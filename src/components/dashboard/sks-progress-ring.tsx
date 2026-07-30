interface SksProgressRingProps {
  current: number;
  target: number;
}

/**
 * Signature dashboard visual: SKS tempuh divakan sebagai progress ring
 * menuju total SKS kelulusan — bukan sekadar dekorasi, tapi satu-satunya
 * angka yang paling ingin dilihat mahasiswa setiap kali login.
 */
export function SksProgressRing({ current, target }: SksProgressRingProps) {
  const pct = Math.min(current / target, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-serif text-2xl font-semibold text-foreground">{current}</span>
        <span className="text-xs text-muted-foreground">dari {target} SKS</span>
      </div>
    </div>
  );
}
