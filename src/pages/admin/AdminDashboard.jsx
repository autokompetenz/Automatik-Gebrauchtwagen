import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_FR = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_FR = { full:'Intégral', deposit:'Acompte', monthly:'Acompte + Mensualités' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement du tableau de bord..." /></div>;
  if (!data) return null;

  const { stats, recentOrders } = data;

  const statCards = [
    { icon:'👥', label:'Clients', value:stats?.totalClients || 0, color:'#60A5FA', sub:'Total inscrits' },
    { icon:'📦', label:'Commandes', value:stats?.totalOrders || 0, color:'#C084FC', sub:'Total des commandes' },
    { icon:'💶', label:'Chiffre d\'affaires', value:formatEuro(stats?.totalRevenue || 0), color:'#132853', sub:'Hors annulées', wide:true },
    { icon:'⏳', label:'En attente', value:stats?.pendingOrders || 0, color:(stats?.pendingOrders || 0) > 0 ? '#FFAA00' : '#22C55E', sub:(stats?.pendingOrders || 0) > 0 ? 'Action requise' : 'Aucune en attente' },
    { icon:'🚗', label:'Véhicules actifs', value:stats?.totalCars || 0, color:'#22C55E', sub:'En catalogue' },
  ];

  const TABLE_COLS = ['N° Commande','Client','Date','Montant','Paiement','Statut',''];

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:36 }}>
        <div className="section-eyebrow">Administration</div>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          Tableau de bord
        </h1>
      </div>

      <div className="admin-stats-grid">
        {statCards.map(({ icon, label, value, color, sub, wide }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08, duration:0.5, ease:[0.16,1,0.3,1] }}
            className={wide ? 'admin-stat-wide' : undefined}
            style={{
              background:`linear-gradient(135deg, var(--bg-card) 0%, ${color}14 100%)`,
              border:'1px solid var(--border)',
              borderRadius:12,
              padding:'22px 20px',
              transition:'all 0.3s var(--ease)',
              position:'relative',
              overflow:'hidden',
              boxShadow:'var(--shadow-sm)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--red)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:color, opacity:0.06, borderRadius:'50%', filter:'blur(40px)' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, position:'relative', zIndex:1 }}>
              <span style={{ fontSize:26 }}>{icon}</span>
              {label==='En attente' && (stats?.pendingOrders || 0) > 0 && (
                <span style={{ fontSize:10, background:'rgba(255,170,0,0.15)', color:'#D97706', padding:'4px 10px', borderRadius:12, fontWeight:800, letterSpacing:'0.1em', border:'1px solid rgba(255,170,0,0.28)' }}>ACTION</span>
              )}
            </div>
            <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,3.5vw,40px)', color, lineHeight:1, letterSpacing:'-0.03em', position:'relative', zIndex:1 }}>{value}</div>
            <div style={{ fontSize:13, color:'var(--text-2)', marginTop:8, fontWeight:700, position:'relative', zIndex:1 }}>{label}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4, position:'relative', zIndex:1 }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-card2)' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)' }}>Dernières commandes</p>
          <Link to="/admin/orders" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none', fontWeight:600 }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--red)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-3)'; }}>
            Voir tout →
          </Link>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {TABLE_COLS.map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.2s var(--ease)' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card2)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontFamily:'monospace', color:'var(--red)', fontSize:13, fontWeight:800, letterSpacing:'0.05em', background:'var(--red-bg)', padding:'4px 10px', borderRadius:6, border:'1px solid var(--red-border)' }}>{order.orderNumber}</span>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:14, color:'var(--text)', fontWeight:700 }}>{order.user?.firstName} {order.user?.lastName}</p>
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{order.user?.email}</p>
                  </td>
                  <td style={{ padding:'14px 20px', color:'var(--text-2)', fontSize:13, fontWeight:500 }}>{formatDate(order.createdAt)}</td>
                  <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--text)', fontSize:16, letterSpacing:'-0.01em' }}>{formatEuro(order.totalPrice)}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontSize:11, background:'var(--bg-card2)', color:'var(--text-2)', padding:'5px 12px', borderRadius:6, fontWeight:700, letterSpacing:'0.04em', border:'1px solid var(--border)' }}>
                      {PAYMENT_FR[order.paymentType]}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px' }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding:'14px 20px' }}>
                    <Link to={`/admin/orders/${order.id}`} className="btn-gold" style={{ fontSize:12, padding:'10px 18px', letterSpacing:'0.05em' }}>Gérer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
