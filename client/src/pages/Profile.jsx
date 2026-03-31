import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
  User, Mail, Shield, Calendar, LogOut,
  Target, Clock, AlertTriangle, TrendingUp,
  Star, Award, Activity, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const { data } = await analyticsAPI.getSummary();
      setSummary(data.summary);
    } catch (err) {
      console.error('Profile analytics error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully. See you soon! 👋');
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
      setLoggingOut(false);
    }
  };

  const today       = summary?.today || {};
  const weeklyScore = summary?.weeklyScore || 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Excellent', color: 'var(--accent-green)' };
    if (s >= 60) return { label: 'Great',     color: '#1ea9e9' };
    if (s >= 40) return { label: 'Good',      color: 'var(--accent-orange)' };
    if (s >= 20) return { label: 'Fair',      color: 'var(--accent-orange)' };
    return              { label: 'Just started', color: 'var(--text-muted)' };
  };

  const scoreInfo = getScoreLabel(weeklyScore);

  const stats = [
    { label: 'Sessions Today',   value: today.totalSessions || 0,                  unit: '',    icon: Target,        color: 'var(--accent-primary)' },
    { label: 'Focus Minutes',    value: Math.round(today.totalDuration || 0),       unit: 'min', icon: Clock,         color: '#7c3aed' },
    { label: 'Distractions',     value: today.totalDistractions || 0,               unit: '',    icon: AlertTriangle, color: 'var(--accent-orange)' },
    { label: 'Avg Session',      value: Math.round(today.averageSessionTime || 0),  unit: 'min', icon: TrendingUp,    color: 'var(--accent-green)' },
  ];

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <div className="container" style={{ maxWidth: 780 }}>

          {/* ── Page Title ──────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
              My <span className="gradient-text">Profile</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage your account and review your productivity status
            </p>
          </div>

          {/* ── Identity Card ────────────────────────── */}
          <div className="card" style={{ marginBottom: 20, padding: '32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div style={styles.avatarLarge}>
                <span style={styles.avatarInitials}>{initials}</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{user?.name}</h2>
                  <span style={styles.roleBadge}>{user?.role || 'user'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  <div style={styles.infoRow}>
                    <Mail size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span style={styles.infoText}>{user?.email}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <Calendar size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span style={styles.infoText}>Member since {memberSince}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <Shield size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                    <span style={{ ...styles.infoText, color: 'var(--accent-green)', fontWeight: 600 }}>
                      Account verified & active
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Score Badge */}
              <div style={styles.scoreBadge}>
                <Star size={18} color={scoreInfo.color} fill={scoreInfo.color} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: scoreInfo.color, lineHeight: 1 }}>
                    {weeklyScore}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                    Weekly Score
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreInfo.color, marginTop: 4 }}>
                    {scoreInfo.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Today's Stats ────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={styles.sectionTitle}>
              <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
              Today's Activity
            </h3>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <div className="loader" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                {stats.map(({ label, value, unit, icon: Icon, color }) => (
                  <div key={label} className="card fade-in" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={styles.statChipLabel}>{label}</span>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={color} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color, lineHeight: 1 }}>{value}</span>
                      {unit && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Productivity Summary ─────────────────── */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={styles.sectionTitle}>
              <Award size={16} style={{ color: 'var(--accent-primary)' }} />
              Productivity Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
              {[
                {
                  label: 'Most productive hour',
                  value: formatHour(summary?.mostProductiveHour),
                  desc: 'Your peak performance window',
                },
                {
                  label: 'Least productive hour',
                  value: formatHour(summary?.leastProductiveHour),
                  desc: 'Best time to take breaks',
                },
                {
                  label: 'Weekly focus score',
                  value: `${weeklyScore} / 100`,
                  desc: scoreInfo.label,
                },
              ].map((item, i) => (
                <div key={i} style={styles.summaryRow}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-primary)' }}>
                      {item.value}
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Account Actions ──────────────────────── */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={styles.sectionTitle}>
              <User size={16} style={{ color: 'var(--accent-primary)' }} />
              Account
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
              You are signed in as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>.
              Logging out will clear your session from this device.
            </p>
            <button
              id="profile-logout-btn"
              className="btn btn-danger"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ gap: 10 }}
            >
              <LogOut size={17} />
              {loggingOut ? 'Logging out…' : 'Log Out of FocusFlow'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const formatHour = (h) => {
  if (h === null || h === undefined) return '—';
  const suffix  = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${suffix}`;
};

const styles = {
  avatarLarge: {
    width: 88, height: 88, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 28px rgba(30,169,233,0.35)',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif',
    lineHeight: 1, letterSpacing: '0.02em',
  },
  roleBadge: {
    padding: '3px 12px', borderRadius: 99,
    background: 'rgba(30,169,233,0.12)',
    border: '1px solid rgba(30,169,233,0.3)',
    color: 'var(--accent-primary)',
    fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
    letterSpacing: '0.06em',
  },
  infoRow: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  infoText: {
    fontSize: '0.875rem', color: 'var(--text-secondary)',
  },
  scoreBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '20px 24px', borderRadius: 16,
    background: 'rgba(30,169,233,0.06)',
    border: '1px solid rgba(30,169,233,0.15)',
    minWidth: 110, flexShrink: 0,
  },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.95rem', fontWeight: 700,
    marginBottom: 16, color: 'var(--text-primary)',
  },
  statChipLabel: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600,
  },
  summaryRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid var(--border)',
  },
};

export default Profile;
