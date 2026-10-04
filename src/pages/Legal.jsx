import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';

const LEGAL_PAGES = {
  '/mentions-legales': {
    fr: { title: 'Mentions Légales', content: `
<h2>Éditeur du site</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>
Franz-Julius-Haenel-Str. 3<br/>
06618 Naumburg, Allemagne<br/>
N° registre : DEW1215.HRB207153<br/>
Capital social : 230.000,00 €</p>
<h2>Forme juridique</h2>
<p>Gesellschaft mit beschränkter Haftung (GmbH) — société à responsabilité limitée de droit allemand.</p>
<h2>Dirigeant</h2>
<p>Ronny Reinsberger, Geschäftsführer (Gérant / Directeur).</p>
<h2>Activité</h2>
<p>Commerce de gros et de détail de pièces automobiles et d'accessoires pour véhicules automobiles de toutes sortes. Commerce de véhicules automobiles neufs et d'occasion. Location de véhicules.</p>
<h2>Hébergement</h2>
<p>Vercel Inc., 340 Pine Street, San Francisco, CA 94104, USA.<br/>Base de données : Supabase Inc., Singapore.</p>
<h2>Propriété intellectuelle</h2>
<p>Tout le contenu est la propriété exclusive d'Automatik Gebrauchtwagen. Reproduction interdite sans autorisation.</p>
<h2>Droit applicable</h2>
<p>Droit allemand (TMG). Juridiction compétente : Naumburg.</p>` },
    en: { title: 'Legal Notice', content: `
<h2>Publisher</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg, Germany<br/>Reg. No.: DEW1215.HRB207153 — Share capital: €230,000.00</p>
<h2>Managing Director</h2>
<p>Ronny Reinsberger, Geschäftsführer.</p>
<h2>Business Activity</h2>
<p>Wholesale and retail of car parts and accessories. Trade in new and used vehicles. Vehicle rental.</p>
<h2>Hosting</h2>
<p>Vercel Inc., San Francisco, USA. Database: Supabase Inc., Singapore.</p>
<h2>Applicable Law</h2>
<p>German law (TMG). Courts of Naumburg.</p>` },
    de: { title: 'Impressum', content: `
<h2>Angaben gemäß § 5 TMG</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg<br/>HRB 207153 — Stammkapital: 230.000,00 €</p>
<h2>Geschäftsführer</h2>
<p>Ronny Reinsberger</p>
<h2>Tätigkeit</h2>
<p>Groß- und Einzelhandel mit Kraftfahrzeugteilen und Kraftfahrzeugzubehör aller Art. Handel mit neuen und gebrauchten Kraftfahrzeugen und Vermietung.</p>
<h2>Hosting</h2>
<p>Vercel Inc., San Francisco, USA. Datenbank: Supabase Inc., Singapur.</p>
<h2>Gerichtsstand</h2>
<p>Deutsches Recht. Gerichtsstand: Naumburg.</p>` },
    es: { title: 'Aviso Legal', content: `
<h2>Editor</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg, Alemania<br/>Reg. No.: DEW1215.HRB207153 — Capital social: 230.000,00 €</p>
<h2>Director</h2>
<p>Ronny Reinsberger, Geschäftsführer.</p>
<h2>Actividad</h2>
<p>Comercio al por mayor y al por menor de piezas y accesorios automovilísticos. Comercio de vehículos nuevos y usados. Alquiler de vehículos.</p>
<h2>Alojamiento</h2>
<p>Vercel Inc., San Francisco, EE.UU. Base de datos: Supabase Inc., Singapur.</p>
<h2>Ley aplicable</h2>
<p>Derecho alemán (TMG). Tribunales de Naumburg.</p>` },
    it: { title: 'Note Legali', content: `
<h2>Editore</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg, Germania<br/>Reg. No.: DEW1215.HRB207153 — Capitale sociale: 230.000,00 €</p>
<h2>Amministratore</h2>
<p>Ronny Reinsberger, Geschäftsführer.</p>
<h2>Attività</h2>
<p>Commercio all'ingrosso e al dettaglio di ricambi e accessori automobilistici. Commercio di veicoli nuovi e usati. Noleggio veicoli.</p>
<h2>Hosting</h2>
<p>Vercel Inc., San Francisco, USA. Database: Supabase Inc., Singapore.</p>
<h2>Legge applicabile</h2>
<p>Diritto tedesco (TMG). Tribunali di Naumburg.</p>` },
    pt: { title: 'Aviso Legal', content: `
<h2>Editor</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg, Alemanha<br/>Reg. No.: DEW1215.HRB207153 — Capital social: 230.000,00 €</p>
<h2>Diretor</h2>
<p>Ronny Reinsberger, Geschäftsführer.</p>
<h2>Atividade</h2>
<p>Comércio por grosso e a retalho de peças e acessórios automóveis. Comércio de veículos novos e usados. Aluguer de veículos.</p>
<h2>Hospedagem</h2>
<p>Vercel Inc., São Francisco, EUA. Base de dados: Supabase Inc., Singapura.</p>
<h2>Lei aplicável</h2>
<p>Direito alemão (TMG). Tribunais de Naumburg.</p>` },
    ro: { title: 'Informații Legale', content: `
<h2>Editor</h2>
<p><strong>Automatik Gebrauchtwagen</strong><br/>Franz-Julius-Haenel-Str. 3, 06618 Naumburg, Germania<br/>Nr. registru: DEW1215.HRB207153 — Capital social: 230.000,00 €</p>
<h2>Formă juridică</h2>
<p>Gesellschaft mit beschränkter Haftung (GmbH) — societate cu răspundere limitată de drept german.</p>
<h2>Director general</h2>
<p>Ronny Reinsberger, Geschäftsführer.</p>
<h2>Activitate</h2>
<p>Comerț cu ridicata și cu amănuntul de piese și accesorii auto. Comerț cu vehicule noi și second-hand. Închiriere de vehicule.</p>
<h2>Găzduire</h2>
<p>Vercel Inc., San Francisco, SUA. Bază de date: Supabase Inc., Singapore.</p>
<h2>Drept aplicabil</h2>
<p>Dreptul german (TMG). Instanțe competente: Naumburg.</p>` },
  },

  '/politique-confidentialite': {
    fr: { title: 'Politique de Confidentialité', content: `
<h2>1. Responsable du traitement</h2>
<p>Automatik Gebrauchtwagen, Franz-Julius-Haenel-Str. 3, 06618 Naumburg — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Données collectées</h2>
<ul><li>Nom, prénom, email, téléphone, adresse</li><li>Salaire mensuel (simulation financement)</li><li>Historique des commandes</li></ul>
<h2>3. Base légale (RGPD)</h2>
<ul><li>Exécution du contrat — Art. 6(1)(b)</li><li>Consentement — Art. 6(1)(a)</li><li>Intérêt légitime — Art. 6(1)(f)</li></ul>
<h2>4. Vos droits</h2>
<p>Accès, rectification, effacement, portabilité, opposition. Contact : kontakt@automatikgebrauchtwagen.com</p>
<h2>5. Sécurité</h2>
<p>Mots de passe chiffrés (bcrypt), JWT avec expiration, connexions HTTPS.</p>` },
    en: { title: 'Privacy Policy', content: `
<h2>1. Data Controller</h2>
<p>Automatik Gebrauchtwagen, Franz-Julius-Haenel-Str. 3, 06618 Naumburg — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Data Collected</h2>
<ul><li>Name, email, phone, address</li><li>Monthly salary (financing simulation)</li><li>Order history</li></ul>
<h2>3. Legal Basis (GDPR)</h2>
<ul><li>Contract performance — Art. 6(1)(b)</li><li>Consent — Art. 6(1)(a)</li><li>Legitimate interest — Art. 6(1)(f)</li></ul>
<h2>4. Your Rights</h2>
<p>Access, rectify, erase, port, object. Contact: kontakt@automatikgebrauchtwagen.com</p>` },
    de: { title: 'Datenschutzerklärung', content: `
<h2>1. Verantwortlicher</h2>
<p>Automatik Gebrauchtwagen, Franz-Julius-Haenel-Str. 3, 06618 Naumburg — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Erhobene Daten</h2>
<ul><li>Name, E-Mail, Telefon, Adresse</li><li>Monatsgehalt (Finanzierungssimulation)</li><li>Bestellhistorie</li></ul>
<h2>3. Rechtsgrundlage (DSGVO)</h2>
<ul><li>Vertragserfüllung — Art. 6 Abs. 1 lit. b</li><li>Einwilligung — Art. 6 Abs. 1 lit. a</li></ul>
<h2>4. Ihre Rechte</h2>
<p>Auskunft, Berichtigung, Löschung, Widerspruch. Kontakt: kontakt@automatikgebrauchtwagen.com</p>` },
    es: { title: 'Política de Privacidad', content: `
<h2>1. Responsable</h2>
<p>Automatik Gebrauchtwagen — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Datos recopilados</h2>
<ul><li>Nombre, email, teléfono, dirección</li><li>Salario mensual (simulación)</li><li>Historial de pedidos</li></ul>
<h2>3. Sus derechos (RGPD)</h2>
<p>Acceso, rectificación, supresión, portabilidad, oposición. Contacto: kontakt@automatikgebrauchtwagen.com</p>` },
    it: { title: 'Informativa sulla Privacy', content: `
<h2>1. Titolare del trattamento</h2>
<p>Automatik Gebrauchtwagen — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Dati raccolti</h2>
<ul><li>Nome, email, telefono, indirizzo</li><li>Stipendio mensile (simulazione)</li><li>Storico ordini</li></ul>
<h2>3. I vostri diritti (GDPR)</h2>
<p>Accesso, rettifica, cancellazione, portabilità, opposizione. Contatto: kontakt@automatikgebrauchtwagen.com</p>` },
    pt: { title: 'Política de Privacidade', content: `
<h2>1. Responsável</h2>
<p>Automatik Gebrauchtwagen — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Dados recolhidos</h2>
<ul><li>Nome, email, telefone, endereço</li><li>Salário mensal (simulação)</li><li>Histórico de pedidos</li></ul>
<h2>3. Os seus direitos (RGPD)</h2>
<p>Acesso, retificação, eliminação, portabilidade, oposição. Contacto: kontakt@automatikgebrauchtwagen.com</p>` },
    ro: { title: 'Politica de Confidențialitate', content: `
<h2>1. Operatorul datelor</h2>
<p>Automatik Gebrauchtwagen — kontakt@automatikgebrauchtwagen.com</p>
<h2>2. Date colectate</h2>
<ul><li>Nume, prenume, email, telefon, adresă</li><li>Salariu lunar (simulare finanțare)</li><li>Istoricul comenzilor</li></ul>
<h2>3. Baza legală (GDPR)</h2>
<ul><li>Executarea contractului — Art. 6(1)(b)</li><li>Consimțământ — Art. 6(1)(a)</li><li>Interes legitim — Art. 6(1)(f)</li></ul>
<h2>4. Drepturile dvs.</h2>
<p>Acces, rectificare, ștergere, portabilitate, opoziție. Contact: kontakt@automatikgebrauchtwagen.com</p>
<h2>5. Securitate</h2>
<p>Parole criptate (bcrypt), JWT cu expirare, conexiuni HTTPS.</p>` },
  },

  '/cgv': {
    fr: { title: 'Conditions Générales de Vente', content: `
<h2>Article 1 — Objet</h2>
<p>Les présentes CGV régissent les relations entre Automatik Gebrauchtwagen et tout acheteur via le site.</p>
<h2>Article 2 — Prix</h2>
<p>Prix en Euros (€) TTC. Modifiables à tout moment.</p>
<h2>Article 3 — Paiement</h2>
<ul><li><strong>Intégral</strong> : remise de 5%</li><li><strong>Acompte 25%</strong> : solde à livraison</li><li><strong>Acompte 25% + Mensualités</strong> : 75% financé sur 60 mois à 6%/an</li></ul>
<h2>Article 4 — Rétractation</h2>
<p>14 jours à compter de la réception (directive 2011/83/UE).</p>
<h2>Article 5 — Droit applicable</h2>
<p>Droit allemand. Juridiction : Osnabrück.</p>` },
    en: { title: 'Terms and Conditions', content: `
<h2>Article 1 — Subject</h2>
<p>These T&Cs govern purchases from Automatik Gebrauchtwagen.</p>
<h2>Article 2 — Payment</h2>
<ul><li>Full payment: 5% discount</li><li>25% deposit: balance on delivery</li><li>25% deposit + Monthly: 75% financed over 60 instalments at 6%/year</li></ul>
<h2>Article 3 — Withdrawal</h2>
<p>14-day right of withdrawal (EU Directive 2011/83/EU).</p>
<h2>Article 4 — Applicable Law</h2>
<p>German law. Courts of Osnabrück.</p>` },
    de: { title: 'Allgemeine Geschäftsbedingungen', content: `
<h2>§ 1 Geltungsbereich</h2>
<p>Diese AGB gelten für alle Verträge mit Automatik Gebrauchtwagen.</p>
<h2>§ 2 Zahlung</h2>
<ul><li>Vollzahlung: 5% Rabatt</li><li>Anzahlung 25%: Rest bei Lieferung</li><li>Anzahlung 25% + Raten: 75% finanziert über 60 Monate, 6% p.a.</li></ul>
<h2>§ 3 Widerrufsrecht</h2>
<p>14 Tage Widerrufsrecht gemäß § 312g BGB.</p>
<h2>§ 4 Gerichtsstand</h2>
<p>Deutsches Recht. Gerichtsstand: Osnabrück.</p>` },
    es: { title: 'Condiciones Generales de Venta', content: `
<h2>Artículo 1 — Objeto</h2>
<p>Estas CGV rigen las compras a Automatik Gebrauchtwagen.</p>
<h2>Artículo 2 — Pago</h2>
<ul><li>Pago completo: 5% descuento</li><li>Señal 25%: resto en entrega</li><li>Cuotas: 60 meses al 6%/año</li></ul>
<h2>Artículo 3 — Desistimiento</h2>
<p>14 días desde la recepción (Directiva 2011/83/UE).</p>` },
    it: { title: 'Condizioni Generali di Vendita', content: `
<h2>Articolo 1 — Oggetto</h2>
<p>Le presenti CGV regolano gli acquisti da Automatik Gebrauchtwagen.</p>
<h2>Articolo 2 — Pagamento</h2>
<ul><li>Pagamento completo: 5% sconto</li><li>Acconto 25%: saldo alla consegna</li><li>Rate: 60 mesi al 6%/anno</li></ul>
<h2>Articolo 3 — Recesso</h2>
<p>14 giorni dalla ricezione (Direttiva 2011/83/UE).</p>` },
    pt: { title: 'Condições Gerais de Venda', content: `
<h2>Artigo 1 — Objeto</h2>
<p>Estas CGV regem as compras à Automatik Gebrauchtwagen.</p>
<h2>Artigo 2 — Pagamento</h2>
<ul><li>Pagamento integral: 5% desconto</li><li>Entrada 25%: saldo na entrega</li><li>Prestações: 60 meses a 6%/ano</li></ul>
<h2>Artigo 3 — Desistência</h2>
<p>14 dias a partir da receção (Diretiva 2011/83/UE).</p>` },
    ro: { title: 'Condiții Generale de Vânzare', content: `
<h2>Articolul 1 — Obiect</h2>
<p>Prezentele CGV reglementează achizițiile de la Automatik Gebrauchtwagen.</p>
<h2>Articolul 2 — Preț</h2>
<p>Prețuri în Euro (€) TVA inclus. Modificabile oricând.</p>
<h2>Articolul 3 — Plată</h2>
<ul><li><strong>Integral</strong>: reducere de 5%</li><li><strong>Acont 25%</strong>: restul la livrare</li><li><strong>Rate lunare</strong>: 60 de luni la 6%/an</li></ul>
<h2>Articolul 4 — Retractare</h2>
<p>14 zile de la primire (Directiva 2011/83/UE).</p>
<h2>Articolul 5 — Drept aplicabil</h2>
<p>Dreptul german. Instanțe: Osnabrück.</p>` },
  },

  '/cookies': {
    fr: { title: 'Politique de Cookies', content: `
<h2>Cookies utilisés</h2>
<ul>
<li><code>ak_token</code> — Authentification JWT (session)</li>
<li><code>ak_user</code> — Données utilisateur en cache (session)</li>
<li><code>ak_lang</code> — Préférence de langue (1 an)</li>
<li><code>ak_theme</code> — Préférence de thème (1 an)</li>
<li><code>ak_cookies</code> — Consentement cookies (1 an)</li>
</ul>
<h2>Gestion</h2>
<p>Via la bannière à la première visite ou via les paramètres de votre navigateur.</p>
<h2>Contact</h2>
<p>kontakt@automatikgebrauchtwagen.com</p>` },
    en: { title: 'Cookie Policy', content: `
<h2>Cookies used</h2>
<ul>
<li><code>ak_token</code> — JWT authentication (session)</li>
<li><code>ak_user</code> — Cached user data (session)</li>
<li><code>ak_lang</code> — Language preference (1 year)</li>
<li><code>ak_theme</code> — Theme preference (1 year)</li>
<li><code>ak_cookies</code> — Cookie consent (1 year)</li>
</ul>
<h2>Management</h2>
<p>Via the banner on first visit or browser settings.</p>` },
    de: { title: 'Cookie-Richtlinie', content: `
<h2>Verwendete Cookies</h2>
<ul>
<li><code>ak_token</code> — JWT-Authentifizierung (Sitzung)</li>
<li><code>ak_lang</code> — Spracheinstellung (1 Jahr)</li>
<li><code>ak_theme</code> — Theme-Einstellung (1 Jahr)</li>
<li><code>ak_cookies</code> — Cookie-Zustimmung (1 Jahr)</li>
</ul>
<h2>Verwaltung</h2>
<p>Über das Banner beim ersten Besuch oder Browsereinstellungen.</p>` },
    es: { title: 'Política de Cookies', content: `
<h2>Cookies utilizadas</h2>
<ul>
<li><code>ak_token</code> — Autenticación JWT (sesión)</li>
<li><code>ak_lang</code> — Preferencia de idioma (1 año)</li>
<li><code>ak_theme</code> — Preferencia de tema (1 año)</li>
<li><code>ak_cookies</code> — Consentimiento (1 año)</li>
</ul>
<h2>Gestión</h2>
<p>A través del banner en la primera visita o configuración del navegador.</p>` },
    it: { title: 'Politica sui Cookie', content: `
<h2>Cookie utilizzati</h2>
<ul>
<li><code>ak_token</code> — Autenticazione JWT (sessione)</li>
<li><code>ak_lang</code> — Preferenza lingua (1 anno)</li>
<li><code>ak_theme</code> — Preferenza tema (1 anno)</li>
<li><code>ak_cookies</code> — Consenso cookie (1 anno)</li>
</ul>
<h2>Gestione</h2>
<p>Tramite il banner alla prima visita o impostazioni del browser.</p>` },
    pt: { title: 'Política de Cookies', content: `
<h2>Cookies utilizados</h2>
<ul>
<li><code>ak_token</code> — Autenticação JWT (sessão)</li>
<li><code>ak_lang</code> — Preferência de idioma (1 ano)</li>
<li><code>ak_theme</code> — Preferência de tema (1 ano)</li>
<li><code>ak_cookies</code> — Consentimento (1 ano)</li>
</ul>
<h2>Gestão</h2>
<p>Através do banner na primeira visita ou configurações do browser.</p>` },
    ro: { title: 'Politica privind Cookie-urile', content: `
<h2>Cookie-uri utilizate</h2>
<ul>
<li><code>ak_token</code> — Autentificare JWT (sesiune)</li>
<li><code>ak_user</code> — Date utilizator în cache (sesiune)</li>
<li><code>ak_lang</code> — Preferință de limbă (1 an)</li>
<li><code>ak_theme</code> — Preferință de temă (1 an)</li>
<li><code>ak_cookies</code> — Consimțământ cookie (1 an)</li>
</ul>
<h2>Gestionare</h2>
<p>Prin banner la prima vizită sau prin setările browserului.</p>
<h2>Contact</h2>
<p>kontakt@automatikgebrauchtwagen.com</p>` },
  },
};

const LANG_LABELS = { fr:'🇫🇷 FR', en:'🇬🇧 EN', de:'🇩🇪 DE', es:'🇪🇸 ES', it:'🇮🇹 IT', pt:'🇵🇹 PT', ro:'🇷🇴 RO' };

export default function Legal() {
  const { lang, setLang } = useLangStore();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const page = LEGAL_PAGES[location.pathname];

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  if (!page) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:80, fontWeight:900, color:'var(--red)' }}>404</p>
        <Link to="/" className="btn-gold" style={{ marginTop:20 }}>Accueil</Link>
      </div>
    </div>
  );

  const content = page[lang] || page['fr'];
  const availableLangs = Object.keys(page);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop: isMobile ? 88 : 100 }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '28px 5% 32px' : '56px 6% 44px', borderBottom:'1px solid var(--border)', background:'var(--bg-card2)' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-3)', textDecoration:'none', marginBottom:20, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600 }}>
            ← {lang==='fr'?'Retour':lang==='en'?'Back':lang==='de'?'Zurück':lang==='es'?'Volver':lang==='it'?'Indietro':lang==='ro'?'Înapoi':'Voltar'}
          </Link>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,5vw,60px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:20 }}>
            {content.title}
          </h1>
          {/* Language switcher — only available langs for this page */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {availableLangs.map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", border:`1px solid ${l===lang?'var(--red)':'var(--border-2)'}`, background:l===lang?'var(--red-bg)':'transparent', color:l===lang?'var(--red)':'var(--text-3)', transition:'all 0.2s' }}>
                {LANG_LABELS[l] || l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:820, margin:'0 auto', padding: isMobile ? '28px 5% 60px' : '52px 6% 80px' }}>
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>

      <style>{`
        [dangerouslySetInnerHTML] h2, div > div h2 { color: var(--text) !important; }
        .legal-body h2 { color: var(--text); font-size: ${isMobile?'18px':'22px'}; font-weight: 800; margin: 32px 0 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .legal-body h3 { color: var(--text-2); font-size: ${isMobile?'16px':'18px'}; font-weight: 700; margin: 22px 0 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .legal-body p  { color: var(--text-2); font-size: ${isMobile?'15px':'16px'}; line-height: 1.8; margin-bottom: 14px; }
        .legal-body ul { padding-left: 22px; margin-bottom: 14px; }
        .legal-body li { color: var(--text-2); font-size: ${isMobile?'15px':'16px'}; line-height: 1.8; margin-bottom: 7px; }
        .legal-body strong { color: var(--text); }
        .legal-body em    { color: var(--text-3); }
        .legal-body code  { background: var(--red-bg); color: var(--red); padding: 2px 8px; border-radius: 4px; font-size: 13px; }
        .legal-body a     { color: var(--red); }
      `}</style>
    </div>
  );
}