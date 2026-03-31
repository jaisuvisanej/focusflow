import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Play, Square, Zap, AlertTriangle, Clock, CheckCircle,
  ChevronRight, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const FocusSession = () => {
  const { user } = useAuth();

  // Session state
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed]             = useState(0); // seconds
  const [distractions, setDistractions]   = useState(0);
  const [notes, setNotes]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [checkingActive, setCheckingActive] = useState(true);
  const [recentSessions, setRecentSessions] = useState([]);
  const intervalRef = useRef(null);

  // Restore active session on mount
  useEffect(() => {
    const loadActive = async () => {
      try {
        const { data } = await sessionAPI.getActive();
        if (data.session) {
          setActiveSession(data.session);
          setDistractions(data.session.distractionCount);
          // Compute elapsed from startTime
          const start = new Date(data.session.startTime).getTime();
          setElapsed(Math.floor((Date.now() - start) / 1000));
        }
      } catch {}
      setCheckingActive(false);
    };
    loadActive();
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const { data } = await sessionAPI.getAll({ limit: 5, active: 'false' });
      setRecentSessions(data.sessions || []);
    } catch {}
  };

  // Live timer
  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeSession]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await sessionAPI.start();
      setActiveSession(data.session);
      setElapsed(0);
      setDistractions(0);
      setNotes('');
      toast.success('Focus session started! 🎯');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    if (elapsed < 60) {
      const ok = window.confirm('Session is less than 1 minute. End anyway?');
      if (!ok) return;
    }
    setLoading(true);
    try {
      const { data } = await sessionAPI.end(activeSession._id, notes);
      toast.success(`Session complete! Focus score: ${data.session.focusScore} 🎉`);
      setActiveSession(null);
      setElapsed(0);
      loadRecent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not end session');
    } finally {
      setLoading(false);
    }
  };

  const handleDistract = async () => {
    if (!activeSession) return;
    try {
      const { data } = await sessionAPI.distract(activeSession._id);
      setDistractions(data.distractionCount);
      toast('Distraction logged 📵', { icon: '⚠️' });
    } catch {}
  };

  const focusScore = (() => {
    const mins = elapsed / 60;
    if (mins === 0) return 0;
    const rate = Math.max(1, distractions + 1);
    return Math.min(100, Math.round((mins / rate / 25) * 100));
  })();

  const getScoreColor = (s) => {
    if (s >= 75) return 'var(--accent-green)';
    if (s >= 50) return 'var(--accent-primary)';
    if (s >= 25) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  if (checkingActive) {
    return (
      <div className="loader-page">
        <div className="loader" />
        <p style={{ color: 'var(--text-muted)' }}>Checking session status…</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
              {activeSession ? (
                <span>🎯 Session in Progress</span>
              ) : (
                <span>Focus <span className="gradient-text">Session</span></span>
              )}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {activeSession
                ? 'Stay focused. Log distractions when they happen.'
                : `Welcome back, ${user?.name?.split(' ')[0]}! Ready to enter deep work?`}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Main Session Card */}
            <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '48px 32px' }}>

              {/* Timer */}
              <div style={{ textAlign: 'center' }}>
                <div className={`timer-display ${activeSession ? 'pulse' : ''}`}>
                  {formatTime(elapsed)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                  {activeSession ? 'Elapsed time' : 'Ready to start'}
                </p>
              </div>

              {/* Live stats row */}
              {activeSession && (
                <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'Outfit, sans-serif' }}>
                      {distractions}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Distractions
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(focusScore), fontFamily: 'Outfit, sans-serif' }}>
                      {focusScore}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Live Score
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'Outfit, sans-serif' }}>
                      {Math.floor(elapsed / 60)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Minutes
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {!activeSession ? (
                  <button id="start-session-btn" className="btn btn-primary" onClick={handleStart} disabled={loading}
                    style={{ padding: '16px 40px', fontSize: '1rem', borderRadius: 16 }}>
                    <Play size={20} fill="currentColor" />
                    {loading ? 'Starting…' : 'Start Focus Session'}
                  </button>
                ) : (
                  <>
                    <button
                      id="distract-btn"
                      className="btn"
                      onClick={handleDistract}
                      style={{
                        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                        color: 'var(--accent-orange)', padding: '14px 28px', fontSize: '0.95rem', borderRadius: 14,
                      }}
                    >
                      <AlertTriangle size={18} />
                      Log Distraction
                    </button>
                    <button id="end-session-btn" className="btn btn-danger" onClick={handleEnd} disabled={loading}
                      style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: 14 }}>
                      <Square size={18} fill="currentColor" />
                      {loading ? 'Ending…' : 'End Session'}
                    </button>
                  </>
                )}
              </div>

              {/* Notes */}
              {activeSession && (
                <div style={{ width: '100%', maxWidth: 480 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <BookOpen size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Session notes (optional)
                    </span>
                  </div>
                  <textarea
                    id="session-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What are you working on?"
                    rows={2}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: 12, color: 'var(--text-primary)',
                      fontSize: '0.875rem', resize: 'vertical', outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    maxLength={500}
                  />
                </div>
              )}

              {/* Tips when idle */}
              {!activeSession && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { icon: '🔕', tip: 'Silence notifications' },
                    { icon: '💧', tip: 'Get water ready' },
                    { icon: '🎯', tip: 'Set a clear goal' },
                  ].map(({ icon, tip }) => (
                    <div key={tip} style={{
                      padding: '10px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {icon} {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Sessions</h3>
                <Link to="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View analytics <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentSessions.map((s) => (
                  <div key={s._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <CheckCircle size={16} color="var(--accent-green)" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}
                          {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.duration} min · {s.distractionCount} distraction(s)
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getScoreColor(s.focusScore), fontFamily: 'Outfit, sans-serif' }}>
                        {s.focusScore}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusSession;
