import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, Timer, LogOut, Menu, X, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/session',   label: 'Focus',     icon: Timer },
    { to: '/profile',   label: 'Profile',   icon: UserCircle },
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>

        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <div style={styles.logoIcon}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={styles.logoText}>FocusFlow</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-desktop-links">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}>
                <Icon size={16} />
                {label}
                {active && <span style={styles.linkDot} />}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right side */}
        <div className="navbar-right-desktop">
          {/* <div style={styles.userChip}>
            <div style={styles.avatar}>
              <span style={styles.avatarInitial}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
          </div> */}
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {/* User greeting */}
          <div style={styles.mobileUser}>
            <div style={styles.avatar}>
              <span style={styles.avatarInitial}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <div style={styles.mobileDivider} />

          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{ ...styles.mobileLink, ...(active ? styles.mobileLinkActive : {}) }}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
                {active && <span style={styles.mobileLinkBadge} />}
              </Link>
            );
          })}

          <div style={styles.mobileDivider} />

          <button onClick={handleLogout} style={styles.mobileLinkBtn}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(30,169,233,0.08)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(30,169,233,0.4)',
    flexShrink: 0,
  },
  logoText: {
    color: 'var(--accent-primary)',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 800,
    fontSize: '1.25rem',
  },
  link: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem', fontWeight: 500,
    transition: 'var(--transition)',
    position: 'relative',
    textDecoration: 'none',
  },
  linkActive: {
    background: 'rgba(30,169,233,0.1)',
    color: 'var(--accent-primary)',
    fontWeight: 600,
  },
  linkDot: {
    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-primary)',
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(30,169,233,0.06)',
    border: '1px solid var(--border)',
    cursor: 'default',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: '0.75rem', fontWeight: 800, color: '#fff', lineHeight: 1,
  },
  userName: {
    fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(225,29,72,0.06)',
    border: '1px solid rgba(225,29,72,0.18)',
    color: 'var(--accent-red)',
    fontSize: '0.875rem', fontWeight: 600,
    transition: 'var(--transition)',
    cursor: 'pointer',
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    padding: '10px 16px 16px',
    borderTop: '1px solid var(--border)',
    gap: 4,
    background: 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 12px 32px rgba(30,169,233,0.12)',
    animation: 'fadeIn 0.15s ease forwards',
  },
  mobileUser: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px 12px',
  },
  mobileDivider: {
    height: 1, background: 'var(--border)', margin: '4px 0',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem', fontWeight: 500,
    textDecoration: 'none',
    transition: 'var(--transition)',
    position: 'relative',
  },
  mobileLinkActive: {
    background: 'rgba(30,169,233,0.08)',
    color: 'var(--accent-primary)',
    fontWeight: 600,
  },
  mobileLinkBadge: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)',
  },
  mobileLinkBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(225,29,72,0.06)',
    border: '1px solid rgba(225,29,72,0.15)',
    color: 'var(--accent-red)',
    fontSize: '0.95rem', fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition)',
    marginTop: 4,
    width: '100%',
  },
};

export default Navbar;
