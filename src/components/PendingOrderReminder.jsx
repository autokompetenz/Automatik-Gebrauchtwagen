import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useAuthStore, useLangStore } from '../store';
import { t } from '../utils/i18n';
import { formatEuro } from '../utils/helpers';

export default function PendingOrderReminder() {
  const { isAuthenticated, user } = useAuthStore();
  const { lang } = useLangStore();
  const { pathname } = useLocation();
  const l = lang || 'fr';
  const [pendingOrder, setPendingOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPending = async () => {
      try {
        let orders = [];
        if (isAuthenticated && user?.role !== 'ADMIN') {
          const r = await orderAPI.getMy();
          orders = Array.isArray(r.data) ? r.data : [];
        } else {
          const email = localStorage.getItem('ak_order_email');
          if (!email) return;
          const r = await orderAPI.byEmail(email);
          orders = Array.isArray(r.data) ? r.data : [];
        }
        if (cancelled) return;
        const pending = orders.find((o) => o.status === 'pending');
        setPendingOrder(pending || null);
      } catch {}
    };
    fetchPending();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.role, pathname]);

  if (!pendingOrder) return null;

  const amountDue = pendingOrder.paymentType === 'full'
    ? pendingOrder.totalPrice
    : (pendingOrder.depositAmount || pendingOrder.totalPrice);

  return (
    <>
      {/* Cloche flottante animée */}
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, type: 'spring', damping: 14 },
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed', bottom: 88, right: 18, zIndex: 999,
          width: 52, height: 52, borderRadius: '50%',
          background: '#132853', color: '#fff', fontSize: 22,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(19,40,83,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label={t('reminder_title', l)}
      >
        <motion.span
          animate={{ rotate: [0, -14, 10, -10, 6, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
          style={{ display: 'inline-block' }}
        >🔔</motion.span>
        <span style={{
          position: 'absolute', top: -4, right: -4,
          minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
          background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg)',
        }}>1</span>
      </motion.button>

      {/* Panneau informatif */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 152, right: 18, zIndex: 999,
              width: 300, padding: '18px 16px', borderRadius: 16,
              background: 'var(--bg-card)', border: '1px solid var(--red-border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 8 }}>💳</div>
            <h3 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 16, color: 'var(--red)', marginBottom: 6 }}>
              {t('reminder_title', l)}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 14 }}>
              {t('reminder_msg', l)}
            </p>
            <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>
                {pendingOrder.orderNumber}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>{t('reminder_amount', l)}</span>
                <span style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>{formatEuro(amountDue)}</span>
              </div>
            </div>
            <Link to={`/track/${pendingOrder.orderNumber}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} onClick={() => setOpen(false)}>
              {t('reminder_cta', l)} →
            </Link>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
              {t('reminder_later', l)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
