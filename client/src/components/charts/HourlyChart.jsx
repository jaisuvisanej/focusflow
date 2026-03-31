import React from 'react';

const HourlyChart = ({ data = [] }) => {
  const hours24 = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return found || { hour: i, score: 0, sessions: 0 };
  });

  const formatHour = (h) => {
    if (h === 0)   return '12a';
    if (h < 12)    return `${h}a`;
    if (h === 12)  return '12p';
    return `${h - 12}p`;
  };

  const getColor = (score) => {
    if (score === 0) return 'rgba(30,169,233,0.06)';
    const intensity = score / 100;
    if (score >= 70) return `rgba(5,150,105,${0.2 + intensity * 0.65})`;
    if (score >= 40) return `rgba(30,169,233,${0.25 + intensity * 0.6})`;
    return `rgba(245,158,11,${0.2 + intensity * 0.6})`;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hourly Activity</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Focus intensity by hour (last 7 days)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
        {hours24.slice(0, 12).map((h) => (
          <HourCell key={h.hour} h={h} getColor={getColor} formatHour={formatHour} />
        ))}
        {hours24.slice(12, 24).map((h) => (
          <HourCell key={h.hour} h={h} getColor={getColor} formatHour={formatHour} />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'No Activity', color: 'rgba(30,169,233,0.06)', border: 'rgba(30,169,233,0.15)' },
          { label: 'Low',         color: 'rgba(245,158,11,0.5)',  border: 'rgba(245,158,11,0.3)' },
          { label: 'Medium',      color: 'rgba(30,169,233,0.55)', border: 'rgba(30,169,233,0.3)' },
          { label: 'High',        color: 'rgba(5,150,105,0.75)',  border: 'rgba(5,150,105,0.4)' },
        ].map(({ label, color, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: color, border: `1px solid ${border}` }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HourCell = ({ h, getColor, formatHour }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`${formatHour(h.hour)}: Score ${h.score}, ${h.sessions} session(s)`}
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 6,
          background: getColor(h.score),
          border: '1px solid rgba(30,169,233,0.12)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          cursor: h.sessions > 0 ? 'pointer' : 'default',
          transform: hovered && h.sessions > 0 ? 'scale(1.15)' : 'scale(1)',
          boxShadow: hovered && h.sessions > 0 ? '0 4px 12px rgba(30,169,233,0.25)' : 'none',
        }}
      />
      {h.hour % 3 === 0 && (
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1 }}>
          {formatHour(h.hour)}
        </span>
      )}
    </div>
  );
};

export default HourlyChart;
