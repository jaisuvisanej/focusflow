import { Lightbulb, Loader } from 'lucide-react';

const InsightCard = ({ insights = [], loading = false }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lightbulb size={18} color="var(--accent-orange)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>AI Insights</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Based on last 7 days</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader size={24} color="var(--accent-primary)" className="spin" />
          </div>
        ) : insights.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
            Complete sessions to unlock AI insights
          </p>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="insight-item fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              {insight}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InsightCard;
