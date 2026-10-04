import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro, calculateOrderTotals } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

const PAYMENT_OPTIONS = [
  { id:'full',    icon:'💎', labelKey:'payment_full',    subFr:'−5% de remise immédiate', subEn:'5% immediate discount', subDe:'5% Sofortrabatt' },
  { id:'deposit', icon:'🔑', labelKey:'payment_deposit', subFr:'25% maintenant, solde à livraison', subEn:'25% now, balance on delivery', subDe:'25% jetzt, Rest bei Lieferung' },
  { id:'monthly', icon:'📅', labelKey:'payment_monthly', subFr:'Acompte 25% puis 60 mensualités à 6%/an', subEn:'25% deposit then 60 monthly payments at 6%/yr', subDe:'25% Anzahlung, dann 60 Raten à 6%/Jahr' },
];const WARRANTY_OPTIONS = [
  { id: 'none',    months: 0,  price: 0,   labelFr: 'Aucune garantie supplémentaire', labelEn: 'No additional warranty', labelDe: 'Keine zusätzliche Garantie' },
  { id: '24months', months: 24, price: 360, labelFr: 'Garantie 24 mois', labelEn: '24-month warranty', labelDe: '24 Monate Garantie' },
  { id: '36months', months: 36, price: 450, labelFr: 'Garantie 36 mois', labelEn: '36-month warranty', labelDe: '36 Monate Garantie' },
];

const REGISTRATION_SERVICE = {
  id: 'registration',
  price: 460,
  labelFr: 'Service d\'immatriculation',
  labelEn: 'Registration service',
  labelDe: 'Zulassungsservice',
};

const ADDITIONAL_SERVICES = [
  {
    id: 'delivery',
    price: 150,
    labelFr: 'Livraison à domicile',
    labelEn: 'Home delivery',
    labelDe: 'Hauslieferung',
    descriptionFr: 'Livraison du véhicule à votre adresse',
    descriptionEn: 'Vehicle delivery to your address',
    descriptionDe: 'Lieferung des Fahrzeugs an Ihre Adresse',
  },
  {
    id: 'roadside_assistance',
    price: 120,
    labelFr: 'Assistance routière 24/7',
    labelEn: '24/7 roadside assistance',
    labelDe: '24/7 Pannenhilfe',
    descriptionFr: 'Assistance dépannage 24h/24 et 7j/7',
    descriptionEn: '24/7 breakdown assistance',
    descriptionDe: '24/7 Pannenhilfe',
  },
  {
    id: 'replacement_vehicle',
    price: 200,
    labelFr: 'Véhicule de remplacement',
    labelEn: 'Replacement vehicle',
    labelDe: 'Ersatzfahrzeug',
    descriptionFr: 'Véhicule de prêt en cas de panne',
    descriptionEn: 'Loan vehicle in case of breakdown',
    descriptionDe: 'Leihfahrzeug bei Panne',
  },
  {
    id: 'maintenance_pack',
    price: 280,
    labelFr: 'Pack entretien (2 révisions)',
    labelEn: 'Maintenance pack (2 services)',
    labelDe: 'Wartungspaket (2 Inspektionen)',
    descriptionFr: 'Inclus 2 révisions complètes',
    descriptionEn: 'Includes 2 full services',
    descriptionDe: 'Inklusive 2 vollständige Inspektionen',
  },
  {
    id: 'body_protection',
    price: 180,
    labelFr: 'Protection carrosserie',
    labelEn: 'Body protection',
    labelDe: 'Karosserieschutz',
    descriptionFr: 'Traitement anti-rayures et protection',
    descriptionEn: 'Anti-scratch treatment and protection',
    descriptionDe: 'Kratzschutz und Schutzbehandlung',
  },
  {
    id: 'interior_protection',
    price: 120,
    labelFr: 'Protection intérieure',
    labelEn: 'Interior protection',
    labelDe: 'Innenausstattungsschutz',
    descriptionFr: 'Protection sièges et tapis',
    descriptionEn: 'Seat and floor protection',
    descriptionDe: 'Sitz- und Fußmattenschutz',
  },
  {
    id: 'winter_pack',
    price: 350,
    labelFr: 'Pack hiver (pneus neige)',
    labelEn: 'Winter pack (snow tires)',
    labelDe: 'Winterpaket (Winterreifen)',
    descriptionFr: '4 pneus hiver inclus',
    descriptionEn: '4 winter tires included',
    descriptionDe: '4 Winterreifen inklusive',
  },
  {
    id: 'detailing',
    price: 150,
    labelFr: 'Nettoyage professionnel',
    labelEn: 'Professional detailing',
    labelDe: 'Professionelles Detailing',
    descriptionFr: 'Nettoyage complet et polissage',
    descriptionEn: 'Full cleaning and polishing',
    descriptionDe: 'Vollständige Reinigung und Politur',
  },
];

function getPaymentSub(opt, lang) {
  return opt[`sub${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || opt.subFr;
}

/* ── CheckoutPanel OUTSIDE Cart to prevent remount on every keystroke ── */
function CheckoutPanel({
  lang, total, selectedPayment, setSelectedPayment,
  shippingAddress, setShippingAddress,
  notes, setNotes,
  placing, handleOrder,
  selectedWarranty, setSelectedWarranty,
  includeRegistration, setIncludeRegistration,
  selectedAdditionalServices, setSelectedAdditionalServices,
  proofFile, setProofFile,
  customerName, setCustomerName, customerLastName, setCustomerLastName,
  customerEmail, setCustomerEmail, customerPhone, setCustomerPhone,
}) {
  const l = lang || 'fr';
  
  const warrantyPrice = WARRANTY_OPTIONS.find(w => w.id === selectedWarranty)?.price || 0;
  const registrationPrice = includeRegistration ? REGISTRATION_SERVICE.price : 0;
  const additionalServicesPrice = selectedAdditionalServices.reduce((sum, id) => {
    const service = ADDITIONAL_SERVICES.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);
  const servicesTotal = warrantyPrice + registrationPrice + additionalServicesPrice;
  const totalWithServices = total + servicesTotal;
  
  const totals = calculateOrderTotals(totalWithServices, selectedPayment);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Services selector */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>
          {l==='fr'?'Services supplémentaires':l==='en'?'Additional services':l==='de'?'Zusätzliche Dienste':'Servicios adicionales'}
        </p>
        
        {/* Warranty options */}
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:8 }}>
            {l==='fr'?'Garantie et assurance':l==='en'?'Warranty and insurance':l==='de'?'Garantie und Versicherung':'Garantía y seguro'}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {WARRANTY_OPTIONS.map(opt => (
              <label key={opt.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                borderRadius:8, cursor:'pointer', transition:'all 0.2s',
                border:`1.5px solid ${selectedWarranty===opt.id?'var(--red)':'var(--border)'}`,
                background:selectedWarranty===opt.id?'var(--red-bg)':'transparent',
              }}>
                <input type="radio" name="warranty" value={opt.id}
                  checked={selectedWarranty===opt.id}
                  onChange={() => setSelectedWarranty(opt.id)}
                  style={{ accentColor:'var(--red)', width:15, height:15, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                    {opt[`label${l.charAt(0).toUpperCase() + l.slice(1)}`] || opt.labelFr}
                  </p>
                  {opt.price > 0 && (
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>
                      {formatEuro(opt.price)}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Registration service */}
        <div style={{ marginBottom:16 }}>
          <label style={{
            display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
            borderRadius:8, cursor:'pointer', transition:'all 0.2s',
            border:`1.5px solid ${includeRegistration?'var(--red)':'var(--border)'}`,
            background:includeRegistration?'var(--red-bg)':'transparent',
          }}>
            <input type="checkbox"
              checked={includeRegistration}
              onChange={(e) => setIncludeRegistration(e.target.checked)}
              style={{ accentColor:'var(--red)', width:15, height:15, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                {REGISTRATION_SERVICE[`label${l.charAt(0).toUpperCase() + l.slice(1)}`] || REGISTRATION_SERVICE.labelFr}
              </p>
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>
                {formatEuro(REGISTRATION_SERVICE.price)}
              </p>
            </div>
          </label>
        </div>

        {/* Additional services */}
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:8 }}>
            {l==='fr'?'Autres services':l==='en'?'Other services':l==='de'?'Weitere Dienste':'Otros servicios'}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ADDITIONAL_SERVICES.map(service => (
              <label key={service.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                borderRadius:8, cursor:'pointer', transition:'all 0.2s',
                border:`1.5px solid ${selectedAdditionalServices.includes(service.id)?'var(--red)':'var(--border)'}`,
                background:selectedAdditionalServices.includes(service.id)?'var(--red-bg)':'transparent',
              }}>
                <input type="checkbox"
                  checked={selectedAdditionalServices.includes(service.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAdditionalServices([...selectedAdditionalServices, service.id]);
                    } else {
                      setSelectedAdditionalServices(selectedAdditionalServices.filter(id => id !== service.id));
                    }
                  }}
                  style={{ accentColor:'var(--red)', width:15, height:15, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                    {service[`label${l.charAt(0).toUpperCase() + l.slice(1)}`] || service.labelFr}
                  </p>
                  <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>
                    {service[`description${l.charAt(0).toUpperCase() + l.slice(1)}`] || service.descriptionFr}
                  </p>
                </div>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--red)', whiteSpace:'nowrap' }}>
                  {formatEuro(service.price)}
                </p>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Payment selector */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>
          {t('payment_method', l)}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.id} style={{
              display:'flex', alignItems:'center', gap:12, padding:'13px 14px',
              borderRadius:8, cursor:'pointer', transition:'all 0.2s',
              border:`1.5px solid ${selectedPayment===opt.id?'var(--red)':'var(--border)'}`,
              background:selectedPayment===opt.id?'var(--red-bg)':'transparent',
            }}>
              <input type="radio" name="payment" value={opt.id}
                checked={selectedPayment===opt.id}
                onChange={() => setSelectedPayment(opt.id)}
                style={{ accentColor:'var(--red)', width:15, height:15, flexShrink:0 }} />
              <span style={{ fontSize:20 }}>{opt.icon}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t(opt.labelKey, l)}</p>
                <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>{getPaymentSub(opt, l)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>
          {t('summary', l)}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:9, fontSize:15 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'var(--text-3)' }}>{t('subtotal', l)}</span>
            <span style={{ color:'var(--text)', fontWeight:600 }}>{formatEuro(total)}</span>
          </div>
          {warrantyPrice > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>
                {l==='fr'?'Garantie':l==='en'?'Warranty':l==='de'?'Garantie':'Garantía'}
              </span>
              <span style={{ color:'var(--text)', fontWeight:600 }}>{formatEuro(warrantyPrice)}</span>
            </div>
          )}
          {registrationPrice > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>
                {l==='fr'?'Immatriculation':l==='en'?'Registration':l==='de'?'Zulassung':'Matriculación'}
              </span>
              <span style={{ color:'var(--text)', fontWeight:600 }}>{formatEuro(registrationPrice)}</span>
            </div>
          )}
          {additionalServicesPrice > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>
                {l==='fr'?'Autres services':l==='en'?'Other services':l==='de'?'Weitere Dienste':'Otros servicios'}
              </span>
              <span style={{ color:'var(--text)', fontWeight:600 }}>{formatEuro(additionalServicesPrice)}</span>
            </div>
          )}
          {selectedPayment==='full' && totals.discount && (
            <div style={{ display:'flex', justifyContent:'space-between', color:'var(--green)' }}>
              <span>{t('discount', l)}</span><span>− {formatEuro(totals.discount)}</span>
            </div>
          )}
          {(selectedPayment==='monthly' || selectedPayment==='deposit') && totals.deposit && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>
                {selectedPayment==='monthly'
                  ? (l==='fr'?'Acompte (25%) à régler immédiatement':l==='en'?'Deposit (25%) due now':l==='de'?'Anzahlung (25%) sofort fällig':'Depósito (25%) a pagar ahora')
                  : t('deposit_due', l)}
              </span>
              <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(totals.deposit)}</span>
            </div>
          )}
          {selectedPayment==='monthly' && totals.monthly && (
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-3)' }}>{t('monthly_rate', l)} × 60</span>
              <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(totals.monthly)}{t('per_month', l)}</span>
            </div>
          )}
          <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize:14, color:'var(--text-3)' }}>
              {(selectedPayment==='deposit' || selectedPayment==='monthly') ? t('deposit_due', l) : t('total', l)}
            </span>
            <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', letterSpacing:'-0.02em' }}>
              {(selectedPayment==='deposit' || selectedPayment==='monthly') ? formatEuro(totals.deposit) : formatEuro(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery form */}
      <form onSubmit={handleOrder} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:14, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)' }}>
          {l==='fr'?'Vos coordonnées':l==='en'?'Your details':l==='de'?'Ihre Daten':'Tus datos'}
        </p>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{l==='fr'?'Prénom':l==='en'?'First name':l==='de'?'Vorname':'Nombre'} *</label>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} required className="input-luxury" placeholder="Jean" style={{ fontSize:16 }} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{l==='fr'?'Nom':l==='en'?'Last name':l==='de'?'Nachname':'Apellido'}</label>
          <input value={customerLastName} onChange={e => setCustomerLastName(e.target.value)} className="input-luxury" placeholder="Dupont" style={{ fontSize:16 }} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>Email *</label>
          <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required className="input-luxury" placeholder="jean@exemple.fr" style={{ fontSize:16 }} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{l==='fr'?'Téléphone':l==='en'?'Phone':l==='de'?'Telefon':'Teléfono'}</label>
          <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="input-luxury" placeholder="+49 ..." style={{ fontSize:16 }} />
        </div>

        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginTop:6 }}>
          {l==='fr'?'Livraison':l==='en'?'Delivery':l==='de'?'Lieferung':'Entrega'}
        </p>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('delivery_addr', l)}
          </label>
          {/* value + onChange = fully controlled, stable component identity = no remount */}
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={4}
            required
            placeholder={t('delivery_ph', l)}
            className="input-luxury"
            style={{ resize:'vertical', minHeight:100, lineHeight:1.6, fontSize:16 }}
          />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('notes_label', l)}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notes_ph', l)}
            className="input-luxury"
            style={{ fontSize:16 }}
          />
        </div>

        {/* Payment proof upload */}
        <div style={{
          padding:16, borderRadius:10,
          border:`1.5px dashed ${proofFile ? 'var(--green)' : 'var(--border)'}`,
          background: proofFile ? 'rgba(34,197,94,0.05)' : 'var(--bg-card2)',
          transition:'all 0.2s',
        }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            📎 {l==='fr'?'Preuve de virement (obligatoire)':l==='en'?'Bank transfer receipt (required)':l==='de'?'Überweisungsbeleg (erforderlich)':'Comprovante de transferência (obrigatório)'}
          </label>
          <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6, marginBottom:10 }}>
            {l==='fr'
              ? 'Après avoir effectué votre virement aux coordonnées bancaires indiquées, joignez la preuve (capture, PDF ou photo) avant de valider votre commande.'
              : l==='en'
              ? 'After making your transfer to the bank details shown, attach the receipt (screenshot, PDF or photo) before submitting your order.'
              : l==='de'
              ? 'Nach der Überweisung auf die angegebenen Bankdaten fügen Sie den Beleg (Screenshot, PDF oder Foto) bei, bevor Sie Ihre Bestellung absenden.'
              : 'Após efetuar a transferência para os dados bancários indicados, anexe o comprovante (captura, PDF ou foto) antes de enviar seu pedido.'}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <input
              type="file"
              accept="image/*,.pdf"
              id="payment-proof-input"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 10 * 1024 * 1024) {
                  addToast(f.name + ' ' + (l==='fr'?'trop volumineux (max 10MB)':l==='en'?'too large (max 10MB)':l==='de'?'zu groß (max 10MB)':'muito grande (máx 10MB)'), 'error');
                  e.target.value = '';
                  return;
                }
                setProofFile(f);
              }}
              style={{ display:'none' }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('payment-proof-input')?.click()}
              className="btn-ghost"
              style={{
                borderColor: proofFile ? 'var(--green)' : 'var(--border)',
                color: proofFile ? 'var(--green)' : 'var(--text-3)',
                padding:'10px 16px', fontSize:13,
              }}
            >
              {proofFile ? '✓ ' : '+ '}{l==='fr'?'Choisir le fichier':l==='en'?'Choose file':l==='de'?'Datei wählen':'Escolher arquivo'}
            </button>
            {proofFile && (
              <div style={{ minWidth:0, display:'flex', alignItems:'center', gap:10, flex:1 }}>
                <p style={{ fontSize:13, color:'var(--green)', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {proofFile.name}
                </p>
                <button
                  type="button"
                  onClick={() => { setProofFile(null); document.getElementById('payment-proof-input').value = ''; }}
                  style={{ background:'none', border:'none', color:'#DC2626', cursor:'pointer', fontSize:14, flexShrink:0 }}
                  aria-label="Retirer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={placing} className="btn-primary"
          style={{ justifyContent:'center', padding:'15px 20px', fontSize:14, width:'100%' }}>
          {placing ? '⏳ ...' : '✓ ' + t('place_order', l)}
        </button>
        <p style={{ fontSize:12, textAlign:'center', color:'var(--text-3)' }}>
          ✉ {t('order_email_note', l)}
        </p>
      </form>
    </div>
  );
}

/* ── Main Cart component ── */
export default function Cart() {
  const { cartItems, total, loading, fetchCart, removeItem, clear } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState('full');
  const [selectedWarranty, setSelectedWarranty] = useState('none');
  const [includeRegistration, setIncludeRegistration] = useState(false);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(localStorage.getItem('ak_order_email') || '');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (carId, carName) => {
    try {
      await removeItem(carId);
      addToast(`${carName} ${t('remove', lang)}`, 'info');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      addToast(t('delivery_addr', lang).replace(' *', '') + ' ' + (lang === 'fr' ? 'requis' : 'required'), 'warning');
      return;
    }
    if (!customerEmail.trim() || !customerName.trim()) {
      addToast(lang === 'fr' ? 'Nom et email requis' : 'Name and email required', 'warning');
      return;
    }
    if (!proofFile) {
      addToast(lang==='fr'?'Veuillez joindre la preuve de virement avant d\'envoyer la commande':lang==='en'?'Please attach the bank transfer receipt before submitting your order':lang==='de'?'Bitte fügen Sie vor dem Senden der Bestellung den Überweisungsbeleg bei':'Anexe o comprovante de transferência antes de enviar o pedido', 'warning');
      return;
    }
    try {
      setPlacing(true);
      const warrantyOption = WARRANTY_OPTIONS.find(w => w.id === selectedWarranty);
      const additionalServicesData = selectedAdditionalServices.map(id => {
        const service = ADDITIONAL_SERVICES.find(s => s.id === id);
        return {
          id: service.id,
          price: service.price,
          label: service.labelFr
        };
      });
      const formData = new FormData();
      formData.append('paymentType', selectedPayment);
      formData.append('shippingAddress', shippingAddress);
      formData.append('notes', notes || '');
      formData.append('warranty', selectedWarranty !== 'none' ? JSON.stringify({
        id: selectedWarranty,
        months: warrantyOption?.months,
        price: warrantyOption?.price
      }) : '');
      formData.append('registration', includeRegistration ? JSON.stringify({
        id: REGISTRATION_SERVICE.id,
        price: REGISTRATION_SERVICE.price
      }) : '');
      formData.append('additionalServices', additionalServicesData.length > 0 ? JSON.stringify(additionalServicesData) : '');
      formData.append('paymentProof', proofFile);
      formData.append('email', customerEmail.trim());
      formData.append('firstName', customerName.trim());
      formData.append('lastName', customerLastName.trim());
      formData.append('phone', customerPhone.trim());
      formData.append('items', JSON.stringify(items.map(i => ({ carId: i.carId, quantity: i.quantity }))));
      const { data } = await orderAPI.create(formData);
      setProofFile(null);
      localStorage.setItem('ak_order_email', customerEmail.trim());
      clear();
      navigate(`/order-confirm/${data.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPlacing(false); }
  };

  const l = lang || 'fr';
  const items = Array.isArray(cartItems) ? cartItems : [];

  if (loading) return (
    <div style={{ paddingTop:100, background:'var(--bg)', minHeight:'100vh', display:'flex', justifyContent:'center' }}>
      <Loader />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '36px 4% 24px' : '52px 6% 32px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div className="section-eyebrow">{t('nav_cart', l)}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
            {t('cart_title', l)}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding: isMobile ? '24px 4%' : '40px 6%' }}>
        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:72, marginBottom:20 }}>🛒</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', marginBottom:12 }}>
              {t('cart_empty', l)}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginBottom:32 }}>
              {l==='fr'?'Découvrez nos véhicules et ajoutez-les à votre panier.':l==='en'?'Discover our vehicles and add them to your cart.':l==='de'?'Entdecken Sie unsere Fahrzeuge.':'Descubra nossos veículos.'}
            </p>
            <Link to="/catalog" className="btn-primary">{t('discover', l)}</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 20 : 32 }}>

            {/* Items list */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:4 }}>
                {items.length} {t('found', l)}
              </p>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item?.id || item?.carId}
                    layout
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, height:0 }}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 20, display:'flex', gap: isMobile ? 12 : 18, alignItems:'center', boxShadow:'var(--shadow-sm)' }}>
                    <Link to={`/cars/${item?.carId}`} style={{ width: isMobile ? 88 : 130, flexShrink:0, borderRadius:8, overflow:'hidden', display:'block' }}>
                      <img
                        src={item?.car?.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70'}
                        alt={`${item?.car?.make} ${item?.car?.model}`}
                        style={{ width:'100%', height: isMobile ? 64 : 95, objectFit:'cover', display:'block' }}
                      />
                    </Link>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/cars/${item?.carId}`} style={{ textDecoration:'none' }}>
                        <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 20, color:'var(--text)', marginBottom:3, letterSpacing:'-0.01em' }}>
                          {item?.car?.make} {item?.car?.model}
                        </h3>
                      </Link>
                      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:6 }}>
                        {item?.car?.year} · {item?.car?.fuelType} · {item?.car?.transmission}
                      </p>
                      <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 19 : 24, color:'var(--red)' }}>
                        {formatEuro(item?.car?.price || 0)}
                      </p>
                      <button
                        onClick={() => handleRemove(item?.carId, `${item?.car?.make} ${item?.car?.model}`)}
                        style={{ marginTop:8, fontSize:13, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:600, padding:0 }}>
                        ✕ {t('remove', l)}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout panel — stable identity, no remount */}
            <div>
              <CheckoutPanel
                lang={l}
                total={total}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                shippingAddress={shippingAddress}
                setShippingAddress={setShippingAddress}
                notes={notes}
                setNotes={setNotes}
                placing={placing}
                handleOrder={handleOrder}
                selectedWarranty={selectedWarranty}
                setSelectedWarranty={setSelectedWarranty}
                includeRegistration={includeRegistration}
                setIncludeRegistration={setIncludeRegistration}
                selectedAdditionalServices={selectedAdditionalServices}
                setSelectedAdditionalServices={setSelectedAdditionalServices}
                proofFile={proofFile}
                setProofFile={setProofFile}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerLastName={customerLastName}
                setCustomerLastName={setCustomerLastName}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}