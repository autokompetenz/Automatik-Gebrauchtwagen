import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useLangStore } from './store/index';
import { t } from './utils/i18n';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Chatbot from './components/Chatbot';
import PendingOrderReminder from './components/PendingOrderReminder';
import ClientBottomNav, { useClientBottomNavPadding } from './components/ClientBottomNav';

// Pages (code-split, chargées à la demande)
const Home         = lazy(() => import('./pages/Home'));
const Catalog      = lazy(() => import('./pages/Catalog'));
const CarDetails   = lazy(() => import('./pages/CarDetails'));
const Simulation   = lazy(() => import('./pages/Simulation'));
const Commander    = lazy(() => import('./pages/Commander'));
const Track        = lazy(() => import('./pages/Track'));
const OrderConfirm = lazy(() => import('./pages/OrderConfirm'));
const MesCommandes = lazy(() => import('./pages/MesCommandes'));
const Legal        = lazy(() => import('./pages/Legal'));
const Warranty     = lazy(() => import('./pages/Warranty'));
const Insurance    = lazy(() => import('./pages/Insurance'));
const CampingCar   = lazy(() => import('./pages/CampingCar'));
const Reviews      = lazy(() => import('./pages/Reviews'));
const Sell         = lazy(() => import('./pages/Sell'));
const Contact      = lazy(() => import('./pages/Contact'));
const Faq          = lazy(() => import('./pages/Faq'));
const About        = lazy(() => import('./pages/About'));
const Blog         = lazy(() => import('./pages/Blog'));
const Brands       = lazy(() => import('./pages/Brands'));
const Delivery     = lazy(() => import('./pages/Delivery'));
const Maintenance  = lazy(() => import('./pages/Maintenance'));

// Admin
const AdminLayout      = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCars        = lazy(() => import('./pages/admin/AdminCars'));
const AdminCarForm     = lazy(() => import('./pages/admin/AdminCarForm'));
const AdminClients     = lazy(() => import('./pages/admin/AdminClients'));
const AdminSettings    = lazy(() => import('./pages/admin/AdminSettings'));

function SeoTitle() {
  const { pathname } = useLocation();
  const { lang } = useLangStore();
  useEffect(() => {
    const base = 'Automatik Gebrauchtwagen';
    const titles = {
      '/': lang==='fr'? `${base} — Véhicules neufs et d'occasion à Naumburg, Allemagne` : `${base} — New & Used Cars in Naumburg`,
      '/catalog': lang==='fr'? `${base} — Catalogue véhicules` : `${base} — Vehicles`,
      '/simulation': lang==='fr'? `${base} — Simulation de financement` : `${base} — Financing`,
      '/contact': lang==='fr'? `${base} — Contact` : `${base} — Contact`,
      '/a-propos': lang==='fr'? `${base} — À propos` : `${base} — About`,
      '/blog': lang==='fr'? `${base} — Blog automobile` : `${base} — Blog`,
      '/avis': lang==='fr'? `${base} — Avis` : `${base} — Reviews`,
      '/faq': lang==='fr'? `${base} — FAQ` : `${base} — FAQ`,
      '/marques': lang==='fr'? `${base} — Marques` : `${base} — Brands`,
      '/livraison': lang==='fr'? `${base} — Livraison` : `${base} — Delivery`,
      '/camping-car': lang==='fr'? `${base} — Camping Cars` : `${base} — Motorhomes`,
      '/vendre': lang==='fr'? `${base} — Vendre votre véhicule` : `${base} — Sell your car`,
      '/maintenance': lang==='fr'? `${base} — Entretien` : `${base} — Maintenance`,
      '/warranty': lang==='fr'? `${base} — Garantie` : `${base} — Warranty`,
      '/insurance': lang==='fr'? `${base} — Assurance` : `${base} — Insurance`,
    };
    document.title = titles[pathname] || base;
  }, [pathname, lang]);
  return null;
}

function RouteFallback() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, margin: '0 auto 16px', borderRadius: '50%',
          border: '3px solid rgba(19,40,83,0.2)', borderTopColor: '#132853',
          animation: 'automatik-spin 0.8s linear infinite',
        }} />
        <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
          Automatik Gebrauchtwagen
        </div>
      </div>
      <style>{`@keyframes automatik-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AdminGate({ children }) {
  const { isAuthenticated, user, login } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user?.role === 'ADMIN') return children;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Erreur'); setLoading(false); return; }
      login(d.user, d.token);
    } catch { setError('Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <form onSubmit={submit} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:36, width:'92%', maxWidth:380, textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🔒</div>
        <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:6 }}>Accès administrateur</h2>
        <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:20 }}>Entrez le code d'accès pour continuer.</p>
        <input type="password" value={code} onChange={e => setCode(e.target.value)} autoFocus className="input-luxury" placeholder="Code d'accès" style={{ marginBottom:14, textAlign:'center', letterSpacing:'0.1em' }} />
        <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:13 }}>{loading ? '⏳' : 'Accéder'}</button>
        {error && <p style={{ color:'#DC2626', fontSize:13, marginTop:10 }}>{error}</p>}
      </form>
    </div>
  );
}
function MainLayout({ children }) {
  const paddingBottom = useClientBottomNavPadding();
  return (
    <>
      <Navbar />
      <div style={paddingBottom ? { paddingBottom } : undefined}>{children}</div>
      <ClientBottomNav />
      <Chatbot />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window.history.scrollRestoration === 'string') {
      window.history.scrollRestoration = 'manual';
    }
    const el = document.documentElement;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    el.style.scrollBehavior = prev;
  }, [pathname]);

  return null;
}

export default function App() {
  const { lang } = useLangStore();
  const l = lang || 'fr';

  // Apply RTL on load
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SeoTitle />
      <Toast />
      <PendingOrderReminder />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        {/* Public */}
        <Route path="/"          element={<MainLayout><Home /></MainLayout>} />
        <Route path="/catalog"   element={<MainLayout><Catalog /></MainLayout>} />
        <Route path="/cars/:id"  element={<MainLayout><CarDetails /></MainLayout>} />
        <Route path="/simulation"element={<MainLayout><Simulation /></MainLayout>} />
        <Route path="/track"     element={<MainLayout><Track /></MainLayout>} />
        <Route path="/track/:orderNumber" element={<MainLayout><Track /></MainLayout>} />
        <Route path="/warranty"   element={<MainLayout><Warranty /></MainLayout>} />
        <Route path="/insurance"  element={<MainLayout><Insurance /></MainLayout>} />
        <Route path="/camping-car" element={<MainLayout><CampingCar /></MainLayout>} />
        <Route path="/avis"        element={<MainLayout><Reviews /></MainLayout>} />
        <Route path="/vendre"      element={<MainLayout><Sell /></MainLayout>} />
        <Route path="/contact"     element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/faq"         element={<MainLayout><Faq /></MainLayout>} />
        <Route path="/a-propos"    element={<MainLayout><About /></MainLayout>} />
        <Route path="/blog"        element={<MainLayout><Blog /></MainLayout>} />
        <Route path="/marques"     element={<MainLayout><Brands /></MainLayout>} />
        <Route path="/livraison"   element={<MainLayout><Delivery /></MainLayout>} />
        <Route path="/maintenance" element={<MainLayout><Maintenance /></MainLayout>} />

        {/* Legal pages */}
        <Route path="/mentions-legales"         element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/politique-confidentialite" element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/cgv"                       element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/cookies"                   element={<MainLayout><Legal /></MainLayout>} />

        {/* Auth */}
        {/* Espace client (sans compte) */}
        <Route path="/commander/:id" element={<MainLayout><Commander /></MainLayout>} />
        <Route path="/order-confirm/:orderNumber" element={<MainLayout><OrderConfirm /></MainLayout>} />
        <Route path="/mes-commandes" element={<MainLayout><MesCommandes /></MainLayout>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminGate><AdminLayout /></AdminGate>}>
          <Route index            element={<AdminDashboard />} />
          <Route path="orders"    element={<AdminOrders />} />
          <Route path="orders/:id"element={<AdminOrderDetail />} />
          <Route path="cars"      element={<AdminCars />} />
          <Route path="cars/new"  element={<AdminCarForm />} />
          <Route path="cars/:id/edit" element={<AdminCarForm />} />
          <Route path="clients"   element={<AdminClients />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <MainLayout>
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--black)' }}>
              <div>
                <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 120, fontWeight: 900, color: '#132853', lineHeight: 1, letterSpacing: '-0.05em' }}>404</p>
                <h1 style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 32 }}>
                  {l==='fr'?'Page introuvable':l==='en'?'Page not found':l==='de'?'Seite nicht gefunden':l==='es'?'Página no encontrada':l==='it'?'Pagina non trovata':'Página não encontrada'}
                </h1>
                <a href="/" className="btn-primary" style={{ fontSize: 14, padding: '16px 40px' }}>
                  ← {l==='fr'?'Accueil':l==='en'?'Home':l==='de'?'Startseite':l==='es'?'Inicio':l==='it'?'Home':'Início'}
                </a>
              </div>
            </div>
          </MainLayout>
        }         />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
