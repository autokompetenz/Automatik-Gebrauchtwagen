import { useBreakpoint } from '../hooks/useBreakpoint';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI, bankAPI } from '../services/api';
import { formatEuro, formatDate, timeAgo, STATUS_STEPS } from '../utils/helpers';
import { StatusBadge, Loader } from '../components/UI';
import BankDetails from '../components/BankDetails';
import { useLangStore } from '../store';

const STEP_ICONS = { pending:'📋', confirmed:'✅', processing:'🔧', shipped:'🚚', delivered:'🏠' };

const STATUS_LABELS_ML = {
  fr:{ pending:'En attente',   confirmed:'Confirmée',   processing:'En traitement',     shipped:'Expédiée', delivered:'Livrée',    cancelled:'Annulée' },
  en:{ pending:'Pending',      confirmed:'Confirmed',   processing:'Processing',         shipped:'Shipped',  delivered:'Delivered', cancelled:'Cancelled' },
  de:{ pending:'Ausstehend',   confirmed:'Bestätigt',   processing:'In Bearbeitung',     shipped:'Versandt', delivered:'Geliefert', cancelled:'Storniert' },
  es:{ pending:'Pendiente',    confirmed:'Confirmado',  processing:'En proceso',         shipped:'Enviado',  delivered:'Entregado', cancelled:'Cancelado' },
  it:{ pending:'In attesa',    confirmed:'Confermato',  processing:'In elaborazione',    shipped:'Spedito',  delivered:'Consegnato',cancelled:'Annullato' },
  pt:{ pending:'Pendente',     confirmed:'Confirmado',  processing:'Em processamento',   shipped:'Enviado',  delivered:'Entregue',  cancelled:'Cancelado' },
};

const PAYMENT_ML = {
  fr:{ full:'Paiement intégral (-5%)',   deposit:'Acompte 25%',   monthly:'Acompte 25% + 60 mensualités' },
  en:{ full:'Full payment (-5%)',         deposit:'25% deposit',   monthly:'25% deposit + 60 monthly payments' },
  de:{ full:'Vollzahlung (-5%)',          deposit:'Anzahlung 25%', monthly:'25% Anzahlung + 60 Raten' },
  es:{ full:'Pago completo (-5%)',        deposit:'Señal 25%',     monthly:'Señal 25% + 60 cuotas' },
  it:{ full:'Pagamento completo (-5%)',   deposit:'Acconto 25%',   monthly:'Acconto 25% + 60 rate' },
  pt:{ full:'Pagamento integral (-5%)',   deposit:'Entrada 25%',   monthly:'Entrada 25% + 60 parcelas' },
};

export default function Track() {
  const { orderNumber: paramNum } = useParams();
  const navigate = useNavigate();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [input, setInput] = useState(paramNum || '');
  const [order, setOrder] = useState(null);
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(!!paramNum);
  const [error, setError] = useState('');
  const l = lang || 'fr';

  const SL = STATUS_LABELS_ML[l] || STATUS_LABELS_ML.fr;
  const PL = PAYMENT_ML[l] || PAYMENT_ML.fr;

  const fetchOrder = async (num) => {
    setLoading(true); setError(''); setOrder(null);
    try {
      const { data } = await orderAPI.track(num.trim().toUpperCase());
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.error || (
        l==='fr'?'Commande introuvable.':l==='en'?'Order not found.':l==='de'?'Bestellung nicht gefunden.':l==='es'?'Pedido no encontrado.':l==='it'?'Ordine non trovato.':'Pedido não encontrado.'
      ));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    bankAPI.get().then(r => setBank(r.data?.bank || null)).catch(() => {});
  }, []);

  useState(() => { if (paramNum) fetchOrder(paramNum); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) { navigate(`/track/${input.trim().toUpperCase()}`, { replace:true }); fetchOrder(input.trim()); }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  const L = {
    title:     { fr:'Suivre ma commande',  en:'Track my order',    de:'Bestellung verfolgen',  es:'Seguir mi pedido',       it:'Traccia ordine',         pt:'Rastrear pedido' },
    label:     { fr:'Suivi de commande',   en:'Order tracking',    de:'Bestellverfolgung',     es:'Seguimiento del pedido', it:'Tracciamento ordine',    pt:'Rastreamento do pedido' },
    sub:       { fr:'Entrez votre numéro de bon de commande', en:'Enter your order number', de:'Bestellnummer eingeben', es:'Introduce tu número de pedido', it:'Inserisci il tuo numero ordine', pt:'Insira o número do seu pedido' },
    search:    { fr:'Rechercher',          en:'Search',            de:'Suchen',                es:'Buscar',                 it:'Cerca',                  pt:'Pesquisar' },
    order:     { fr:'Bon de commande',     en:'Order number',      de:'Bestellnummer',         es:'Número de pedido',       it:'Numero ordine',          pt:'Número do pedido' },
    placed:    { fr:'Passée le',           en:'Placed on',         de:'Bestellt am',           es:'Realizado el',           it:'Effettuato il',          pt:'Realizado em' },
    cancelled: { fr:'Commande annulée',    en:'Order cancelled',   de:'Storniert',             es:'Pedido cancelado',       it:'Ordine annullato',       pt:'Pedido cancelado' },
    cancelSub: { fr:"Contactez-nous pour plus d'informations.", en:'Contact us for more information.', de:'Kontaktieren Sie uns.', es:'Contáctenos para más información.', it:'Contattateci per ulteriori informazioni.', pt:'Contacte-nos para mais informações.' },
    vehicles:  { fr:'Véhicules commandés', en:'Ordered vehicles',  de:'Bestellte Fahrzeuge',   es:'Vehículos pedidos',      it:'Veicoli ordinati',       pt:'Veículos pedidos' },
    payment:   { fr:'Récapitulatif paiement', en:'Payment summary', de:'Zahlungsübersicht',   es:'Resumen del pago',       it:'Riepilogo pagamento',    pt:'Resumo do pagamento' },
    history:   { fr:'Historique',          en:'History',           de:'Verlauf',               es:'Historial',              it:'Cronologia',             pt:'Histórico' },
    discount:  { fr:'Remise (-5%)',        en:'Discount (-5%)',    de:'Rabatt (-5%)',          es:'Descuento (-5%)',         it:'Sconto (-5%)',           pt:'Desconto (-5%)' },
    deposit2:  { fr:'Acompte (25%)',       en:'Deposit (25%)',     de:'Anzahlung (25%)',       es:'Señal (25%)',             it:'Acconto (25%)',          pt:'Entrada (25%)' },
    monthly:   { fr:'Mensualité ×',        en:'Monthly ×',         de:'Rate ×',                es:'Cuota ×',                it:'Rata ×',                 pt:'Parcela ×' },
    total:     { fr:'Total',               en:'Total',             de:'Gesamt',                es:'Total',                  it:'Totale',                 pt:'Total' },
    progress:  { fr:'Progression',         en:'Progress',          de:'Fortschritt',           es:'Progreso',               it:'Avanzamento',            pt:'Progresso' },
    contact:   { fr:'Nous contacter',      en:'Contact us',        de:'Kontaktieren',          es:'Contáctenos',            it:'Contattateci',           pt:'Contacte-nos' },
    searching: { fr:'Recherche...',        en:'Searching...',      de:'Suche...',              es:'Buscando...',            it:'Ricerca...',             pt:'Pesquisando...' },
    schedule:  { fr:'Échéancier de paiement', en:'Payment schedule', de:'Zahlungsplan',      es:'Calendario de pago',     it:'Piano di pagamento',     pt:'Cronograma de pagamento' },
    due:       { fr:'Échéance',            en:'Due date',          de:'Fällig am',             es:'Vencimiento',            it:'Scadenza',               pt:'Vencimento' },
    amount:    { fr:'Montant',             en:'Amount',            de:'Betrag',                es:'Importe',                it:'Importo',                pt:'Valor' },
    status:    { fr:'Statut',              en:'Status',            de:'Status',                es:'Estado',                 it:'Stato',                  pt:'Estado' },
    onDelivery:{ fr:'À la livraison',      en:'On delivery',       de:'Bei Lieferung',         es:'A la entrega',           it:'Alla consegna',          pt:'Na entrega' },
    remaining: { fr:'Restant à payer',     en:'Remaining balance', de:'Offener Betrag',        es:'Saldo pendiente',        it:'Saldo residuo',          pt:'Saldo restante' },
  };

  const TYPE_LABELS = {
    deposit: { fr:'Acompte', en:'Deposit', de:'Anzahlung', es:'Señal', it:'Acconto', pt:'Entrada' },
    monthly: { fr:'Mensualité', en:'Monthly payment', de:'Rate', es:'Cuota', it:'Rata', pt:'Parcela' },
    balance: { fr:'Solde', en:'Balance', de:'Restbetrag', es:'Saldo', it:'Saldo', pt:'Saldo' },
    full:    { fr:'Total', en:'Full amount', de:'Gesamtbetrag', es:'Total', it:'Totale', pt:'Total' },
  };
  const STATUS_LABELS = {
    pending:   { fr:'À payer', en:'Pending', de:'Ausstehend', es:'Pendiente', it:'In attesa', pt:'Pendente' },
    paid:      { fr:'Payé', en:'Paid', de:'Bezahlt', es:'Pagado', it:'Pagato', pt:'Pago' },
    late:      { fr:'En retard', en:'Late', de:'Überfällig', es:'Atrasado', it:'In ritardo', pt:'Em atraso' },
    cancelled: { fr:'Annulé', en:'Cancelled', de:'Storniert', es:'Cancelado', it:'Annullato', pt:'Cancelado' },
  };

  const payments = (order?.payments || []).sort((a,b) => (a.dueDate||'').localeCompare(b.dueDate||''));
  const remaining = payments.filter(p => p.status !== 'paid' && p.status !== 'cancelled').reduce((s,p) => s + p.amount, 0);

  const statusColor = { pending:'var(--text-3)', paid:'var(--green)', late:'#EF4444', cancelled:'var(--text-3)' };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '48px 4% 36px' : '72px 6% 56px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <div className="section-eyebrow">{L.label[l]}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(36px,6vw,76px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:28 }}>
            {L.title[l]}
          </h1>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:12, maxWidth:520, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
              placeholder={L.sub[l]}
              className="input-luxury"
              style={{ flex:1, fontFamily:'monospace', letterSpacing:'0.08em', fontSize: isMobile ? 14 : 16, minWidth:0 }} />
            <button type="submit" className="btn-primary" style={{ padding:'13px 24px', flexShrink:0, fontSize:14, whiteSpace:'nowrap' }}>
              {L.search[l]}
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding: isMobile ? '28px 4%' : '48px 6%' }}>
        {loading && <Loader text={L.searching[l]} />}

        {error && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ padding:'20px 24px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, textAlign:'center', fontSize:16, color:'#EF4444' }}>
            {error}
          </motion.div>
        )}

        {order && !loading && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
            style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Header card */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 20 : 28, display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:16, boxShadow:'var(--shadow-sm)' }}>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{L.order[l]}</p>
                <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 24 : 36, color:'var(--red)', letterSpacing:'0.05em' }}>{order.orderNumber}</p>
                <p style={{ fontSize:13, color:'var(--text-3)', marginTop:6 }}>{L.placed[l]} {formatDate(order.createdAt)}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <StatusBadge status={order.status} />
                <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 24 : 32, color:'var(--text)', marginTop:10, letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</p>
                <p style={{ fontSize:13, color:'var(--text-3)', marginTop:4 }}>{PL[order.paymentType]}</p>
              </div>
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? '24px 16px' : '28px 32px', boxShadow:'var(--shadow-sm)' }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom: isMobile ? 28 : 40 }}>{L.progress[l]}</p>
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between' }}>
                  <div style={{ position:'absolute', top:22, left:0, right:0, height:2, background:'var(--border)', zIndex:0 }} />
                  <div style={{ position:'absolute', top:22, left:0, height:2, background:'linear-gradient(90deg,#0E1E3D,#132853)', zIndex:0, transition:'width 0.8s var(--ease)', width:currentStep>=0?`${(currentStep/(STATUS_STEPS.length-1))*100}%`:'0%' }} />
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < currentStep, active = i === currentStep;
                    return (
                      <div key={step} style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', zIndex:1 }}>
                        <div style={{ width: isMobile ? 36 : 46, height: isMobile ? 36 : 46, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: isMobile ? 16 : 20, transition:'all 0.4s', background:done?'var(--red)':active?'var(--red-bg)':'var(--bg-card2)', border:`2px solid ${done||active?'var(--red)':'var(--border)'}`, boxShadow:active?'0 0 0 6px var(--red-bg)':'none' }}>
                          {done ? <span style={{ color:'#fff', fontWeight:900, fontSize: isMobile ? 14 : 18 }}>✓</span> : <span style={{ filter:done||active?'none':'grayscale(1) opacity(0.4)' }}>{STEP_ICONS[step]}</span>}
                        </div>
                        <p style={{ fontSize: isMobile ? 9 : 11, marginTop:8, textAlign:'center', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:active?'var(--red)':done?'var(--green)':'var(--text-3)', maxWidth: isMobile ? 48 : 70, lineHeight:1.3 }}>
                          {SL[step]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled */}
            {isCancelled && (
              <div style={{ padding:28, textAlign:'center', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:12 }}>
                <p style={{ fontSize:48, marginBottom:12 }}>❌</p>
                <p style={{ fontWeight:800, fontSize:20, color:'#EF4444', marginBottom:8 }}>{L.cancelled[l]}</p>
                <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:20 }}>{L.cancelSub[l]}</p>
                <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'inline-flex', fontSize:14 }}>
                  💬 {L.contact[l]}
                </a>
              </div>
            )}

            {/* Vehicles */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 28, boxShadow:'var(--shadow-sm)' }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>{L.vehicles[l]}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display:'flex', gap:14, alignItems:'center' }}>
                    <img src={item.car.imageUrl||'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=70'} alt=""
                      style={{ width: isMobile ? 72 : 90, height: isMobile ? 52 : 64, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, color:'var(--text)', fontSize: isMobile ? 14 : 17 }}>{item.car.make} {item.car.model} {item.car.year}</p>
                      <p style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>{item.car.fuelType} · {item.car.transmission}</p>
                    </div>
                    <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 22, color:'var(--red)', flexShrink:0 }}>{formatEuro(item.unitPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment summary */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 28, boxShadow:'var(--shadow-sm)' }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>{L.payment[l]}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15 }}>
                {order.discountAmount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--green)' }}>{L.discount[l]}</span>
                    <span style={{ color:'var(--green)', fontWeight:700 }}>- {formatEuro(order.discountAmount)}</span>
                  </div>
                )}
                {order.depositAmount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{L.deposit2[l]}</span>
                    <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
                  </div>
                )}
                {order.monthlyAmount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{L.monthly[l]} {order.monthlyDuration}</span>
                    <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
                  </div>
                )}
                <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <span style={{ fontWeight:700, color:'var(--text)', fontSize:17 }}>{L.total[l]}</span>
                  <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 26 : 32, color:'var(--text)', letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Bank details for transfer */}
            {bank && (bank.iban || order.paymentReference) && (
              <BankDetails bank={bank} reference={order.paymentReference} />
            )}

            {/* Payment schedule */}
            {payments.length > 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 28, boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:18 }}>
                  <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)' }}>{L.schedule[l]}</p>
                  <p style={{ fontSize:13, fontWeight:800, color:'var(--green)' }}>
                    {L.remaining[l].toLowerCase()} : {formatEuro(remaining)}
                  </p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {payments.map((p, i) => (
                    <div key={p.id} style={{
                      display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8,
                      padding:'10px 12px', borderRadius:8,
                      background:i%2===0?'transparent':'var(--bg-card2)',
                      border:'1px solid var(--border)', opacity:p.status==='cancelled'?0.55:1,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                        <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-3)', flexShrink:0 }}>#{String(i+1).padStart(2,'0')}</span>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>
                            {(TYPE_LABELS[p.type]||{})[l] || p.type}
                            {p.amount === order.depositAmount && p.type==='deposit' && ' (25%)'}
                          </p>
                          <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                            {p.dueDate ? formatDate(p.dueDate) : L.onDelivery[l]}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:'var(--red)', flexShrink:0 }}>{formatEuro(p.amount)}</p>
                        <span style={{
                          fontSize:11, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0,
                          color:statusColor[p.status]||'var(--text-3)',
                          border:`1px solid ${statusColor[p.status]||'var(--border)'}`,
                          borderRadius:999, padding:'3px 10px',
                        }}>
                          {(STATUS_LABELS[p.status]||{})[l] || p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History timeline */}
            {order.tracking?.length > 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 28, boxShadow:'var(--shadow-sm)' }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:24 }}>{L.history[l]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
                  {order.tracking.map(event => (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-dot">
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--red)' }} />
                      </div>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14 }}>
                        <div>
                          <StatusBadge status={event.status} />
                          {event.comment && (
                            <p style={{ fontSize:14, color:'var(--text-3)', marginTop:8, lineHeight:1.6 }}>{event.comment}</p>
                          )}
                        </div>
                        <p style={{ fontSize:12, color:'var(--text-3)', flexShrink:0, marginTop:2 }}>{timeAgo(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}