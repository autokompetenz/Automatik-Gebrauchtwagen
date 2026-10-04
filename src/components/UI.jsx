import { motion } from 'framer-motion';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';

export function Loader({ size = 'md', text }) {
  const s = { sm:32, md:48, lg:64 }[size] || 48;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'60px 20px' }}>
      <div style={{ width:s, height:s, border:`3px solid rgba(19,40,83,0.15)`, borderTopColor:'#132853', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      {text && <p style={{ fontSize:14, color:'var(--text-3)', letterSpacing:'0.05em' }}>{text}</p>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const { lang } = useLangStore();
  const l = lang || 'fr';
  const labels = {
    pending:    t('status_pending', l),
    confirmed:  t('status_confirmed', l),
    processing: t('status_processing', l),
    shipped:    t('status_shipped', l),
    delivered:  t('status_delivered', l),
    cancelled:  t('status_cancelled', l),
  };
  return (
    <span className={`badge badge-${status}`}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
      {labels[status] || status}
    </span>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ position:'relative', paddingTop:120, paddingBottom:60, paddingLeft:'6%', paddingRight:'6%', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(19,40,83,0.05) 0%, transparent 70%)' }} />
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }} style={{ position:'relative', zIndex:1 }}>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(36px,5vw,76px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1, marginBottom:14 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize:17, color:'var(--text-3)', maxWidth:520, lineHeight:1.65 }}>{subtitle}</p>}
        {children && <div style={{ marginTop:22 }}>{children}</div>}
      </motion.div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:64, marginBottom:20 }}>{icon}</div>
      <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:26, color:'var(--text)', marginBottom:10 }}>{title}</h3>
      <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:32, lineHeight:1.65 }}>{subtitle}</p>
      {action}
    </div>
  );
}

export function SectionCard({ children, style = {} }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)', ...style }}>
      {children}
    </div>
  );
}
