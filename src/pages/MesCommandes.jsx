import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { formatEuro } from '../utils/helpers';

export default function MesCommandes() {
  const { lang } = useLangStore();
  const l = lang || 'fr';
  const [email, setEmail] = useState(localStorage.getItem('ak_order_email') || '');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setLoading(true);
      setError('');
      const { data } = await orderAPI.byEmail(email.trim());
      setOrders(Array.isArray(data) ? data : []);
      localStorage.setItem('ak_order_email', email.trim());
    } catch {
      setError(l === 'fr' ? 'Erreur lors du chargement' : 'Error loading orders');
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s) => {
    const map = { fr: { pending:'En attente', confirmed:'Confirmée', processing:'En préparation', shipped:'En livraison', delivered:'Livrée', cancelled:'Annulée' },
                  en: { pending:'Pending', confirmed:'Confirmed', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' },
                  de: { pending:'Ausstehend', confirmed:'Bestätigt', processing:'In Bearbeitung', shipped:'Unterwegs', delivered:'Geliefert', cancelled:'Storniert' } };
    return (map[l] || map.fr)[s] || s;
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ padding: '52px 6% 32px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div className="section-eyebrow">{l==='fr'?'Espace client':l==='en'?'Customer area':l==='de'?'Kundenbereich':'Área cliente'}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
            {l==='fr'?'Mes commandes':l==='en'?'My orders':l==='de'?'Meine Bestellungen':'Mis pedidos'}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 6% 80px' }}>
        <form onSubmit={handleSearch} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:24, marginBottom:28 }}>
          <p style={{ fontSize:15, color:'var(--text-2)', marginBottom:14 }}>
            {l==='fr'?'Entrez l’email utilisé lors de votre commande pour voir toutes vos commandes.':l==='en'?'Enter the email used at checkout to see your orders.':l==='de'?'Geben Sie die Bestell-E-Mail ein, um Ihre Bestellungen zu sehen.':'Introduce tu email para ver tus pedidos.'}
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@exemple.fr" className="input-luxury" style={{ flex:1, fontSize:15 }} />
            <button type="submit" className="btn-primary" style={{ padding:'14px 28px' }}>{loading ? '⏳' : (l==='fr'?'Afficher':l==='en'?'Show':'Anzeigen')}</button>
          </div>
          {error && <p style={{ color:'#DC2626', marginTop:10, fontSize:14 }}>{error}</p>}
        </form>

        {orders && orders.length === 0 && (
          <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:15, padding:'40px 0' }}>
            {l==='fr'?'Aucune commande trouvée pour cet email.':l==='en'?'No orders found for this email.':'No orders found for this email.'}
          </p>
        )}

        {orders && orders.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.map(o => (
              <Link key={o.id} to={`/track/${o.orderNumber}`} style={{ textDecoration:'none', display:'block', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:'var(--text)', margin:0 }}>{o.orderNumber}</p>
                    <p style={{ fontSize:13, color:'var(--text-3)', margin:'2px 0 0' }}>{new Date(o.createdAt).toLocaleDateString(l === 'fr' ? 'fr-FR' : l === 'de' ? 'de-DE' : 'en-GB')} · {(o.items || []).map(i => `${i.car?.make} ${i.car?.model}`).join(', ')}</p>
                  </div>
                  <span className={`badge badge-${o.status}`}>{statusLabel(o.status)}</span>
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--red)', marginTop:8 }}>{formatEuro(o.totalPrice)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
