import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(30,169,233,0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(30,169,233,0.12)',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem' }}>
          {payload[0].value} pts
        </p>
      </div>
    );
  }
  return null;
};

const WeeklyChart = ({ data = [] }) => {
  const formatted = data.map((d) => ({
    day:   new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    score: d.dailyScore || 0,
    date:  d.date,
  }));

  const getBarColor = (score) => {
    if (score >= 75) return '#059669';
    if (score >= 50) return '#1ea9e9';
    if (score >= 25) return '#f59e0b';
    return '#cbd5e1';
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Weekly Productivity</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Daily focus scores over the last 7 days
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,169,233,0.08)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,169,233,0.05)' }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {formatted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
