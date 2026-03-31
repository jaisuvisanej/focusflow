const StatCard = ({ label, value, unit = '', icon: Icon, color = 'var(--accent-primary)', subtitle }) => {
  return (
    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-label">{label}</span>
        {Icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${color}20`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="stat-value" style={{ color }}>{value}</span>
          {unit && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
