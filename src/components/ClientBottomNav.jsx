import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useLangStore, useCartStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { t } from '../utils/i18n';

function pathMatchesClientNav(pathname) {
  if (/^\/dashboard\/?$/.test(pathname)) return true;
  if (/^\/mes-commandes\/?$/.test(pathname)) return true;
  if (/^\/cart\/?$/.test(pathname)) return true;
  if (/^\/simulation\/?$/.test(pathname)) return true;
  if (/^\/order-confirm\//.test(pathname)) return true;
  if (/^\/track/.test(pathname)) return true;
  if (/^\/catalog\/?$/.test(pathname)) return true;
  return false;
}

export function useClientBottomNavPadding() {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();
  if (!isMobile || !pathMatchesClientNav(pathname)) return 0;
  return 'calc(56px + max(12px, env(safe-area-inset-bottom)))';
}

export default function ClientBottomNav() {
  const { pathname } = useLocation();
  const { lang } = useLangStore();
  const { cartCount } = useCartStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  if (!isMobile || !pathMatchesClientNav(pathname)) return null;

  const items = [
    { to: '/catalog', label: t('nav_vehicles', l), icon: '🚗', match: (p) => p === '/catalog' },
    { to: '/mes-commandes', label: l==='fr'?'Commandes':l==='en'?'Orders':l==='de'?'Bestellungen':'Pedidos', icon: '📦', match: (p) => p === '/mes-commandes' },
    { to: '/cart', label: t('nav_cart', l), icon: '🛒', match: (p) => p === '/cart', badge: cartCount },
    { to: '/simulation', label: t('nav_financing', l), icon: '🧮', match: (p) => p === '/simulation' },
    { to: '/track', label: t('nav_track', l) || 'Suivi', icon: '📍', match: (p) => p.startsWith('/track') },
  ];

  return (
    <nav
      aria-label="Navigation espace client"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 950,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        padding: '6px 4px max(8px, env(safe-area-inset-bottom))',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {items.map(({ to, label, icon, match, badge }) => {
        const active = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '4px 2px',
              textDecoration: 'none',
              color: active ? 'var(--red)' : 'var(--text-3)',
              fontSize: 10,
              fontWeight: active ? 800 : 600,
              fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
              borderRadius: 10,
              background: active ? 'var(--red-bg)' : 'transparent',
              border: active ? '1px solid var(--red-border)' : '1px solid transparent',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, position: 'relative' }}>
              {icon}
              {badge > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    borderRadius: 8,
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-card)',
                  }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              ) : null}
            </span>
            <span style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
