export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <div className="skeleton skeleton--badge" />
        <div className="skeleton skeleton--badge" />
      </div>
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--text-short" />
      <div className="skeleton-card__footer">
        <div className="skeleton skeleton--chip" />
        <div className="skeleton skeleton--chip" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="goals-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
