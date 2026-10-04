import { useToastStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

const CONFIG = {
  success: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: '✓' },
  error:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: '✕' },
  info:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', icon: 'ℹ' },
  warning: { color: '#FFAA00', bg: 'rgba(255,170,0,0.1)',  border: 'rgba(255,170,0,0.25)',  icon: '⚠' },
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => {
          const cfg = CONFIG[toast.type] || CONFIG.info;
          return (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={() => removeToast(toast.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: '#1A1A1C', border: `1px solid ${cfg.border}`, borderLeft: `4px solid ${cfg.color}`, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', cursor: 'pointer', minWidth: 280, maxWidth: 360 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                {cfg.icon}
              </span>
              <p style={{ fontSize: 14, color: '#E8E8E8', flex: 1, lineHeight: 1.4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
