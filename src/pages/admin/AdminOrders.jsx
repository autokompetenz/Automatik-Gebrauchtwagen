import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatEuro, formatDate } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_FR = { full:'Intégral (-5%)', deposit:'Acompte 25%', monthly:'Acompte 25% + Mensualités' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAll({ status: status || undefined });
      setOrders(data.orders);
      setStatusCounts(data.statusCounts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const countFor = (id) => Array.isArray(statusCounts) ? statusCounts.find(s => s.status === id)?._count?.status || 0 : 0;
  const tabs = [{ id:'', label:'Toutes' }, ...Object.entries(STATUS_LABELS).map(([id,label]) => ({ id, label }))];

  const handleTab = (id) => { setActiveTab(id); fetchOrders(id); };

  const handleDelete = async (order) => {
    if (!window.confirm(`Supprimer définitivement la commande ${order.orderNumber} ?\nCette action est irréversible.`)) return;
    setDeletingId(order.id);
    try {
      await orderAPI.remove(order.id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression de la commande');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:28 }}>
        <div className="section-eyebrow">Gestion</div>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>Commandes</h1>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => handleTab(id)}
            style={{
              padding:'9px 16px',
              borderRadius:8,
              fontSize:13,
              fontWeight:700,
              cursor:'pointer',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              transition:'all 0.2s var(--ease)',
              border:`1px solid ${activeTab===id ? 'var(--red)' : 'var(--border)'}`,
              background: activeTab===id ? 'var(--red-bg)' : 'var(--bg-card)',
              color: activeTab===id ? 'var(--red)' : 'var(--text-2)',
              boxShadow: activeTab===id ? 'none' : 'var(--shadow-sm)',
            }}>
            {label}
            {id && countFor(id) > 0 && (
              <span style={{
                marginLeft:8,
                background: activeTab===id ? 'rgba(19,40,83,0.2)' : 'var(--bg-card2)',
                padding:'2px 7px',
                borderRadius:8,
                fontSize:11,
                border: activeTab===id ? '1px solid var(--red-border)' : '1px solid var(--border)',
              }}>
                {countFor(id)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Loader text="Chargement des commandes..." /> : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['N° BC','Client','Date','Montant','Mode','Statut','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
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
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Link to={`/admin/orders/${order.id}`} className="btn-gold" style={{ fontSize:12, padding:'10px 18px', letterSpacing:'0.05em' }}>Gérer →</Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          disabled={deletingId === order.id}
                          style={{
                            fontSize:12, padding:'10px 14px', letterSpacing:'0.05em',
                            border:'1px solid rgba(220,38,38,0.35)', borderRadius:8,
                            background:'rgba(220,38,38,0.08)', color:'#DC2626',
                            cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700,
                            opacity: deletingId === order.id ? 0.5 : 1,
                            transition:'all 0.2s var(--ease)',
                          }}
                          onMouseOver={e => { if (deletingId !== order.id) { e.currentTarget.style.background = 'rgba(220,38,38,0.16)'; } }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}>
                          {deletingId === order.id ? 'Suppression…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:15, fontWeight:500 }}>Aucune commande trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
