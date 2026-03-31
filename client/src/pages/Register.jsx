import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))  errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6)          errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)              errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Let\'s start focusing 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ global: msg });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',            label: 'Full Name',       type: 'text',                            icon: User, placeholder: 'John Doe',         autoComplete: 'name' },
    { name: 'email',           label: 'Email address',   type: 'email',                           icon: Mail, placeholder: 'you@example.com',  autoComplete: 'email' },
    { name: 'password',        label: 'Password',        type: showPass ? 'text' : 'password',    icon: Lock, placeholder: 'Min 6 characters',  autoComplete: 'new-password', eye: true },
    { name: 'confirmPassword', label: 'Confirm Password',type: showPass ? 'text' : 'password',    icon: Lock, placeholder: 'Repeat your password', autoComplete: 'new-password' },
  ];

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
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Join FocusFlow and unlock your productivity potential</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {errors.global && (
              <div style={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{errors.global}</span>
              </div>
            )}

            {fields.map(({ name, label, type, icon: Icon, placeholder, autoComplete, eye }) => (
              <div key={name} className="form-group">
                <label className="form-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} style={styles.inputIcon} />
                  <input
                    id={name}
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="form-input"
                    style={{ paddingLeft: 42, paddingRight: eye ? 44 : 16 }}
                    autoComplete={autoComplete}
                  />
                  {eye && (
                    <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[name] && <span className="form-error">{errors[name]}</span>}
              </div>
            ))}

            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={styles.spinner} />
                  Creating account…
                </span>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Already have an account? </span>
            <Link to="/login" style={styles.link}>Sign in</Link>
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
    padding: 20, position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', top: '-20%', right: '-10%',
    width: 550, height: 550, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,169,233,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', bottom: '-20%', left: '-10%',
    width: 450, height: 450, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 440,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 28, position: 'relative', zIndex: 1,
  },
  brand: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 56, height: 56, borderRadius: 18,
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(30,169,233,0.4)',
  },
  brandName: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.8rem', fontWeight: 800,
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(30,169,233,0.15)',
    borderRadius: 24,
    padding: '32px 28px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(30,169,233,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 10,
    background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)',
    color: 'var(--accent-red)', fontSize: '0.875rem',
  },
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
  footer: { marginTop: 20, textAlign: 'center' },
  link: { color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' },
};

export default Register;
