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

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'ADMIN') return;
    let cancelled = false;
    orderAPI.getMy()
      .then((r) => {
        if (cancelled) return;
        const orders = Array.isArray(r.data) ? r.data : [];
        const pending = orders.find((o) => o.status === 'pending');
        setPendingOrder(pending || null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.role, pathname]);

  if (!pendingOrder) return null;

  const amountDue = pendingOrder.paymentType === 'full'
    ? pendingOrder.totalPrice
    : (pendingOrder.depositAmount || pendingOrder.totalPrice);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        onClick={() => setPendingOrder(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 420,
            background: 'var(--bg-card)', border: '1px solid var(--red-border)',
            borderRadius: 16, boxShadow: 'var(--shadow-lg, 0 24px 60px rgba(0,0,0,0.35))',
            padding: '28px 26px', textAlign: 'center',
          }}
        >
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
            background: 'var(--red-bg)', border: '1px solid var(--red-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            💳
          </div>

          <h3 style={{
            fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 20,
            color: 'var(--red)', marginBottom: 10,
          }}>
            {t('reminder_title', l)}
          </h3>

          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 20 }}>
            {t('reminder_msg', l)}
          </p>

          <div style={{
            background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '14px 16px', marginBottom: 24,
          }}>
            <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>
              {pendingOrder.orderNumber}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {t('reminder_amount', l)}
              </span>
              <span style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>
                {formatEuro(amountDue)}
              </span>
            </div>
          </div>

          <Link
            to={`/track/${pendingOrder.orderNumber}`}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
          >
            {t('reminder_cta', l)} →
          </Link>
          <button
            type="button"
            onClick={() => setPendingOrder(null)}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
          >
            {t('reminder_later', l)}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
