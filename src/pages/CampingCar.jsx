import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { carAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';

const LABELS = {
  fr: { title: 'Camping Cars', sub: 'Découvrez notre sélection de camping cars disponibles à la vente.', found: 'véhicule(s) trouvé(s)', empty: 'Aucun camping car disponible pour le moment.', back: '← Retour au catalogue' },
  en: { title: 'Motorhomes', sub: 'Discover our selection of motorhomes available for sale.', found: 'vehicle(s) found', empty: 'No motorhome available at the moment.', back: '← Back to catalogue' },
  de: { title: 'Wohnmobile', sub: 'Entdecken Sie unsere Auswahl an Wohnmobilen.', found: 'Fahrzeug(e) gefunden', empty: 'Derzeit kein Wohnmobil verfügbar.', back: '← Zurück zum Katalog' },
  es: { title: 'Autocaravanas', sub: 'Descubra nuestra selección de autocaravanas disponibles.', found: 'vehículo(s) encontrado(s)', empty: 'No hay autocaravanas disponibles.', back: '← Volver al catálogo' },
  it: { title: 'Camper', sub: 'Scopri la nostra selezione di camper disponibili.', found: 'veicolo/i trovato/i', empty: 'Nessun camper disponibile al momento.', back: '← Torna al catalogo' },
  pt: { title: 'Autocaravanas', sub: 'Descubra a nossa seleção de autocaravanas disponíveis.', found: 'veículo(s) encontrado(s)', empty: 'Nenhuma autocaravana disponível de momento.', back: '← Voltar ao catálogo' },
  ar: { title: 'المركبات المنزلية', sub: 'اكتشف مجموعتنا من المركبات المنزلية المتاحة للبيع.', found: 'مركبة مُوجدة', empty: 'لا توجد مركبات منزلية متاحة حاليًا.', back: '← العودة إلى الكتالوج' },
};

export default function CampingCar() {
  const [cars, setCars]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    setLoading(true);
    carAPI.getAll({ campingCar: 'true' })
      .then(r => { setCars(r.data.cars || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 72 }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)', padding: isMobile ? '36px 4% 28px' : '52px 6% 36px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--red)', fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
            CAMPING CAR
          </div>
          <h1 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 'clamp(30px,5vw,64px)', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            {l.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-3)', maxWidth: 560 }}>
            {l.sub}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '20px 4%' : '40px 6%' }}>
        {/* Count */}
        {!loading && (
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{total}</span> {l.found}
          </p>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader />
          </div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚐</div>
            <h3 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>
              {l.empty}
            </h3>
            <a href="/catalog" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>
              {l.back}
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(270px,1fr))', gap: isMobile ? 14 : 22 }}>
            <AnimatePresence>
              {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
