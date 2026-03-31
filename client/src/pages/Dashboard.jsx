import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Target, Clock, AlertTriangle, TrendingUp,
  Play, RefreshCw, Sun, Moon
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import WeeklyChart from '../components/charts/WeeklyChart';
import HourlyChart from '../components/charts/HourlyChart';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary]           = useState(null);
  const [insights, setInsights]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [insightLoad, setInsightLoad]   = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sumRes, insRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getInsights(),
      ]);
      setSummary(sumRes.data.summary);
      setInsights(insRes.data.insights || []);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
      setInsightLoad(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analyticsAPI.compute();
      await loadData();
      toast.success('Analytics refreshed!');
    } catch {
      toast.error('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  const today       = summary?.today || {};
  const hourlyData  = summary?.combinedHourly || [];
  const weeklyData  = summary?.weeklyData || [];

  const formatHour = (h) => {
    if (h === null || h === undefined) return '—';
    const suffix  = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}${suffix}`;
  };

  if (loading) {
    return (
      <div className="loader-page">
        <div className="loader" />
        <p style={{ color: 'var(--text-muted)' }}>Loading your analytics…</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <div className="container">

          {/* ── Header ──────────────────────────────────── */}
          <div className="dash-header">
            <div className="dash-header-title">
              <h1>
                Good {getGreeting()},{' '}
                <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="dash-header-actions">
              <button
                id="refresh-analytics-btn"
                className="btn btn-secondary"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ padding: '10px 18px', fontSize: '0.875rem' }}
              >
                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <Link
                to="/session"
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                <Play size={14} fill="currentColor" />
                New Session
              </Link>
            </div>
          </div>

          {/* ── Score Ring + Stat Cards ──────────────────── */}
          <div className="score-stats-row">

            {/* Score card spans full row on small screens */}
            <div className="card score-card-full score-card-wrap">
              <div className="score-rings-wrap">
                <ScoreRing score={today.dailyScore  || 0} label="Today"  size={120} />
                <ScoreRing score={summary?.weeklyScore || 0} label="Weekly" size={120} color="#22d3ee" />
              </div>
            </div>

            <StatCard
              label="Sessions Today"
              value={today.totalSessions || 0}
              icon={Target}
              color="var(--accent-primary)"
              subtitle="Focus sessions completed"
            />
            <StatCard
              label="Focus Minutes"
              value={Math.round(today.totalDuration || 0)}
              unit="min"
              icon={Clock}
              color="var(--accent-cyan)"
              subtitle="Deep work today"
            />
            <StatCard
              label="Distractions"
              value={today.totalDistractions || 0}
              icon={AlertTriangle}
              color="var(--accent-orange)"
              subtitle="Logged interruptions"
            />
            <StatCard
              label="Avg Session"
              value={Math.round(today.averageSessionTime || 0)}
              unit="min"
              icon={TrendingUp}
              color="var(--accent-green)"
              subtitle="Per session"
            />
          </div>

          {/* ── Productive Hours ─────────────────────────── */}
          <div className="prod-hours-grid">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={styles.hourIcon('rgba(245,158,11,0.15)', 'rgba(245,158,11,0.25)')}>
                <Sun size={20} color="var(--accent-orange)" />
              </div>
              <div>
                <div style={styles.hourLabel}>Most Productive Hour</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-orange)' }}>
                  {formatHour(summary?.mostProductiveHour)}
                </div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={styles.hourIcon('rgba(108,99,255,0.15)', 'rgba(108,99,255,0.25)')}>
                <Moon size={20} color="var(--accent-secondary)" />
              </div>
              <div>
                <div style={styles.hourLabel}>Least Productive Hour</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-secondary)' }}>
                  {formatHour(summary?.leastProductiveHour)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Charts Row ───────────────────────────────── */}
          <div className="charts-grid" style={{ marginBottom: 20 }}>
            <WeeklyChart data={weeklyData} />
            <InsightCard insights={insights} loading={insightLoad} />
          </div>

          {/* ── Hourly Heatmap ───────────────────────────── */}
          <HourlyChart data={hourlyData} />

          {/* ── Empty State ──────────────────────────────── */}
          {today.totalSessions === 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No sessions today yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                  Start your first focus session to begin tracking your productivity.
                </p>
                <Link to="/session" className="btn btn-primary">
                  <Play size={16} fill="currentColor" /> Start Focusing
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const styles = {
  hourIcon: (bg, border) => ({
    width: 44, height: 44, borderRadius: 12,
    background: bg, border: `1px solid ${border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }),
  hourLabel: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    fontWeight: 600, marginBottom: 4,
  },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
