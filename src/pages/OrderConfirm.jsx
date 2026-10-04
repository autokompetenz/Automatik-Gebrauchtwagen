import { useBreakpoint } from '../hooks/useBreakpoint';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI, bankAPI } from '../services/api';
import { formatEuro, formatDate } from '../utils/helpers';
import { Loader } from '../components/UI';
import BankDetails from '../components/BankDetails';
import { useLangStore } from '../store';

export default function OrderConfirm() {
  const { orderNumber } = useParams();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [order, setOrder] = useState(null);
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const l = lang || 'fr';

  useEffect(() => {
    Promise.all([
      orderAPI.getByNumber(orderNumber),
      bankAPI.get().catch(() => null),
    ])
      .then(([orderRes, bankRes]) => {
        setOrder(orderRes.data.order);
        setBank(bankRes?.data?.bank || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderNumber]);

  const PL = {
    fr: { full:'Paiement intégral (-5%)', deposit:'Acompte 25%',   monthly:'Acompte 25% + 60 mensualités' },
    en: { full:'Full payment (-5%)',       deposit:'25% deposit',   monthly:'25% deposit + 60 monthly payments' },
    de: { full:'Vollzahlung (-5%)',        deposit:'Anzahlung 25%', monthly:'25% Anzahlung + 60 Raten' },
    es: { full:'Pago completo (-5%)',      deposit:'Señal 25%',     monthly:'Señal 25% + 60 cuotas' },
    it: { full:'Pagamento completo (-5%)', deposit:'Acconto 25%',   monthly:'Acconto 25% + 60 rate' },
    pt: { full:'Pagamento integral (-5%)', deposit:'Entrada 25%',   monthly:'Entrada 25% + 60 parcelas' },
  };

  const L = {
    title:    { fr:'Commande confirmée !',    en:'Order confirmed!',         de:'Bestellung bestätigt!',      es:'¡Pedido confirmado!',         it:'Ordine confermato!',          pt:'Pedido confirmado!' },
    email:    { fr:'Un email de confirmation a été envoyé à votre adresse.', en:'A confirmation email has been sent to your address.', de:'Eine Bestätigungs-E-Mail wurde gesendet.', es:'Se ha enviado un email de confirmación.', it:"È stata inviata un'email di conferma.", pt:'Um email de confirmação foi enviado.' },
    bcLabel:  { fr:'Numéro de bon de commande', en:'Order number',           de:'Bestellnummer',              es:'Número de pedido',            it:'Numero ordine',               pt:'Número do pedido' },
    placed:   { fr:'Passée le',               en:'Placed on',                de:'Bestellt am',                es:'Realizado el',                it:'Effettuato il',               pt:'Realizado em' },
    vehicles: { fr:'Véhicules commandés',      en:'Ordered vehicles',        de:'Bestellte Fahrzeuge',        es:'Vehículos pedidos',           it:'Veicoli ordinati',            pt:'Veículos pedidos' },
    services: { fr:'Services supplémentaires', en:'Additional services',      de:'Zusätzliche Dienste',       es:'Servicios adicionales',       it:'Servizi aggiuntivi',          pt:'Serviços adicionais' },
    finance:  { fr:'Récapitulatif financier',  en:'Financial summary',       de:'Finanzübersicht',            es:'Resumen financiero',          it:'Riepilogo finanziario',       pt:'Resumo financeiro' },
    mode:     { fr:'Mode de paiement',         en:'Payment method',          de:'Zahlungsart',                es:'Método de pago',              it:'Metodo di pagamento',         pt:'Método de pagamento' },
    discount: { fr:'Remise appliquée',         en:'Discount applied',        de:'Rabatt',                     es:'Descuento aplicado',          it:'Sconto applicato',            pt:'Desconto aplicado' },
    deposit:  { fr:'Acompte (25%)',            en:'Deposit (25%)',            de:'Anzahlung (25%)',            es:'Señal (25%)',                 it:'Acconto (25%)',               pt:'Entrada (25%)' },
    monthly2: { fr:'Mensualité ×',            en:'Monthly ×',                de:'Rate ×',                     es:'Cuota ×',                     it:'Rata ×',                      pt:'Parcela ×' },
    total:    { fr:'Total',                    en:'Total',                    de:'Gesamt',                     es:'Total',                       it:'Totale',                      pt:'Total' },
    track:    { fr:'Suivre ma commande',       en:'Track my order',           de:'Bestellung verfolgen',       es:'Seguir mi pedido',            it:'Traccia ordine',              pt:'Rastrear pedido' },
    cont:     { fr:'Continuer mes achats',     en:'Continue shopping',        de:'Weiter einkaufen',           es:'Continuar comprando',         it:'Continua gli acquisti',       pt:'Continuar comprando' },
  };

  if (loading) return (
    <div style={{ paddingTop:100, background:'var(--bg)', minHeight:'100vh', display:'flex', justifyContent:'center' }}>
      <Loader />
    </div>
  );

  if (!order) return (
    <div style={{ paddingTop:120, textAlign:'center', background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div>
        <p style={{ fontSize:80, fontWeight:900, color:'var(--red)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>404</p>
        <Link to="/" className="btn-primary" style={{ marginTop:20, display:'inline-flex' }}>Accueil</Link>
      </div>
    </div>
  );

  const PLang = PL[l] || PL.fr;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding: isMobile ? '48px 4%' : '72px 6%' }}>

        {/* Success icon */}
        <motion.div
          initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:'spring', damping:14, stiffness:200 }}
          style={{ width:88, height:88, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 36px', fontSize:40 }}>
          ✓
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6 }}
          style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,56px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:12 }}>
            {L.title[l]}
          </h1>
          <p style={{ fontSize:16, color:'var(--text-3)', lineHeight:1.6 }}>{L.email[l]}</p>
        </motion.div>

        {/* Order number */}
        <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:12, padding:'28px 32px', textAlign:'center', marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.35em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>
            {L.bcLabel[l]}
          </p>
          <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:'var(--red)', letterSpacing:'0.08em' }}>
            {order.orderNumber}
          </p>
          <p style={{ fontSize:13, color:'var(--text-3)', marginTop:8 }}>
            {L.placed[l]} {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Vehicles */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 24, marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>
            {L.vehicles[l]}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display:'flex', gap:14, alignItems:'center' }}>
                <img
                  src={item.car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=70'}
                  alt={`${item.car.make} ${item.car.model}`}
                  style={{ width: isMobile ? 72 : 90, height: isMobile ? 52 : 64, objectFit:'cover', borderRadius:8, flexShrink:0 }}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, color:'var(--text)', fontSize: isMobile ? 14 : 16 }}>
                    {item.car.make} {item.car.model} {item.car.year}
                  </p>
                  <p style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>
                    {item.car.fuelType} · {item.car.transmission}
                  </p>
                </div>
                <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 22, color:'var(--red)', flexShrink:0 }}>
                  {formatEuro(item.unitPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        {(order.warranty || order.registration || order.additionalServices) && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 24, marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>
              {L.services[l]}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {order.warranty && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--bg-card2)', borderRadius:8 }}>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize: isMobile ? 14 : 15 }}>
                      {l==='fr'?'Garantie':l==='en'?'Warranty':l==='de'?'Garantie':'Garantía'} - {order.warranty.months} {l==='fr'?'mois':l==='en'?'months':l==='de'?'Monate':'meses'}
                    </p>
                  </div>
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--red)' }}>
                    {formatEuro(order.warranty.price)}
                  </p>
                </div>
              )}
              {order.registration && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--bg-card2)', borderRadius:8 }}>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize: isMobile ? 14 : 15 }}>
                      {l==='fr'?'Service d\'immatriculation':l==='en'?'Registration service':l==='de'?'Zulassungsservice':'Servicio de matriculación'}
                    </p>
                  </div>
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--red)' }}>
                    {formatEuro(order.registration.price)}
                  </p>
                </div>
              )}
              {order.additionalServices && order.additionalServices.map(service => (
                <div key={service.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--bg-card2)', borderRadius:8 }}>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize: isMobile ? 14 : 15 }}>
                      {service.label || service.id}
                    </p>
                  </div>
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--red)' }}>
                    {formatEuro(service.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial summary */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 24, marginBottom:32, boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>
            {L.finance[l]}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>{L.mode[l]}</span>
              <span style={{ color:'var(--text)', fontWeight:600 }}>{PLang[order.paymentType]}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--green)' }}>
                <span>{L.discount[l]}</span>
                <span>- {formatEuro(order.discountAmount)}</span>
              </div>
            )}
            {order.depositAmount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>{L.deposit[l]}</span>
                <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
              </div>
            )}
            {order.monthlyAmount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>{L.monthly2[l]} {order.monthlyDuration}</span>
                <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
              </div>
            )}
            <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontWeight:700, color:'var(--text)' }}>{L.total[l]}</span>
              <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 26 : 34, color:'var(--text)', letterSpacing:'-0.02em' }}>
                {formatEuro(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Wire transfer details */}
        {bank && (bank.iban || order.paymentReference) && (
          <BankDetails bank={bank} reference={order.paymentReference} />
        )}

        {/* CTAs */}
        <div style={{ display:'flex', gap:12, flexDirection: isMobile ? 'column' : 'row' }}>
          <Link to={`/track/${order.orderNumber}`} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:14 }}>
            📍 {L.track[l]}
          </Link>
          <Link to="/catalog" className="btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:14 }}>
            {L.cont[l]}
          </Link>
        </div>
      </div>
    </div>
  );
}