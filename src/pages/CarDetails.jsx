import { useState, useEffect } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { carAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore, useThemeStore } from '../store';
import { formatEuro, calculateMonthlyPayment } from '../utils/helpers';
import { Loader } from '../components/UI';
import CarCard from '../components/CarCard';
import Speedometer from '../components/Speedometer';
import { t } from '../utils/i18n';

const INFO_TITLE = {
  fr: 'Informations complémentaires sur le véhicule',
  en: 'Additional vehicle information',
  de: 'Zusätzliche Fahrzeuginformationen',
  ar: 'معلومات إضافية عن المركبة',
};

const SPEC_LABELS = {
  fr: { year:'Année', power:'Puissance', fuel:'Carburant', gear:'Boîte', km:'Kilométrage', color:'Couleur', new:'Neuf' },
  en: { year:'Year', power:'Power', fuel:'Fuel', gear:'Gearbox', km:'Mileage', color:'Colour', new:'New' },
  de: { year:'Baujahr', power:'Leistung', fuel:'Kraftstoff', gear:'Getriebe', km:'Kilometerstand', color:'Farbe', new:'Neu' },
  ar: { year:'السنة', power:'القوة', fuel:'الوقود', gear:'ناقل الحركة', km:'عداد المسافة', color:'اللون', new:'جديد' },
};

const IMAGE_FIELDS = [
  'imageUrl','imageUrl2','imageUrl3','imageUrl4','imageUrl5',
  'imageUrl6','imageUrl7','imageUrl8','imageUrl9','imageUrl10',
  'imageUrl11','imageUrl12','imageUrl13','imageUrl14','imageUrl15',
  'imageUrl16','imageUrl17','imageUrl18','imageUrl19','imageUrl20'
];

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const [depositPct, setDepositPct] = useState(25);
  const [financeMonths, setFinanceMonths] = useState(60);
  const isDark = theme === 'dark';

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarCars, setSimilarCars] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  const SL = SPEC_LABELS[lang] || SPEC_LABELS.fr;
  const l = lang || 'fr';
  const { isMobile } = useBreakpoint();

  // Theme-aware color tokens — computed from isDark
  const C = {
    bg:      isDark ? '#0a0a0a'                  : '#f5f5f5',
    card:    isDark ? '#141414'                  : '#ffffff',
    card2:   isDark ? '#1a1a1a'                  : '#ececec',
    border:  isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.1)',
    text:    isDark ? '#ffffff'                  : '#111111',
    text2:   isDark ? 'rgba(255,255,255,0.65)'   : '#444444',
    text3:   isDark ? 'rgba(255,255,255,0.35)'   : '#888888',
    red:     '#132853',
    shadow:  isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
    disabledBg:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    disabledText: isDark ? '#444' : '#aaa',
  };

  useEffect(() => {
    setLoading(true);
    carAPI.getById(id)
      .then(r => { setCar(r.data.car); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/catalog'); });
  }, [id]);

  useEffect(() => {
    if (!car?.id) return;
    const carId = Number(car.id);
    setSimilarLoading(true);
    setSimilarCars([]);

    const pickOthers = (list) => list.filter(c => Number(c.id) !== carId);

    carAPI.getAll({ category: car.category, limit: 12 })
      .then(async (r) => {
        let others = pickOthers(r.data.cars || []);
        if (others.length < 3) {
          const fallback = await carAPI.getAll({ limit: 12 });
          const extra = pickOthers(fallback.data.cars || [])
            .filter(c => !others.some(o => o.id === c.id));
          others = [...others, ...extra];
        }
        setSimilarCars(others.slice(0, 3));
      })
      .catch(() => setSimilarCars([]))
      .finally(() => setSimilarLoading(false));
  }, [car?.id, car?.category]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      navigate(`/commander/${car.id}`);
    } finally { setAdding(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 100, background: isDark ? '#0a0a0a' : '#f5f5f5', minHeight: '100vh' }}>
      <Loader text="Chargement..." />
    </div>
  );
  if (!car) return null;

  const images = IMAGE_FIELDS.map(f => car?.[f]).filter(Boolean);

  const powerHp = Number(car?.power) || 0;
  const topSpeed = powerHp ? Math.min(250, Math.round(155 + powerHp * 0.34)) : 0;
  const accel = powerHp ? Math.max(3, Math.min(14, 13.5 - powerHp * 0.029)).toFixed(1) : '0.0';

  const breadcrumbs   = { fr:'Accueil', en:'Home', de:'Startseite', ar:'الرئيسية' };
  const catalogBc     = { fr:'Catalogue', en:'Catalogue', de:'Katalog', ar:'الكتالوج' };
  const addBtn        = { fr:'Commander', en:'Order Now', de:'Jetzt Bestellen', ar:'اطلب الآن' };
  const recSalary     = { fr:'Salaire minimum recommandé', en:'Minimum recommended salary', de:'Empfohlenes Mindestgehalt', ar:'الحد الأدنى الموصى به للراتب' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: 76 }}>

      {/* Breadcrumb */}
      <div style={{ padding: '16px 6%', borderBottom: `1px solid ${C.border}`, background: C.card2 }}>
        <p style={{ fontSize: 13, color: C.text3 }}>
          <Link to="/" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {breadcrumbs[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <Link to="/catalog" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {catalogBc[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <span style={{ color: C.text2 }}>{car.make} {car.model}</span>
        </p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 72 }}>

          {/* ── Gallery ── */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'relative', borderRadius: 12, overflow: 'hidden',
                aspectRatio: '4/3', background: C.card, boxShadow: C.shadow,
              }}
            >
              <img
                src={images[activeImg] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                alt={`${car.make} ${car.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {car.featured && (
                <div style={{
                  position: 'absolute', top: 18, left: 18,
                  background: '#132853', color: '#fff',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
                  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 4,
                }}>
                  ★ {lang === 'fr' ? 'Recommandé' : lang === 'en' ? 'Featured' : lang === 'de' ? 'Empfohlen' : 'مميز'}
                </div>
              )}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 14, right: 14,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 12, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 20, backdropFilter: 'blur(4px)',
                }}>
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
                gap: 10, marginTop: 16,
              }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{
                      aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden',
                      border: `2px solid ${activeImg === i ? '#132853' : C.border}`,
                      opacity: activeImg === i ? 1 : 0.55,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      padding: 0, background: C.card,
                    }}
                    onMouseOver={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.borderColor='rgba(19,40,83,0.35)'; }}}
                    onMouseOut={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.55'; e.currentTarget.style.borderColor=C.border; }}}
                  >
                    <img src={img} alt={`Vue ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.red }}>
                {car.category}
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800,
              fontSize: isMobile ? 36 : 52, color: C.text,
              letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 24,
            }}>
              {car.make} {car.model}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: 40, color: C.text, letterSpacing: '-0.025em' }}>
                {formatEuro(car.price)}
              </span>
              {car.monthlyPayment && (
                <span style={{ fontSize: 15, color: C.text3, fontWeight: 500 }}>
                  {t('or', lang)} {formatEuro(car.monthlyPayment)}{t('per_month', lang)} ({lang==='fr'?'après acompte 25%':lang==='en'?'after 25% deposit':lang==='de'?'nach 25% Anzahlung':'tras señal 25%'})
                </span>
              )}
            </div>

            {/* Calculateur de financement */}
            {(() => {
              const financed = Math.max(0, car.price * (1 - depositPct / 100));
              const monthly = calculateMonthlyPayment(financed, financeMonths, 0.06);
              return (
                <div style={{ background: C.card2, border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? '14px' : '16px 20px', marginBottom: 32 }}>
                  <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>
                    {l==='fr'?'Simulateur de crédit':l==='en'?'Financing calculator':l==='de'?'Finanzierungsrechner':'Calculadora de financiación'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:10 }}>
                    <div>
                      <label style={{ fontSize:11, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'Acompte':l==='en'?'Deposit':l==='de'?'Anzahlung':'Entrada'} ({depositPct}%)</label>
                      <input type="range" min="0" max="50" value={depositPct} onChange={e => setDepositPct(Number(e.target.value))} style={{ width:'100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'Durée':l==='en'?'Term':l==='de'?'Laufzeit':'Plazo'} ({financeMonths} mois)</label>
                      <input type="range" min="12" max="84" step="12" value={financeMonths} onChange={e => setFinanceMonths(Number(e.target.value))} style={{ width:'100%' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: isMobile ? 20 : 24, fontWeight:800, color:C.text, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
                    ≈ {formatEuro(monthly)}{l==='fr'?'/mois':l==='en'?'/month':l==='de'?'/Monat':'/mes'}
                    <span style={{ fontSize:12, fontWeight:500, color:C.text3, marginLeft:8 }}>(financement 6%/an, acompte {formatEuro(car.price * depositPct / 100)})</span>
                  </p>
                </div>
              );
            })()}

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {[
                { label: SL.year,  value: String(car.year) },
                { label: SL.power, value: car.power ? `${car.power} hp` : 'N/A' },
                { label: SL.fuel,  value: car.fuelType },
                { label: SL.gear,  value: car.transmission },
                { label: SL.km,    value: car.mileage === 0 ? SL.new : `${car.mileage.toLocaleString('fr-FR')} km` },
              ].map(({ label, value, highlight }) => (
                <div key={label}
                  style={{ background: C.card2, borderRadius: 8, padding: isMobile ? '12px 14px' : '14px 16px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s', border: '1px solid transparent' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='transparent'; }}
                >
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.text3, marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: highlight || C.text }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Historique du véhicule */}
            {(car.previousOwners != null || car.accidentFree !== undefined || car.serviceHistory !== undefined || car.historyNotes) && (
              <div style={{ background: C.card2, border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? '16px 14px' : '18px 20px', marginBottom:28 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>
                  {l==='fr'?'Historique du véhicule':l==='en'?'Vehicle history':l==='de'?'Fahrzeughistorie':'Historial del vehículo'}
                </p>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
                  {car.previousOwners != null && (
                    <div>
                      <p style={{ fontSize:10, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'Propriétaires':l==='en'?'Previous owners':l==='de'?'Vorbesitzer':'Propietarios'}</p>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{car.previousOwners}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize:10, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'Sans accident':l==='en'?'Accident-free':l==='de'?'Unfallfrei':'Sin accidentes'}</p>
                    <p style={{ fontSize:15, fontWeight:700, color: car.accidentFree ? '#16A34A' : C.text }}>{car.accidentFree ? '✓' : (l==='fr'?'Inconnu':l==='en'?'Unknown':l==='de'?'Unbekannt':'Desconocido')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:10, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'Entretien suivi':l==='en'?'Service history':l==='de'?'Wartungshistorie':'Historial manten.'}</p>
                    <p style={{ fontSize:15, fontWeight:700, color: car.serviceHistory ? '#16A34A' : C.text }}>{car.serviceHistory ? '✓' : '—'}</p>
                  </div>
                  {car.firstRegistration && (
                    <div>
                      <p style={{ fontSize:10, color:C.text3, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l==='fr'?'1ère immatriculation':l==='en'?'First registration':l==='de'?'Erstzulassung':'1ª matricul.'}</p>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{new Date(car.firstRegistration).getFullYear()}</p>
                    </div>
                  )}
                </div>
                {car.historyNotes && (
                  <p style={{ fontSize:13, color:C.text2, marginTop:12, lineHeight:1.6 }}>{car.historyNotes}</p>
                )}
              </div>
            )}

            {/* Informations complémentaires */}
            {car.description && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700,
                  fontSize: isMobile ? 18 : 20, color: C.text,
                  letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.2,
                }}>
                  {INFO_TITLE[lang] || INFO_TITLE.fr}
                </h3>
                <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.75, borderLeft: '2px solid rgba(19,40,83,0.25)', paddingLeft: 18 }}>
                  {car.description}
                </p>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                width: '100%', padding: isMobile ? '18px' : '20px', borderRadius: 12,
                fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: isMobile?14:15, fontWeight:800,
                letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: adding ? 'rgba(19,40,83,0.7)' : 'linear-gradient(135deg,#132853,#0E1E3D)',
                color: '#fff',
                boxShadow: !adding ? '0 4px 16px rgba(19,40,83,0.3)' : 'none',
              }}
              onMouseOver={e => { if (!adding) { e.currentTarget.style.background='linear-gradient(135deg,#0E1E3D,#7A0818)'; e.currentTarget.style.transform='scale(1.02)'; }}}
              onMouseOut={e => { if (!adding) { e.currentTarget.style.background='linear-gradient(135deg,#132853,#0E1E3D)'; e.currentTarget.style.transform='scale(1)'; }}}
            >
              {adding ? '...' : addBtn[lang]||addBtn.fr}
            </button>

            {car.minSalary && (
              <p style={{ textAlign:'center', fontSize:12, color:C.text3, marginTop:12 }}>
                {recSalary[lang]||recSalary.fr} : {formatEuro(car.minSalary)}/{lang==='fr'?'mois':lang==='en'?'month':lang==='de'?'Monat':'شهر'}
              </p>
            )}
          </div>
        </div>

        {/* ==================== PREMIUM SECTIONS ==================== */}

        {/* PERFORMANCE — compteurs animés */}
        {powerHp > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: isMobile ? 64 : 96 }}
          >
            <div style={{ marginBottom: isMobile ? 28 : 36, textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
                {lang === 'fr' ? 'Performance' : lang === 'en' ? 'Performance' : lang === 'de' ? 'Leistung' : 'الأداء'}
              </span>
              <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
                {lang === 'fr' ? 'Au cœur de la puissance' : lang === 'en' ? 'The heart of the power' : lang === 'de' ? 'Im Herzen der Kraft' : 'قلب القوة'}
              </h2>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: isMobile ? '28px 10px' : '48px 32px', boxShadow: C.shadow }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 4 : 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Speedometer value={powerHp} max={Math.max(700, Math.ceil(powerHp / 50) * 50)} unit={lang === 'de' ? 'PS' : 'hp'} label={lang === 'fr' ? 'Puissance' : lang === 'en' ? 'Power' : lang === 'de' ? 'Leistung' : 'القوة'} size={isMobile ? 104 : 210} dark={isDark} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Speedometer value={topSpeed} max={Math.max(250, Math.ceil((topSpeed + 30) / 50) * 50)} unit="km/h" label={lang === 'fr' ? 'Vitesse max' : lang === 'en' ? 'Top speed' : lang === 'de' ? 'Höchstgeschwindigkeit' : 'السرعة القصوى'} size={isMobile ? 104 : 210} dark={isDark} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Speedometer value={14 - Number(accel)} displayValue={Number(accel)} max={14} unit="s" label="0–100 km/h" size={isMobile ? 104 : 210} dark={isDark} />
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 12, color: C.text3, marginTop: isMobile ? 12 : 20 }}>
                {lang === 'fr'
                  ? '* Vitesse max et 0–100 km/h : estimations indicatives basées sur la puissance.'
                  : lang === 'en'
                  ? '* Top speed and 0–100 km/h: indicative estimates based on power output.'
                  : lang === 'de'
                  ? '* Höchstgeschwindigkeit und 0–100 km/h: Richtwerte auf Basis der Motorleistung.'
                  : '* السرعة القصوى والتسارع: تقديرات تقريبية بناءً على قوة المحرك.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* 1. SECTION GARANTIE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 64 : 96 }}
        >
          <div style={{ marginBottom: isMobile ? 28 : 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Protection' : lang === 'en' ? 'Protection' : lang === 'de' ? 'Schutz' : 'حماية'}
            </span>
            <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
              {lang === 'fr' ? 'Protection adaptée à vos besoins' : lang === 'en' ? 'Protection tailored to your needs' : lang === 'de' ? 'Schutz maßgeschneidert für Ihre Bedürfnisse' : 'حماية مخصصة لاحتياجاتك'}
            </h2>
          </div>

          {/* Main warranty card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                🛡️
              </div>
              <div>
                <h3 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: isMobile ? 18 : 22, color: C.text, marginBottom: 4 }}>
                  {lang === 'fr' ? 'Garantie basique Automatik Gebrauchtwagen' : lang === 'en' ? 'Automatik Gebrauchtwagen Basic Warranty' : lang === 'de' ? 'Automatik Gebrauchtwagen Basisgarantie' : 'ضمان Automatik Gebrauchtwagen الأساسي'}
                </h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(19,40,83,0.1)', border: '1px solid rgba(19,40,83,0.25)', padding: '4px 12px', borderRadius: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#132853' }}>
                    {lang === 'fr' ? '✓ Incluse dans toutes les commandes' : lang === 'en' ? '✓ Included in all orders' : lang === 'de' ? '✓ In allen Bestellungen enthalten' : '✓ مشمول في جميع الطلبات'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { text: lang === 'fr' ? 'Valable 12 mois ou 10 000 km' : lang === 'en' ? 'Valid 12 months or 10,000 km' : lang === 'de' ? 'Gültig 12 Monate oder 10.000 km' : 'صالح لمدة 12 شهرًا أو 10000 كم', icon: '📅' },
                { text: lang === 'fr' ? 'Protection moteur' : lang === 'en' ? 'Engine protection' : lang === 'de' ? 'Motorschutz' : 'حماية المحرك', icon: '⚙️' },
                { text: lang === 'fr' ? 'Protection boîte de vitesse' : lang === 'en' ? 'Transmission protection' : lang === 'de' ? 'Getriebeschutz' : 'حماية ناقل الحركة', icon: '🔧' },
                { text: lang === 'fr' ? 'Hors pièces d’usure' : lang === 'en' ? 'Excluding wear parts' : lang === 'de' ? 'Verschleißteile ausgeschlossen' : 'باستثناء قطع التآكل', icon: '📋' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.card2, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text2 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Warranty badge */}
            <div style={{ background: isDark ? 'rgba(19,40,83,0.1)' : 'rgba(19,40,83,0.08)', border: '1px solid rgba(19,40,83,0.25)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#132853' }}>
                  {lang === 'fr' ? 'Garantie incluse – 12 mois' : lang === 'en' ? 'Warranty included – 12 months' : lang === 'de' ? 'Garantie enthalten – 12 Monate' : 'الضمان مشمول – 12 شهرًا'}
                </span>
              </div>
              <p style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: C.text }}>
                {lang === 'fr' ? `Votre ${car.make} ${car.model} couvert jusqu'à 36 mois` : lang === 'en' ? `Your ${car.make} ${car.model} covered up to 36 months` : lang === 'de' ? `Ihr ${car.make} ${car.model} bis zu 36 Monate abgedeckt` : `${car.make} ${car.model} الخاص بك مغطى لمدة تصل إلى 36 شهرًا`}
              </p>
            </div>
          </div>

          {/* Coverage grid */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Ce qui est couvert' : lang === 'en' ? 'What is covered' : lang === 'de' ? 'Was ist abgedeckt' : 'ما هو المشمول'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { text: lang === 'fr' ? 'Moteur & boîte de vitesses' : lang === 'en' ? 'Engine & transmission' : lang === 'de' ? 'Motor & Getriebe' : 'المحرك وناقل الحركة', icon: '⚙️' },
                { text: lang === 'fr' ? 'Système de refroidissement' : lang === 'en' ? 'Cooling system' : lang === 'de' ? 'Kühlsystem' : 'نظام التبريد', icon: '❄️' },
                { text: lang === 'fr' ? 'Direction & freinage' : lang === 'en' ? 'Steering & braking' : lang === 'de' ? 'Lenkung & Bremsen' : 'التوجيه والفرامل', icon: '🛞' },
                { text: lang === 'fr' ? 'Électronique embarquée' : lang === 'en' ? 'On-board electronics' : lang === 'de' ? 'Bordelektronik' : 'الإلكترونيات المدمجة', icon: '📟' },
                { text: lang === 'fr' ? 'Climatisation' : lang === 'en' ? 'Air conditioning' : lang === 'de' ? 'Klimaanlage' : 'مكيف الهواء', icon: '❄️' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.card2, borderRadius: 10, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extension options */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Options d\u2019extension' : lang === 'en' ? 'Extension options' : lang === 'de' ? 'Erweiterungsoptionen' : 'خيارات التمديد'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { text: lang === 'fr' ? 'Extension 24 mois' : lang === 'en' ? '24-month extension' : lang === 'de' ? '24 Monate Erweiterung' : 'تمديد 24 شهرًا', icon: '📅' },
                { text: lang === 'fr' ? 'Extension 36 mois' : lang === 'en' ? '36-month extension' : lang === 'de' ? '36 Monate Erweiterung' : 'تمديد 36 شهرًا', icon: '📅' },
                { text: lang === 'fr' ? 'Assistance 24h/24 – 7j/7' : lang === 'en' ? '24/7 assistance' : lang === 'de' ? '24/7 Assistance' : 'مساعدة على مدار الساعة', icon: '🆘' },
                { text: lang === 'fr' ? 'Véhicule de remplacement' : lang === 'en' ? 'Replacement vehicle' : lang === 'de' ? 'Ersatzfahrzeug' : 'مركبة بديلة', icon: '🚗' },
                { text: lang === 'fr' ? 'Garantie carrosserie' : lang === 'en' ? 'Body warranty' : lang === 'de' ? 'Karossergarantie' : 'ضمان الهيكل', icon: '🛡️' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.card2, borderRadius: 10, border: '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.transform='translateY(0)'; }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 2. SECTION LIVRAISON */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 64 : 96 }}
        >
          <div style={{ marginBottom: isMobile ? 28 : 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Livraison' : lang === 'en' ? 'Delivery' : lang === 'de' ? 'Lieferung' : 'توصيل'}
            </span>
            <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
              {lang === 'fr' ? 'Livraison véhicule' : lang === 'en' ? 'Vehicle delivery' : lang === 'de' ? 'Fahrzeuglieferung' : 'توصيل المركبة'}
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginTop: 12, maxWidth: 700, lineHeight: 1.6 }}>
              {lang === 'fr' ? `Votre ${car.make} ${car.model} livré partout en Europe. Véhicule remis propre, plein de carburant et documents conformes.` : lang === 'en' ? `Your ${car.make} ${car.model} delivered anywhere in Europe. Vehicle delivered clean, with full tank and compliant documents.` : lang === 'de' ? `Ihr ${car.make} ${car.model} überall in Europa geliefert. Fahrzeug sauber übergeben, vollgetankt und mit ordnungsgemäßen Dokumenten.` : `${car.make} ${car.model} الخاص بك يتم توصيله في أي مكان في أوروبا. يتم تسليم المركبة نظيفة مع خزان كامل ووثائق متوافقة.`}
            </p>
          </div>

          {/* Delivery info card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>
                  {lang === 'fr' ? 'Livraison à domicile' : lang === 'en' ? 'Home delivery' : lang === 'de' ? 'Hauslieferung' : 'توصيل للمنزل'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { text: lang === 'fr' ? 'Partout en Europe' : lang === 'en' ? 'Anywhere in Europe' : lang === 'de' ? 'Überall in Europa' : 'في أي مكان في أوروبا', icon: '🌍' },
                    { text: lang === 'fr' ? 'Délai : 3 à 7 jours ouvrés' : lang === 'en' ? 'Timeframe: 3-7 business days' : lang === 'de' ? 'Zeitraum: 3-7 Werktage' : 'الإطار الزمني: 3-7 أيام عمل', icon: '📅' },
                    { text: lang === 'fr' ? 'Livraison assurée' : lang === 'en' ? 'Insured delivery' : lang === 'de' ? 'Versicherte Lieferung' : 'توصيل مؤمن', icon: '🛡️' },
                    { text: lang === 'fr' ? 'Signature à la remise' : lang === 'en' ? 'Signature on delivery' : lang === 'de' ? 'Unterschrift bei Übergabe' : 'توقيع عند الاستلام', icon: '✍️' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>
                  {lang === 'fr' ? 'Avantages' : lang === 'en' ? 'Advantages' : lang === 'de' ? 'Vorteile' : 'المزايا'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    lang === 'fr' ? '✓ Livraison partout en Europe' : lang === 'en' ? '✓ Delivery anywhere in Europe' : lang === 'de' ? '✓ Lieferung überall in Europa' : '✓ توصيل في أي مكان في أوروبا',
                    lang === 'fr' ? '✓ Créneau confirmé avec le client' : lang === 'en' ? '✓ Time slot confirmed with client' : lang === 'de' ? '✓ Zeitfenster mit Kunde bestätigt' : '✓ فترة زمنية مؤكدة مع العميل',
                    lang === 'fr' ? '✓ Suivi avant remise' : lang === 'en' ? '✓ Tracking before handover' : lang === 'de' ? '✓ Verfolgung vor Übergabe' : '✓ تتبع قبل التسليم',
                    lang === 'fr' ? '✓ Documents préparés' : lang === 'en' ? '✓ Documents prepared' : lang === 'de' ? '✓ Dokumente vorbereitet' : '✓ الوثائق محضرة',
                    lang === 'fr' ? '✓ Accompagnement à la réception' : lang === 'en' ? '✓ Assistance on receipt' : lang === 'de' ? '✓ Begleitung bei Empfang' : '✓ مرافقة عند الاستلام',
                  ].map((item, i) => (
                    <div key={i} style={{ fontSize: 14, fontWeight: 600, color: C.text2, lineHeight: 1.6 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info box */}
            <div style={{ marginTop: 24, padding: 16, background: isDark ? 'rgba(19,40,83,0.08)' : 'rgba(19,40,83,0.05)', border: '1px solid rgba(19,40,83,0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, textAlign: 'center' }}>
                {lang === 'fr' ? 'Le véhicule est livré propre, avec le plein de carburant et tous les documents en règle. Un essai routier peut être effectué avant validation finale.' : lang === 'en' ? 'The vehicle is delivered clean, with a full tank of fuel and all documents in order. A road test can be performed before final validation.' : lang === 'de' ? 'Das Fahrzeug wird sauber übergeben, mit vollem Tank und allen ordnungsgemäßen Dokumenten. Vor der endgültigen Validierung kann eine Probefahrt durchgeführt werden.' : 'يتم تسليم المركبة نظيفة مع خزان وقود ممتلئ وجميع الوثائق مرتبة. يمكن إجراء اختبار طريق قبل التحقق النهائي.'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Du clic à la remise des clés – sans souci' : lang === 'en' ? 'From click to key handover – hassle-free' : lang === 'de' ? 'Vom Klick zur Schlüsselübergabe – sorgenfrei' : 'من النقرة إلى تسليم المفاتيح - بلا متاعب'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {[
                { step: '1', text: lang === 'fr' ? 'Validation commande' : lang === 'en' ? 'Order validation' : lang === 'de' ? 'Bestellvalidierung' : 'التحقق من الطلب', icon: '📋' },
                { step: '2', text: lang === 'fr' ? 'Préparation véhicule' : lang === 'en' ? 'Vehicle preparation' : lang === 'de' ? 'Fahrzeugvorbereitung' : 'تحضير المركبة', icon: '🔧' },
                { step: '3', text: lang === 'fr' ? 'Transport sécurisé' : lang === 'en' ? 'Secure transport' : lang === 'de' ? 'Sicherer Transport' : 'نقل آمن', icon: '🚚' },
                { step: '4', text: lang === 'fr' ? 'Livraison domicile' : lang === 'en' ? 'Home delivery' : lang === 'de' ? 'Hauslieferung' : 'توصيل للمنزل', icon: '🏠' },
                { step: '5', text: lang === 'fr' ? 'Remise des clés' : lang === 'en' ? 'Key handover' : lang === 'de' ? 'Schlüsselübergabe' : 'تسليم المفاتيح', icon: '🔑' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#132853,#0E1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff' }}>
                    {item.step}
                  </div>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { text: lang === 'fr' ? '✓ Livraison Europe' : lang === 'en' ? '✓ Europe Delivery' : lang === 'de' ? '✓ Europa-Lieferung' : '✓ توصيل أوروبا', color: '#132853' },
              { text: lang === 'fr' ? '✓ Remise à domicile' : lang === 'en' ? '✓ Home delivery' : lang === 'de' ? '✓ Hauslieferung' : '✓ توصيل للمنزل', color: '#132853' },
              { text: lang === 'fr' ? '✓ Date au choix' : lang === 'en' ? '✓ Date of your choice' : lang === 'de' ? '✓ Datum nach Wahl' : '✓ تاريخ حسب اختيارك', color: '#132853' },
              { text: lang === 'fr' ? '✓ Transaction sécurisée' : lang === 'en' ? '✓ Secure transaction' : lang === 'de' ? '✓ Sichere Transaktion' : '✓ معاملة آمنة', color: '#132853' },
            ].map((badge, i) => (
              <div key={i} style={{ padding: '10px 20px', background: isDark ? 'rgba(19,40,83,0.1)' : 'rgba(19,40,83,0.08)', border: '1px solid rgba(19,40,83,0.25)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: badge.color }}>
                {badge.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. SECTION INSPECTION PREMIUM */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 64 : 96 }}
        >
          <div style={{ marginBottom: isMobile ? 28 : 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Qualité' : lang === 'en' ? 'Quality' : lang === 'de' ? 'Qualität' : 'جودة'}
            </span>
            <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
              {lang === 'fr' ? 'Inspection technique certifiée' : lang === 'en' ? 'Certified technical inspection' : lang === 'de' ? 'Zertifizierte technische Inspektion' : 'فحص فني معتمد'}
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginTop: 12, maxWidth: 700, lineHeight: 1.6 }}>
              {lang === 'fr' ? 'Ce véhicule a été soumis à une inspection rigoureuse de plus de 150 points techniques réalisée par nos mécaniciens certifiés.' : lang === 'en' ? 'This vehicle has undergone a rigorous inspection of over 150 technical points performed by our certified mechanics.' : lang === 'de' ? 'Dieses Fahrzeug wurde einer strengen Inspektion von über 150 technischen Punkten unterzogen, die von unseren zertifizierten Mechanikern durchgeführt wurde.' : 'خضعت هذه المركبة لفحص دقيق لأكثر من 150 نقطة فنية تم إجراؤها بواسطة ميكانيكيينا المعتمدين.'}
            </p>
          </div>

          {/* Inspection grid */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { title: lang === 'fr' ? 'Moteur & transmission' : lang === 'en' ? 'Engine & transmission' : lang === 'de' ? 'Motor & Getriebe' : 'المحرك وناقل الحركة', desc: lang === 'fr' ? 'Contrôle complet du groupe motopropulseur' : lang === 'en' ? 'Complete powertrain check' : lang === 'de' ? 'Vollständige Antriebsstrangprüfung' : 'فحص كامل لمجموعة القيادة', icon: '⚙️' },
                { title: lang === 'fr' ? 'Carrosserie & peinture' : lang === 'en' ? 'Body & paint' : lang === 'de' ? 'Karosserie & Lack' : 'الهيكل والطلاء', desc: lang === 'fr' ? 'Inspection dommages et retouches' : lang === 'en' ? 'Damage and touch-up inspection' : lang === 'de' ? 'Schaden- und Retuscheninspektion' : 'فحص الأضرار واللمسات', icon: '🎨' },
                { title: lang === 'fr' ? 'Freins & suspensions' : lang === 'en' ? 'Brakes & suspension' : lang === 'de' ? 'Bremsen & Fahrwerk' : 'الفرامل والمعلقات', desc: lang === 'fr' ? 'Vérification systèmes sécurité' : lang === 'en' ? 'Safety systems verification' : lang === 'de' ? 'Überprüfung der Sicherheitssysteme' : 'التحقق من أنظمة الأمان', icon: '🛞' },
                { title: lang === 'fr' ? 'Électronique & diagnostic' : lang === 'en' ? 'Electronics & diagnostics' : lang === 'de' ? 'Elektronik & Diagnose' : 'الإلكترونيات والتشخيص', desc: lang === 'fr' ? 'Scan OBD-II complet – zéro défaut toléré' : lang === 'en' ? 'Full OBD-II scan – zero defects tolerated' : lang === 'de' ? 'Vollständiger OBD-II-Scan – null Fehler toleriert' : 'فحص OBD-II كامل - لا توجد عيوب مسموحة', icon: '📟' },
                { title: lang === 'fr' ? 'Fluides & filtres' : lang === 'en' ? 'Fluids & filters' : lang === 'de' ? 'Flüssigkeiten & Filter' : 'السوائل والمرشحات', desc: lang === 'fr' ? 'Remplacement si nécessaire' : lang === 'en' ? 'Replacement if necessary' : lang === 'de' ? 'Ersetzung bei Bedarf' : 'الاستبدال عند الضرورة', icon: '💧' },
                { title: lang === 'fr' ? 'Pneus & jantes' : lang === 'en' ? 'Tires & wheels' : lang === 'de' ? 'Reifen & Felgen' : 'الإطارات والعجلات', desc: lang === 'fr' ? 'Contrôle usure et profondeur' : lang === 'en' ? 'Wear and depth check' : lang === 'de' ? 'Verschleiß- und Tiefenprüfung' : 'فحص التآكل والعمق', icon: '🛞' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '20px', background: C.card2, borderRadius: 12, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</h5>
                    <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification badge */}
          <div style={{ background: 'linear-gradient(135deg,rgba(19,40,83,0.1),rgba(19,40,83,0.05))', border: '2px solid rgba(19,40,83,0.3)', borderRadius: 16, padding: isMobile ? 28 : 36, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>✓</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#132853' }}>
                  {lang === 'fr' ? 'Certifié Automatik Gebrauchtwagen' : lang === 'en' ? 'Certified Automatik Gebrauchtwagen' : lang === 'de' ? 'Zertifiziert Automatik Gebrauchtwagen' : 'معتمد من Automatik Gebrauchtwagen'}
                </div>
                <p style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text, marginTop: 4 }}>
                  {lang === 'fr' ? 'Ce véhicule a validé notre contrôle qualité complet.' : lang === 'en' ? 'This vehicle has passed our complete quality control.' : lang === 'de' ? 'Dieses Fahrzeug hat unsere vollständige Qualitätskontrolle bestanden.' : 'اجتازت هذه المركبة فحص الجودة الكامل لدينا.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. SECTION HISTORIQUE ENTRETIEN */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 64 : 96, marginBottom: isMobile ? 48 : 72 }}
        >
          <div style={{ marginBottom: isMobile ? 28 : 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Transparence' : lang === 'en' ? 'Transparency' : lang === 'de' ? 'Transparenz' : 'شفافية'}
            </span>
            <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
              {lang === 'fr' ? 'Historique d\u2019entretien' : lang === 'en' ? 'Maintenance history' : lang === 'de' ? 'Wartungshistorie' : 'سجل الصيانة'}
            </h2>
          </div>

          {/* Transparency badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#132853,#0E1E3D)', borderRadius: 10, fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {lang === 'fr' ? 'Transparence totale' : lang === 'en' ? 'Total transparency' : lang === 'de' ? 'Volle Transparenz' : 'شفافية كاملة'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#132853' }}>100%</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text2 }}>
                {lang === 'fr' ? 'Traçabilité vérifiée' : lang === 'en' ? 'Verified traceability' : lang === 'de' ? 'Verifizierte Rückverfolgbarkeit' : 'قابلية التتبع موثقة'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginBottom: 32, maxWidth: 700, lineHeight: 1.6 }}>
            {lang === 'fr' ? 'Ce véhicule bénéficie d\'un historique complet et traçable. Toutes les révisions, entretiens, pièces remplacées et documents administratifs sont vérifiés.' : lang === 'en' ? 'This vehicle benefits from a complete and traceable history. All services, maintenance, replaced parts and administrative documents are verified.' : lang === 'de' ? 'Dieses Fahrzeug verfügt über eine vollständige und nachverfolgbare Historie. Alle Serviceleistungen, Wartungen, ersetzten Teile und Verwaltungsdokumente werden überprüft.' : 'تتمتع هذه المركبة بسجل كامل قابل للتتبع. يتم التحقق من جميع الخدمات والصيانة والأجزاء المستبدلة والوثائق الإدارية.'}
          </p>

          {/* History cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { title: lang === 'fr' ? 'Vérification antécédents' : lang === 'en' ? 'Background verification' : lang === 'de' ? 'Hintergrundüberprüfung' : 'التحقق من الخلفية', desc: lang === 'fr' ? 'Bases officielles : sinistres, vols, jauges' : lang === 'en' ? 'Official databases: accidents, thefts, odometer' : lang === 'de' ? 'Offizielle Datenbanken: Unfälle, Diebstahl, Tachometer' : 'قواعد البيانات الرسمية: الحوادث، السرقات، عدادات المسافة', icon: '🔍' },
              { title: lang === 'fr' ? 'Carnet entretien analysé' : lang === 'en' ? 'Service log analyzed' : lang === 'de' ? 'Serviceheft analysiert' : 'تحليل سجل الخدمة', desc: lang === 'fr' ? 'Révisions, vidanges, pièces remplacées' : lang === 'en' ? 'Services, oil changes, replaced parts' : lang === 'de' ? 'Service, Ölwechsel, ersetzte Teile' : 'الخدمات، تغيير الزيت، الأجزاء المستبدلة', icon: '📋' },
              { title: lang === 'fr' ? 'Entretien pré-vente' : lang === 'en' ? 'Pre-sale maintenance' : lang === 'de' ? 'Vorverkaufswartung' : 'صيانة ما قبل البيع', desc: lang === 'fr' ? 'Fluides mis à jour, véhicule prêt à rouler' : lang === 'en' ? 'Fluids updated, vehicle ready to drive' : lang === 'de' ? 'Flüssigkeiten aktualisiert, fahrbereit' : 'السوائل محدثة، المركبة جاهزة للقيادة', icon: '🔧' },
              { title: lang === 'fr' ? 'Rapport acheteur' : lang === 'en' ? 'Buyer report' : lang === 'de' ? 'Käuferbericht' : 'تقرير المشتري', desc: lang === 'fr' ? 'Rapport d\'inspection remis à la livraison' : lang === 'en' ? 'Inspection report provided at delivery' : lang === 'de' ? 'Inspektionsbericht bei Lieferung übergeben' : 'تقرير الفحص مقدم عند التسليم', icon: '📄' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: isMobile ? 24 : 28, boxShadow: C.shadow, transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.4)'; e.currentTarget.style.transform='translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</h5>
                    <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related Vehicles */}
        {car && (similarLoading || similarCars.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: isMobile ? 64 : 96 }}
          >
            <div style={{ marginBottom: isMobile ? 28 : 36 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
                {lang==='fr'?'VOUS POURRIEZ AUSSI AIMER':lang==='en'?'YOU MIGHT ALSO LIKE':lang==='de'?'SIE KÖNNTEN AUCH GEFALLEN':lang==='es'?'TAMBIÉN PODRÍA GUSTARLE':lang==='it'?'POTREBBE PIACERTI ANCHE':'VOCÊ TAMBÉM PODE GOSTAR'}
              </span>
              <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
                {lang==='fr'?'Véhicules similaires':lang==='en'?'Similar Vehicles':lang==='de'?'Ähnliche Fahrzeuge':lang==='es'?'Vehículos Similares':lang==='it'?'Veicoli Simili':'Veículos Similares'}
              </h2>
            </div>
            {similarLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Loader />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
                {similarCars.slice(0, isMobile ? 2 : 3).map((similar, i) => (
                  <CarCard key={similar.id} car={similar} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Vehicle Type Suggestions */}
        {car && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginTop: isMobile ? 64 : 96 }}
          >
            <div style={{ marginBottom: isMobile ? 28 : 36 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
                {lang==='fr'?'NOS MARQUES':lang==='en'?'OUR BRANDS':lang==='de'?'UNSERE MARKEN':lang==='es'?'NUESTRAS MARCAS':lang==='it'?'I NOSTRI MARCHI':'AS NOSSAS MARCAS'}
              </span>
              <h2 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.025em', marginTop: 8 }}>
                {lang==='fr'?'Explorez notre gamme':lang==='en'?'Explore our range':lang==='de'?'Erkunden Sie unsere Auswahl':lang==='es'?'Explore nuestra gama':lang==='it'?'Esplora la nostra gamma':'Explore nossa gama'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
              <Link
                to="/catalog"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: 24,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(19,40,83,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 40 }}>🚗</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{lang==='fr'?'Catalogue complet':lang==='en'?'Full catalogue':lang==='de'?'Kompletter Katalog':lang==='es'?'Catálogo completo':lang==='it'?'Catalogo completo':'Catálogo completo'}</div>
                <div style={{ fontSize: 13, color: C.text3 }}>
                  {lang === 'fr' ? 'Voir le catalogue →' :
                   lang === 'en' ? 'View catalogue →' :
                   lang === 'de' ? 'Katalog ansehen →' :
                   lang === 'ar' ? 'عرض الكتالوج ←' :
                   'Ver catálogo →'}
                </div>
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}