import { useBreakpoint } from '../hooks/useBreakpoint';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { simAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import CarCard from '../components/CarCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';

export default function Simulation() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [salary, setSalary]     = useState(3000);
  const [inputVal, setInputVal] = useState('3000');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const l = lang || 'fr';

  const fetchSim = useCallback(async (val) => {
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      const { data } = await simAPI.simulate(val);
      setResult(data);
      setSearched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleSlider = (e) => { const v = parseInt(e.target.value); setSalary(v); setInputVal(String(v)); };
  const handleInput  = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInputVal(raw);
    const v = parseInt(raw);
    if (v && v >= 500 && v <= 50000) setSalary(v);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerWrap = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  const L = {
    label:       { fr:'Outil de simulation',    en:'Financing Simulator',       de:'Finanzierungsrechner',      es:'Simulador de financiación',       it:'Simulatore di finanziamento',   pt:'Simulador de financiamento' },
    title1:      { fr:'Simuler mon',            en:'Simulate my',               de:'Finanzierung',               es:'Simular mi',                      it:'Simula il mio',                 pt:'Simular meu' },
    title2:      { fr:'financement',            en:'financing',                  de:'simulieren',                 es:'financiación',                    it:'finanziamento',                 pt:'financiamento' },
    sub:         { fr:'Indiquez votre salaire mensuel et découvrez instantanément les véhicules accessibles (33% du salaire).', en:'Enter your monthly salary and instantly discover accessible vehicles (33% of salary).', de:'Geben Sie Ihr Monatsgehalt ein und entdecken Sie sofort erreichbare Fahrzeuge (33% des Gehalts).', es:'Indique su salario mensual y descubra al instante los vehículos accesibles (33% del salario).', it:'Inserisci il tuo stipendio mensile e scopri subito i veicoli accessibili (33% dello stipendio).', pt:'Indique o seu salário mensal e descubra instantaneamente os veículos acessíveis (33% do salário).' },
    sliderLabel: { fr:'Votre salaire mensuel brut', en:'Your gross monthly salary', de:'Ihr Brutto-Monatsgehalt', es:'Su salario mensual bruto', it:'Il vostro stipendio mensile lordo', pt:'O seu salário mensal bruto' },
    profile:     { fr:'Votre profil financier', en:'Your financial profile',     de:'Ihr Finanzprofil',          es:'Su perfil financiero',             it:'Il vostro profilo finanziario',  pt:'O seu perfil financeiro' },
    salaryL:     { fr:'Salaire',                en:'Salary',                     de:'Gehalt',                    es:'Salario',                          it:'Stipendio',                     pt:'Salário' },
    maxRate:     { fr:'Mensualité max (33%)',   en:'Max monthly (33%)',          de:'Max. Rate (33%)',            es:'Cuota máx. (33%)',                 it:'Rata max. (33%)',               pt:'Parcela máx. (33%)' },
    deposit:     { fr:'Acompte possible (×3)', en:'Possible deposit (×3)',      de:'Mögliche Anzahlung (×3)',   es:'Señal posible (×3)',               it:'Acconto possibile (×3)',         pt:'Entrada possível (×3)' },
    simulate:    { fr:'Simuler maintenant',     en:'Simulate now',               de:'Jetzt simulieren',          es:'Simular ahora',                    it:'Simula ora',                    pt:'Simular agora' },
    loadingL:    { fr:'Recherche en cours...',  en:'Searching...',               de:'Suche läuft...',            es:'Buscando...',                      it:'Ricerca in corso...',           pt:'Pesquisando...' },
    results:     { fr:'véhicule(s) accessible(s) avec un salaire de', en:'vehicle(s) accessible with a salary of', de:'Fahrzeug(e) erreichbar mit Gehalt von', es:'vehículo(s) accesible(s) con un salario de', it:'veicolo/i accessibile/i con uno stipendio di', pt:'veículo(s) acessível/eis com um salário de' },
    maxRateR:    { fr:'Mensualité max :',       en:'Max. monthly rate:',         de:'Max. Rate:',                es:'Cuota máx.:',                      it:'Rata max.:',                    pt:'Parcela máx.:' },
    noResult:    { fr:'Aucun véhicule accessible', en:'No vehicles accessible', de:'Keine Fahrzeuge erreichbar', es:'Ningún vehículo accesible',       it:'Nessun veicolo accessibile',    pt:'Nenhum veículo acessível' },
    noResultSub: { fr:'Avec une mensualité max de', en:'With a max monthly of', de:'Mit max. Rate von',         es:'Con una cuota máx. de',            it:'Con una rata max. di',          pt:'Com uma parcela máx. de' },
    noResultSub2:{ fr:", aucun véhicule ne correspond. Contactez-nous pour des solutions personnalisées.", en:", no vehicle matches. Contact us for personalised solutions.", de:", passt kein Fahrzeug. Kontaktieren Sie uns.", es:", ningún vehículo coincide. Contáctenos para soluciones personalizadas.", it:", nessun veicolo corrisponde. Contattateci per soluzioni personalizzate.", pt:", nenhum veículo corresponde. Contacte-nos para soluções personalizadas." },
    contact:     { fr:'Nous contacter via WhatsApp', en:'Contact us via WhatsApp', de:'WhatsApp kontaktieren', es:'Contáctenos por WhatsApp',         it:'Contattateci via WhatsApp',     pt:'Contacte-nos via WhatsApp' },
    per_month:   { fr:'/mois',                 en:'/month',                     de:'/Monat',                    es:'/mes',                             it:'/mese',                         pt:'/mês' },
    introTag:    { fr:'Financement Auto',      en:'Car Financing',              de:'Autofinanzierung',          es:'Financiacion Auto',                it:'Finanziamento Auto',            pt:'Financiamento Auto' },
    introTitle:  { fr:'Payez par mois jusqu a la remise de votre vehicule', en:'Pay monthly until vehicle delivery', de:'Monatlich zahlen bis zur Fahrzeugubergabe', es:'Paga mensualmente hasta la entrega del vehiculo', it:'Paga mensilmente fino alla consegna del veicolo', pt:'Pague mensalmente ate a entrega do veiculo' },
    introSub:    { fr:'Une solution simple et transparente pour avancer pas a pas vers votre prochaine voiture, avec un rythme adapte a votre salaire.', en:'A simple and transparent solution to move step by step toward your next car, at a pace adapted to your income.', de:'Eine einfache und transparente Losung, um Schritt fur Schritt zu Ihrem nachsten Auto zu kommen, in einem Tempo passend zu Ihrem Einkommen.', es:'Una solucion simple y transparente para avanzar paso a paso hacia su proximo coche, con un ritmo adaptado a sus ingresos.', it:'Una soluzione semplice e trasparente per avanzare passo dopo passo verso la tua prossima auto, con un ritmo adatto al tuo reddito.', pt:'Uma solucao simples e transparente para avancar passo a passo rumo ao seu proximo carro, com um ritmo adaptado ao seu rendimento.' },
    introStep1T: { fr:'1. Vous choisissez votre budget mensuel', en:'1. Choose your monthly budget', de:'1. Monatliches Budget festlegen', es:'1. Elige tu presupuesto mensual', it:'1. Scegli il tuo budget mensile', pt:'1. Escolha seu orcamento mensal' },
    introStep1D: { fr:'Le simulateur calcule une mensualite realiste selon votre salaire.', en:'The simulator calculates a realistic monthly payment based on your salary.', de:'Der Rechner berechnet eine realistische Monatsrate auf Basis Ihres Gehalts.', es:'El simulador calcula una cuota mensual realista segun su salario.', it:'Il simulatore calcola una rata mensile realistica in base al tuo stipendio.', pt:'O simulador calcula uma parcela mensal realista com base no seu salario.' },
    introStep2T: { fr:'2. Vous payez par mois', en:'2. Pay month by month', de:'2. Monat fur Monat zahlen', es:'2. Pagas mes a mes', it:'2. Paghi mese per mese', pt:'2. Pague mes a mes' },
    introStep2D: { fr:'Vous avancez progressivement vers votre objectif, sans pression.', en:'You move progressively toward your goal, without pressure.', de:'Sie kommen schrittweise und ohne Druck Ihrem Ziel naher.', es:'Avanzas progresivamente hacia tu objetivo, sin presion.', it:'Avanzi progressivamente verso il tuo obiettivo, senza pressione.', pt:'Voce avanca progressivamente rumo ao seu objetivo, sem pressao.' },
    introStep3T: { fr:'3. Vous obtenez votre vehicule', en:'3. Receive your vehicle', de:'3. Fahrzeug erhalten', es:'3. Recibe tu vehiculo', it:'3. Ricevi il tuo veicolo', pt:'3. Receba seu veiculo' },
    introStep3D: { fr:'Quand les conditions sont atteintes, la livraison est organisee rapidement.', en:'Once conditions are met, delivery is arranged quickly.', de:'Sobald die Bedingungen erfullt sind, wird die Ubergabe schnell organisiert.', es:'Cuando se cumplen las condiciones, la entrega se organiza rapidamente.', it:'Quando le condizioni sono soddisfatte, la consegna viene organizzata rapidamente.', pt:'Quando as condicoes sao atingidas, a entrega e organizada rapidamente.' },
    introExplainT:{ fr:'Comment cela fonctionne en detail', en:'How it works in detail', de:'So funktioniert es im Detail', es:'Como funciona en detalle', it:'Come funziona in dettaglio', pt:'Como funciona em detalhe' },
    introExplainD:{ fr:'Vous commencez avec un montant mensuel confortable. Chaque mensualite vous rapproche de votre objectif, avec une lecture claire de votre progression et un accompagnement a chaque etape.', en:'You start with a comfortable monthly amount. Each payment brings you closer to your goal, with clear progress tracking and support at every step.', de:'Sie starten mit einem passenden Monatsbetrag. Jede Rate bringt Sie Ihrem Ziel naher, mit klarer Fortschrittsanzeige und Begleitung in jeder Phase.', es:'Empiezas con un importe mensual comodo. Cada cuota te acerca a tu objetivo, con una vision clara del progreso y acompanamiento en cada etapa.', it:'Inizi con un importo mensile sostenibile. Ogni rata ti avvicina al tuo obiettivo, con monitoraggio chiaro dei progressi e supporto continuo.', pt:'Comeca com um valor mensal confortavel. Cada parcela aproxima voce do objetivo, com visao clara do progresso e apoio em cada etapa.' },
    introBenefit1T:{ fr:'Transparence totale', en:'Total transparency', de:'Volle Transparenz', es:'Transparencia total', it:'Trasparenza totale', pt:'Transparencia total' },
    introBenefit1D:{ fr:'Montants, periodicite et etapes sont presentes clairement des le depart.', en:'Amounts, schedule, and milestones are clearly presented from day one.', de:'Betrage, Rhythmus und Schritte sind von Anfang an klar dargestellt.', es:'Importes, periodicidad y etapas se presentan claramente desde el inicio.', it:'Importi, periodicita e fasi sono chiare fin dall inizio.', pt:'Valores, periodicidade e etapas sao claros desde o inicio.' },
    introBenefit2T:{ fr:'Rythme adapte', en:'Adapted pace', de:'Angepasstes Tempo', es:'Ritmo adaptado', it:'Ritmo adattato', pt:'Ritmo adaptado' },
    introBenefit2D:{ fr:'Le plan mensuel suit votre capacite financiere pour rester serein.', en:'The monthly plan follows your financial capacity to keep things stress-free.', de:'Der Monatsplan orientiert sich an Ihrer finanziellen Moglichkeit fur mehr Gelassenheit.', es:'El plan mensual sigue tu capacidad financiera para mantener la tranquilidad.', it:'Il piano mensile segue la tua capacita finanziaria per restare sereno.', pt:'O plano mensal acompanha sua capacidade financeira para manter tranquilidade.' },
    introBenefit3T:{ fr:'Accompagnement humain', en:'Human support', de:'Personliche Begleitung', es:'Acompanamiento humano', it:'Supporto umano', pt:'Acompanhamento humano' },
    introBenefit3D:{ fr:'Notre equipe vous guide du premier versement jusqu a la livraison.', en:'Our team guides you from the first payment to delivery.', de:'Unser Team begleitet Sie von der ersten Zahlung bis zur Ubergabe.', es:'Nuestro equipo te acompana desde el primer pago hasta la entrega.', it:'Il nostro team ti segue dal primo pagamento fino alla consegna.', pt:'Nossa equipe acompanha voce do primeiro pagamento ate a entrega.' },
    introTrust1:  { fr:'Aucune surprise sur les mensualites', en:'No surprises on monthly payments', de:'Keine Uberraschungen bei Monatsraten', es:'Sin sorpresas en las cuotas mensuales', it:'Nessuna sorpresa sulle rate mensili', pt:'Sem surpresas nas parcelas mensais' },
    introTrust2:  { fr:'Suivi clair de votre progression', en:'Clear tracking of your progress', de:'Klarer Fortschrittsuberblick', es:'Seguimiento claro de su progreso', it:'Monitoraggio chiaro dei progressi', pt:'Acompanhamento claro do progresso' },
    introTrust3:  { fr:'Livraison organisee des validation', en:'Delivery arranged once validation is complete', de:'Ubergabe nach abgeschlossener Prufung', es:'Entrega organizada tras validacion completa', it:'Consegna organizzata dopo convalida completa', pt:'Entrega organizada apos validacao completa' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '48px 5% 36px' : '72px 6% 56px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%', background:'radial-gradient(ellipse at right, rgba(19,40,83,0.07), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto' }}>
          <div className="section-eyebrow">{L.label[l]}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(40px,6vw,88px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1, marginBottom:16 }}>
            <span style={{ display:'block' }}>{L.title1[l]}</span>
            <span style={{ display:'block', color:'var(--red)' }}>{L.title2[l]}</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color:'var(--text-3)', maxWidth:520, lineHeight:1.7 }}>{L.sub[l]}</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>
        {/* Financing intro */}
        <motion.section
          style={{ marginBottom:30 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerWrap}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration:0.55, ease:[0.16, 1, 0.3, 1] }}
            style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? '20px 16px' : '28px 30px' }}
          >
            <motion.p variants={fadeUp} transition={{ duration:0.45 }} style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:10 }}>
              {L.introTag[l]}
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration:0.5 }} style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 26 : 34, color:'var(--text)', lineHeight:1.2, marginBottom:10 }}>
              {L.introTitle[l]}
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration:0.52 }} style={{ fontSize: isMobile ? 14 : 16, color:'var(--text-3)', lineHeight:1.7, marginBottom:18 }}>
              {L.introSub[l]}
            </motion.p>

            <motion.div variants={staggerWrap} style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,minmax(0,1fr))', gap:12, marginBottom:16 }}>
              {[
                { t: L.introStep1T[l], d: L.introStep1D[l] },
                { t: L.introStep2T[l], d: L.introStep2D[l] },
                { t: L.introStep3T[l], d: L.introStep3D[l] },
              ].map((item) => (
                <motion.div
                  key={item.t}
                  variants={fadeUp}
                  transition={{ duration:0.5 }}
                  whileHover={{ y:-4, borderColor:'var(--red)' }}
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 16 }}
                >
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:15, color:'var(--text)', marginBottom:7 }}>{item.t}</p>
                  <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6 }}>{item.d}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration:0.52 }} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 18, marginBottom:16 }}>
              <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:8 }}>
                {L.introExplainT[l]}
              </p>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.75 }}>
                {L.introExplainD[l]}
              </p>
            </motion.div>

            <motion.div variants={staggerWrap} style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,minmax(0,1fr))', gap:12, marginBottom:16 }}>
              {[
                { t: L.introBenefit1T[l], d: L.introBenefit1D[l] },
                { t: L.introBenefit2T[l], d: L.introBenefit2D[l] },
                { t: L.introBenefit3T[l], d: L.introBenefit3D[l] },
              ].map((item) => (
                <motion.div
                  key={item.t}
                  variants={fadeUp}
                  transition={{ duration:0.45 }}
                  whileHover={{ scale: 1.01 }}
                  style={{ background:'linear-gradient(135deg, var(--bg-card), var(--bg-card2))', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 16 }}
                >
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:14, color:'var(--text)', marginBottom:6 }}>{item.t}</p>
                  <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6 }}>{item.d}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={staggerWrap} style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,minmax(0,1fr))', gap:10 }}>
              {[L.introTrust1[l], L.introTrust2[l], L.introTrust3[l]].map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  transition={{ duration:0.42 }}
                  whileHover={{ x: 3 }}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', border:'1px dashed var(--border)', borderRadius:10, background:'rgba(255,255,255,0.01)' }}
                >
                  <span style={{ color:'var(--red)', fontWeight:900 }}>✓</span>
                  <span style={{ fontSize:13, color:'var(--text-2)' }}>{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Simulator card */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? '24px 20px' : '40px 44px', marginBottom:44, boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 28 : 52, alignItems:'center' }}>

            {/* Slider */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:24 }}>
                {L.sliderLabel[l]}
              </label>
              <input type="range" min="500" max="50000" step="100" value={salary} onChange={handleSlider}
                style={{ width:'100%', marginBottom:10, accentColor:'var(--red)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:24 }}>
                <span>€500</span><span>€50 000</span>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18, fontWeight:800, color:'var(--text-3)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>€</span>
                  <input type="text" value={inputVal} onChange={handleInput}
                    className="input-luxury"
                    style={{ paddingLeft:34, fontSize:20, fontWeight:800, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }} />
                </div>
                <span style={{ fontSize:13, color:'var(--text-3)', fontWeight:600, flexShrink:0 }}>{L.per_month[l]}</span>
              </div>
            </div>

            {/* Profile + CTA */}
            <div>
              <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 18 : 24, marginBottom:18 }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>{L.profile[l]}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {[
                    { label:L.salaryL[l],  value:formatEuro(salary),               color:'var(--text)' },
                    { label:L.maxRate[l],  value:formatEuro(Math.round(salary*0.33)), color:'var(--red)' },
                    { label:L.deposit[l],  value:formatEuro(salary*3),              color:'var(--text-2)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:14, color:'var(--text-3)' }}>{label}</span>
                      <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => fetchSim(salary)} disabled={loading} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding: isMobile ? 15 : 18, fontSize:15 }}>
                {loading ? L.loadingL[l] : '🔍 ' + L.simulate[l]}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && <div style={{ display:'flex', justifyContent:'center' }}><Loader text={L.loadingL[l]} /></div>}

        {searched && !loading && result && (
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              {result.count > 0 ? (
                <>
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 64 : 88, color:'var(--red)', lineHeight:1, letterSpacing:'-0.03em' }}>{result.count}</p>
                  <p style={{ fontSize: isMobile ? 15 : 18, color:'var(--text-2)', marginTop:8, lineHeight:1.6 }}>
                    {L.results[l]} <strong style={{ color:'var(--text)' }}>{formatEuro(result.salary)}</strong>
                  </p>
                  <p style={{ fontSize:14, color:'var(--text-3)', marginTop:6 }}>
                    {L.maxRateR[l]} <strong style={{ color:'var(--red)' }}>{formatEuro(result.maxMonthly)}</strong>
                  </p>
                </>
              ) : (
                <div style={{ padding:'40px 0' }}>
                  <p style={{ fontSize:52, marginBottom:16 }}>🔍</p>
                  <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 24 : 30, color:'var(--text)', marginBottom:12 }}>{L.noResult[l]}</h3>
                  <p style={{ fontSize:15, color:'var(--text-3)', maxWidth:460, margin:'0 auto', lineHeight:1.7 }}>
                    {L.noResultSub[l]} <strong style={{ color:'var(--red)' }}>{formatEuro(result.maxMonthly)}</strong>{L.noResultSub2[l]}
                  </p>
                  <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer"
                    className="btn-primary" style={{ display:'inline-flex', marginTop:24, fontSize:14 }}>
                    💬 {L.contact[l]}
                  </a>
                </div>
              )}
            </div>

            {result.cars?.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: isMobile ? 14 : 22 }}>
                {result.cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}