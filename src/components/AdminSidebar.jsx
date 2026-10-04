import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore, useLangStore } from '../store';
import { getInitials } from '../utils/helpers';
import { t } from '../utils/i18n';

const links = [
  { to: '/admin', exact: true, icon: '⊞', label: 'Dashboard' },
  { to: '/admin/orders', icon: '📦', label: 'Commandes' },
  { to: '/admin/cars', icon: '🚗', label: 'Véhicules' },
  { to: '/admin/cars/new', icon: '＋', label: 'Ajouter un véhicule' },
  { to: '/admin/clients', icon: '👥', label: 'Clients' },
  { to: '/admin/settings', icon: '💳', label: 'Paiement' },
];

export default function AdminSidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const l = lang || 'fr';

  const closeIfMobile = () => {
    if (typeof onClose === 'function' && window.matchMedia('(max-width: 767px)').matches) onClose();
  };

  return (
    <aside
      id="admin-sidebar-nav"
      className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
      style={{
        width: 268,
        minHeight: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/admin" onClick={closeIfMobile} style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 16, fontWeight: 900, color: 'var(--text)', letterSpacing: '0.04em' }}>
            AUTO <span style={{ color: 'var(--red)' }}>PARK</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 6, fontWeight: 700 }}>
            Administration
          </div>
        </NavLink>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px', overflowY: 'auto' }}>
        <div
          style={{
            background: 'var(--bg-card2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 18,
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#0E1E3D,#132853)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
              fontWeight: 900,
              fontSize: 17,
              color: '#fff',
              margin: '0 auto 12px',
              boxShadow: '0 6px 18px rgba(19,40,83,0.28)',
            }}
          >
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.01em' }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Administrateur
          </p>
        </div>

        <nav
          style={{
            background: 'var(--bg-card2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 6,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {links.map(({ to, icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={closeIfMobile}
              className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: 17, width: 22, textAlign: 'center', opacity: isActive ? 1 : 0.85 }}>{icon}</span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ padding: '12px 14px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
        <button
          type="button"
          onClick={() => {
            toggle();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 8,
            fontSize: 14,
            color: 'var(--text-2)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
            fontWeight: 600,
            textAlign: 'left',
            marginBottom: 8,
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--red)';
            e.currentTarget.style.color = 'var(--red)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-2)';
          }}
        >
          <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{isDark ? '☀️' : '🌙'}</span>
          {isDark ? t('light_mode', l) : t('dark_mode', l)}
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
            closeIfMobile();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 8,
            fontSize: 14,
            color: '#DC2626',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.18)',
            cursor: 'pointer',
            fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
            fontWeight: 700,
            textAlign: 'left',
            marginBottom: 6,
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
          }}
        >
          <span style={{ width: 22, textAlign: 'center' }}>→</span>
          Déconnexion
        </button>

        <NavLink
          to="/"
          onClick={closeIfMobile}
          style={{
            display: 'block',
            fontSize: 13,
            color: 'var(--text-3)',
            textDecoration: 'none',
            padding: '8px 14px',
            fontWeight: 600,
            borderRadius: 8,
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.background = 'var(--red-bg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'var(--text-3)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ← Retour au site
        </NavLink>
      </div>
    </aside>
  );
}
