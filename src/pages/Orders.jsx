import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useLangStore } from '../store';
import { formatEuro, formatDate } from '../utils/helpers';
import { StatusBadge, Loader } from '../components/UI';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  useEffect(() => {
    orderAPI.getMy().then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const labels = {
    title: { fr:'Mes Commandes', en:'My Orders', de:'Meine Bestellungen', es:'Mis Pedidos', it:'I miei Ordini', pt:'Meus Pedidos' },
    empty: { fr:'Aucune commande', en:'No orders yet', de:'Keine Bestellungen', es:'Sin pedidos', it:'Nessun ordine', pt:'Sem pedidos' },
    emptySub: { fr:'Découvrez notre catalogue et passez votre première commande.', en:'Discover our catalogue and place your first order.', de:'Entdecken Sie unseren Katalog und bestellen Sie.', es:'Descubra nuestro catálogo y haga su primer pedido.', it:'Scopri il nostro catalogo e fai il tuo primo ordine.', pt:'Descubra nosso catálogo e faça seu primeiro pedido.' },
    track: { fr:'Suivre', en:'Track', de:'Verfolgen', es:'Rastrear', it:'Traccia', pt:'Rastrear' },
    date: { fr:'Date', en:'Date', de:'Datum', es:'Fecha', it:'Data', pt:'Data' },
    amount: { fr:'Montant', en:'Amount', de:'Betrag', es:'Importe', it:'Importo', pt:'Valor' },
    status: { fr:'Statut', en:'Status', de:'Status', es:'Estado', it:'Stato', pt:'Status' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '36px 4% 24px' : '52px 6% 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div className="section-eyebrow">{labels.title[l]}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,5vw,56px)', color:'var(--text)', letterSpacing:'-0.02em' }}>{labels.title[l]}</h1>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding: isMobile ? '24px 4%' : '40px 6%' }}>
        {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Loader /></div>
        : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>📦</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:26, color:'var(--text)', marginBottom:10 }}>{labels.empty[l]}</h2>
            <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:28 }}>{labels.emptySub[l]}</p>
            <Link to="/catalog" className="btn-primary">{t('discover', l)}</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? '16px 14px' : '20px 24px', boxShadow:'var(--shadow-sm)', display:'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap:'wrap', gap: isMobile ? 12 : 14, alignItems: isMobile ? 'stretch' : 'center' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'monospace', fontSize:14, color:'var(--red)', fontWeight:700, marginBottom:3 }}>{order.orderNumber}</p>
                  <p style={{ fontSize:12, color:'var(--text-3)' }}>{formatDate(order.createdAt)}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', width: isMobile ? '100%' : 'auto' }}>
                  <StatusBadge status={order.status} />
                  <div style={{ textAlign: isMobile ? 'left' : 'right', marginLeft: isMobile ? 0 : 'auto' }}>
                    <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:22, color:'var(--text)' }}>{formatEuro(order.totalPrice)}</p>
                    <p style={{ fontSize:12, color:'var(--text-3)' }}>{order.items?.length || 0} {l==='fr'?'véhicule(s)':l==='en'?'vehicle(s)':l==='de'?'Fahrzeug(e)':l==='es'?'vehículo(s)':l==='it'?'veicolo/i':'veículo(s)'}</p>
                  </div>
                </div>
                <Link to={`/track/${order.orderNumber}`} className="btn-outline" style={{ fontSize:12, padding:'10px 18px', width: isMobile ? '100%' : 'auto', textAlign:'center', justifyContent:'center', display:'inline-flex', boxSizing:'border-box' }}>
                  {labels.track[l]} →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
