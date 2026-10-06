import { useLangStore } from '../store';

const ARTICLES = [
  { id:1, date:'2026-10-01', icon:'🚗', title:{ fr:'5 conseils pour acheter une voiture d\'occasion en 2026', en:'5 tips for buying a used car in 2026', de:'5 Tipps für den Gebrauchtwagenkauf 2026' }, excerpt:{ fr:'Historique, kilométrage, état général, garantie, financement — les points clés avant d\'acheter.', en:'History, mileage, condition, warranty, financing — key points before buying.', de:'Historie, Kilometerstand, Zustand, Garantie, Finanzierung — die wichtigsten Punkte.' } },
  { id:2, date:'2026-09-18', icon:'⛽', title:{ fr:'Essence ou électrique : que choisir en 2026 ?', en:'Petrol or electric: what to choose in 2026?', de:'Benzin oder Elektro: Was lohnt sich 2026?' }, excerpt:{ fr:'Coûts d\'usage, autonomie, recharge et valeur à terme : notre comparatif.', en:'Running costs, range, charging and future value: our comparison.', de:'Unterhaltskosten, Reichweite, Laden und Wiederverkaufswert.' } },
  { id:3, date:'2026-08-30', icon:'🛠️', title:{ fr:'Entretien avant l\'hiver : la check-list complète', en:'Pre-winter maintenance checklist', de:'Wartung vor dem Winter: komplette Checkliste' }, excerpt:{ fr:'Pneus, batterie, antigel, éclairage — tout vérifier avant les premiers froids.', en:'Tires, battery, antifreeze, lights — check everything before the cold season.', de:'Reifen, Batterie, Frostschutz, Beleuchtung — vor dem Winter prüfen.' } },
];

export default function Blog() {
  const { lang } = useLangStore();
  const l = lang || 'fr';
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ padding:'52px 6% 32px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="section-eyebrow">{l==='fr'?'Actualités':l==='en'?'News':'News'}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)' }}>
            {l==='fr'?'Blog & conseils automobiles':l==='en'?'Blog & car advice':l==='de'?'Blog & Auto-Tipps':'Blog y consejos de coche'}
          </h1>
        </div>
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 6% 80px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {ARTICLES.map(a => (
          <article key={a.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:24, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>{a.icon}</div>
            <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:6 }}>{new Date(a.date).toLocaleDateString(l==='fr'?'fr-FR':l==='de'?'de-DE':'en-GB')}</p>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:19, color:'var(--text)', marginBottom:8, lineHeight:1.25 }}>{a.title[l] || a.title.fr}</h2>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{a.excerpt[l] || a.excerpt.fr}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
