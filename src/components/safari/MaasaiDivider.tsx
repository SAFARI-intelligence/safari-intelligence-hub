export function MaasaiDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <svg width="80" height="14" viewBox="0 0 80 14" className="text-[var(--maasai)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <polygon
            key={i}
            points={`${i * 10},10 ${i * 10 + 5},2 ${i * 10 + 10},10`}
            fill={i % 2 === 0 ? "var(--maasai)" : "var(--gold)"}
          />
        ))}
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
