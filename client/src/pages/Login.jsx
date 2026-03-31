import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields are required'); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoIcon} className="float">
            <Zap size={28} color="#fff" fill="#fff" />
          </div>
          <h1 style={styles.brandName}>FocusFlow</h1>
          <p style={styles.tagline}>AI-Powered Productivity Intelligence</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to continue your focus journey</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={styles.spinner} />
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
            </span>
            <Link to="/register" style={styles.link}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', top: '-15%', left: '-10%',
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,169,233,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', bottom: '-20%', right: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 28, position: 'relative', zIndex: 1,
  },
  brand: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(30,169,233,0.4)',
  },
  brandName: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2rem', fontWeight: 800,
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  tagline: {
    color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center',
  },
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(30,169,233,0.15)',
    borderRadius: 24,
    padding: '36px 32px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(30,169,233,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)',
  },
  subtitle: {
    color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 10,
    background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)',
    color: 'var(--accent-red)', fontSize: '0.875rem',
  },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
  },
  spinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: { marginTop: 24, textAlign: 'center' },
  link: { color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' },
};

export default Login;
