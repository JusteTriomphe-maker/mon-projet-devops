interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'purple' | 'green' | 'blue' | 'orange';
}

export function StatsCard({ label, value, icon, color = 'purple' }: StatsCardProps) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__icon">{icon}</div>
      <div className="stats-card__info">
        <span className="stats-card__value">{value}</span>
        <span className="stats-card__label">{label}</span>
      </div>
    </div>
  );
}
