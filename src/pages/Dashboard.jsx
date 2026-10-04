import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI, bankAPI } from '../services/api';
import { useAuthStore, useCartStore, useLangStore } from '../store';
import { formatEuro, formatDate, getInitials } from '../utils/helpers';
import { StatusBadge, Loader } from '../components/UI';
import BankDetails from '../components/BankDetails';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

const NAV_ITEMS = [
  { to:'/dashboard',  icon:'⊞', key:'nav_dashboard' },
  { to:'/orders',     icon:'📦', key:'nav_orders' },
  { to:'/cart',       icon:'🛒', key:'nav_cart' },
  { to:'/profile',    icon:'👤', key:'nav_profile' },
  { to:'/simulation', icon:'🧮', key:'nav_financing' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { cartCount } = useCartStore();
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const [orders, setOrders]   = useState([]);
  const [bank, setBank]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [params]              = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const isWelcome = params.get('welcome') === '1';
  const l = lang || 'fr';

  useEffect(() => {
    orderAPI.getMy().then(r => {
      setOrders(Array.isArray(r.data) ? r.data.slice(0,5) : []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  useEffect(() => {
    bankAPI.get().then(r => setBank(r.data?.bank || null)).catch(() => {});
  }, []);

  const maxMonthly = user?.monthlySalary ? Math.round(user.monthlySalary * 0.33) : null;

  const Sidebar = () => (
    <aside style={{
      ...(isMobile ? {
        position:'fixed', top:0, left:0, bottom:0, zIndex:200,
        width:'78vw', maxWidth:300,
        background:'var(--bg-card)', boxShadow:'var(--shadow-xl)',
        overflowY:'auto', padding:'24px 16px',
        transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.3s var(--ease)',
      } : {})
    }}>
      {/* Profile card */}
      <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:12, padding:20, marginBottom:14, textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:20, color:'#fff', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(19,40,83,0.3)' }}>
          {getInitials(user?.firstName, user?.lastName)}
        </div>
        <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:17, color:'var(--text)', marginBottom:3 }}>{user?.firstName} {user?.lastName}</h2>
        <p style={{ fontSize:12, color:'var(--text-3)' }}>{user?.email}</p>
        <div style={{ height:1, background:'var(--border)', margin:'14px 0' }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[{ label:t('nav_orders',l), value:orders.length }, { label:t('nav_cart',l), value:cartCount }].map(({label,value})=>(
            <div key={label} style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 8px', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:24, color:'var(--red)' }}>{value}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2, fontWeight:600 }}>{label}</div>
            </div>
          ))}
        </div>
        {user?.monthlySalary && maxMonthly && (
          <div style={{ marginTop:14, padding:'12px 14px', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8, textAlign:'left' }}>
            <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--red)', marginBottom:8 }}>{t('nav_financing',l)}</p>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
              <span style={{ color:'var(--text-3)' }}>{t('salary',l).replace(' (€)','')}</span>
              <span style={{ color:'var(--text)', fontWeight:700 }}>{formatEuro(user.monthlySalary)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--text-3)' }}>{lang==='fr'?'Max mensualité':lang==='en'?'Max monthly':lang==='de'?'Max. Rate':lang==='es'?'Cuota máx.':lang==='it'?'Rata max.':'Parcela máx.'}</span>
              <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(maxMonthly)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:12, padding:6, boxShadow:'var(--shadow-sm)' }}>
        {NAV_ITEMS.map(({ to, icon, key }) => (
          <Link key={to} to={to} onClick={() => setNavOpen(false)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:8, fontSize:14, fontWeight:600, color:'var(--text-2)', textDecoration:'none', transition:'all 0.2s', marginBottom:2 }}
            onMouseOver={e=>{e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)';}}
            onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)';}}>
            <span style={{ fontSize:18 }}>{icon}</span>
            {t(key, l)}
          </Link>
        ))}
      </div>
    </aside>
  );

  return (
    <div style={{ minHeight:'100vh', paddingTop:72, background:'var(--bg)' }}>
      {isWelcome && (
        <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}
          style={{ background:'var(--red-bg)', borderBottom:'1px solid var(--red-border)', padding:'14px 6%', textAlign:'center' }}>
          <p style={{ fontSize:15, color:'var(--red)', fontWeight:600 }}>
            🎉 {lang==='fr'?'Bienvenu(e) chez Automatik !':lang==='en'?'Welcome to Automatik!':lang==='de'?'Willkommen bei Automatik!':lang==='es'?'¡Bienvenido/a a Automatik!':lang==='it'?'Benvenuto/a in Automatik!':'Bem-vindo/a à Automatik!'}
          </p>
        </motion.div>
      )}

      {/* Mobile overlay */}
      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199, backdropFilter:'blur(4px)' }} />
      )}

      <Sidebar />

      <div style={{ maxWidth:1200, margin:'0 auto', padding: isMobile ? '20px 4%' : '40px 6%' }}>

        {/* Mobile profile trigger */}
        {isMobile && (
          <button onClick={() => setNavOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', marginBottom:20, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fff', flexShrink:0 }}>
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div style={{ textAlign:'left', flex:1 }}>
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>{user?.email}</p>
            </div>
            <span style={{ fontSize:18, color:'var(--text-3)' }}>☰</span>
          </button>
        )}

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '210px 1fr' : '256px 1fr', gap: isMobile ? 0 : 32 }}>
          {!isMobile && <Sidebar />}

          <div>
            {/* Greeting */}
            <div style={{ marginBottom:24 }}>
              <div className="section-eyebrow">{lang==='fr'?'Mon Espace':lang==='en'?'My Account':lang==='de'?'Mein Bereich':lang==='es'?'Mi cuenta':lang==='it'?'Il mio spazio':'Minha conta'}</div>
              <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
                {t('welcome_back', l)} {user?.firstName} 👋
              </h1>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${isMobile?2:3},1fr)`, gap: isMobile ? 10 : 14, marginBottom:24 }}>
              {[
                { icon:'📦', label:t('nav_orders',l), value:orders.length, link:'/orders' },
                { icon:'🛒', label:t('nav_cart',l), value:cartCount, link:'/cart' },
                { icon:'💶', label:lang==='fr'?'Max mensualité':lang==='en'?'Max monthly':lang==='de'?'Max. Rate':lang==='es'?'Cuota máx.':lang==='it'?'Rata max.':'Parcela máx.', value:maxMonthly ? formatEuro(maxMonthly) : '—', link:'/simulation' },
              ].map(({ icon, label, value, link }) => (
                <Link key={label} to={link} style={{ textDecoration:'none', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? '14px 12px' : '20px 18px', boxShadow:'var(--shadow-sm)', transition:'all 0.25s var(--ease)', display:'block' }}
                  onMouseOver={e=>{e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none';}}>
                  <div style={{ fontSize: isMobile ? 22 : 26, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 26, color:'var(--red)', lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize: isMobile ? 11 : 13, color:'var(--text-3)', marginTop:5, fontWeight:600 }}>{label}</div>
                </Link>
              ))}
            </div>

            {/* Recent orders */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:18, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)' }}>
                  {lang==='fr'?'Dernières commandes':lang==='en'?'Recent orders':lang==='de'?'Letzte Bestellungen':lang==='es'?'Últimos pedidos':lang==='it'?'Ultimi ordini':'Últimos pedidos'}
                </p>
                <Link to="/orders" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none', fontWeight:600 }}>{t('see_all',l)} →</Link>
              </div>
              <div style={{ padding:'8px 12px 12px' }}>
                {loading ? <div style={{ display:'flex', justifyContent:'center', padding:32 }}><Loader size="sm" /></div> : orders.length===0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0' }}>
                    <p style={{ fontSize:40, marginBottom:10 }}>📦</p>
                    <p style={{ color:'var(--text-3)', fontSize:14, marginBottom:16 }}>
                      {lang==='fr'?'Pas encore de commande.':lang==='en'?'No orders yet.':lang==='de'?'Noch keine Bestellungen.':lang==='es'?'Sin pedidos aún.':lang==='it'?'Nessun ordine ancora.':'Sem pedidos ainda.'}
                    </p>
                    <Link to="/catalog" className="btn-gold" style={{ fontSize:13 }}>{t('discover',l)}</Link>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 8px', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'monospace', fontSize:13, color:'var(--red)', fontWeight:700 }}>{order.orderNumber}</p>
                      <p style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:17, color:'var(--text)', whiteSpace:'nowrap' }}>{formatEuro(order.totalPrice)}</p>
                    <Link to={`/track/${order.orderNumber}`} style={{ fontSize:12, color:'var(--red)', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>
                      {lang==='fr'?'Suivre →':lang==='en'?'Track →':lang==='de'?'Verfolgen →':lang==='es'?'Rastrear →':lang==='it'?'Traccia →':'Rastrear →'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordonnées bancaires */}
            {bank && (bank.iban || bank.bic) && (
              <div style={{ marginBottom:24 }}>
                <BankDetails
                  bank={bank}
                  title={lang==='fr'?'Coordonnées bancaires':lang==='en'?'Bank details':lang==='de'?'Bankdaten':lang==='es'?'Datos bancarios':lang==='it'?'Coordinate bancarie':'Dados bancários'}
                  compact
                />
              </div>
            )}

            {/* Confiance & conformité */}
            <div style={{ marginBottom:24, padding:'18px 20px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:12 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>
                {lang==='fr'?'Pourquoi nous faire confiance ?':lang==='en'?'Why trust us?':lang==='de'?'Warum uns vertrauen?':lang==='es'?'¿Por qué confiar?':lang==='it'?'Perché fidarsi?':'Por que confiar?'}
              </p>
              <ul style={{ margin:0, paddingLeft:18, color:'var(--text-2)', fontSize:13, lineHeight:1.75 }}>
                <li><strong style={{ color:'var(--text)' }}>Automatik Gebrauchtwagen</strong> — {lang==='fr'?'société immatriculée en Allemagne (GmbH), siège à Naumburg.':lang==='en'?'German GmbH based in Naumburg.':lang==='de'?'Deutsche GmbH mit Sitz in Naumburg.':lang==='es'?'Sociedad alemana con sede en Naumburg.':lang==='it'?'Società tedesca con sede a Naumburg.':'Empresa alemã sediada em Naumburg.'}</li>
                <li>{lang==='fr'?'Prix affichés en euros, commande et suivi en ligne.':lang==='en'?'Prices in EUR, online ordering and tracking.':lang==='de'?'Preise in EUR, Online-Bestellung & Tracking.':lang==='es'?'Precios en EUR, pedido y seguimiento online.':lang==='it'?'Prezzi in EUR, ordine e tracciamento online.':'Preços em EUR, pedido e acompanhamento online.'}</li>
                <li>{lang==='fr'?'Documents : ':lang==='en'?'Policies: ':lang==='de'?'Dokumente: ':lang==='es'?'Documentos: ':lang==='it'?'Documenti: ':'Documentos: '}
                  <Link to="/politique-de-vente" style={{ color:'var(--red)', fontWeight:700 }}>{lang==='fr'?'Politique de vente':lang==='en'?'Sales':lang==='de'?'Verkauf':'Vendas'}</Link>
                  {' · '}
                  <Link to="/politique-confidentialite" style={{ color:'var(--red)', fontWeight:700 }}>{lang==='fr'?'Confidentialité':lang==='en'?'Privacy':lang==='de'?'Datenschutz':'Privacidade'}</Link>
                  {' · '}
                  <Link to="/mentions-legales" style={{ color:'var(--red)', fontWeight:700 }}>
                    {lang==='fr'?'Mentions légales':lang==='en'?'Legal notice':lang==='de'?'Impressum':lang==='es'?'Aviso legal':lang==='it'?'Note legali':'Aviso legal'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* WhatsApp CTA */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, padding:'16px 20px', background:'rgba(37,211,102,0.05)', border:'1px solid rgba(37,211,102,0.15)', borderRadius:12 }}>
              <p style={{ fontSize:14, color:'var(--text-3)', flex:1 }}>
                {lang==='fr'?'Une question ? Contactez-nous sur WhatsApp !':lang==='en'?'A question? Contact us on WhatsApp!':lang==='de'?'Fragen? Schreiben Sie uns auf WhatsApp!':lang==='es'?'¿Una pregunta? ¡Contáctenos por WhatsApp!':lang==='it'?'Una domanda? Contattateci su WhatsApp!':'Uma dúvida? Fale conosco no WhatsApp!'}
              </p>
              <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', padding:'10px 20px', borderRadius:8, textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
