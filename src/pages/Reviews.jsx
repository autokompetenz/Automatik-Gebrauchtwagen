import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLangStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ALL_REVIEWS } from '../utils/reviews';

function Stars({ n = 5 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#FFAA00' : 'var(--border-2)', fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

const LABELS = {
  eyebrow:   { fr: 'AVIS CLIENTS',          en: 'CUSTOMER REVIEWS',       de: 'KUNDENSTIMMEN',        es: 'OPINIONES',              it: 'RECENSIONI',              pt: 'AVALIAÇÕES' },
  title:     { fr: 'Ce que disent\nnos clients', en: 'What our\ncustomers say', de: 'Was unsere Kunden\nsagen', es: 'Lo que dicen\nnuestros clientes', it: 'Cosa dicono\ni nostri clienti', pt: 'O que dizem\nnosssos clientes' },
  subtitle:  { fr: '30 avis vérifiés de clients satisfaits à travers toute l\'Europe.', en: '30 verified reviews from satisfied customers across Europe.', de: '30 verifizierte Bewertungen von zufriedenen Kunden in ganz Europa.', es: '30 opiniones verificadas de clientes satisfechos de toda Europa.', it: '30 recensioni verificate da clienti soddisfatti in tutta Europa.', pt: '30 avaliações verificadas de clientes satisfeitos em toda a Europa.' },
  stat_avg:  { fr: 'Note moyenne',          en: 'Average rating',         de: 'Durchschnitt',         es: 'Nota media',             it: 'Voto medio',              pt: 'Nota média' },
  stat_total:{ fr: 'Avis vérifiés',         en: 'Verified reviews',       de: 'Bewertungen',          es: 'Opiniones',              it: 'Recensioni',              pt: 'Avaliações' },
  stat_sat:  { fr: 'Clients satisfaits',    en: 'Satisfied customers',    de: 'Zufriedene Kunden',    es: 'Clientes satisfechos',   it: 'Clienti soddisfatti',     pt: 'Clientes satisfeitos' },
  filter_all:{ fr: 'Tous',                  en: 'All',                    de: 'Alle',                 es: 'Todos',                  it: 'Tutti',                   pt: 'Todos' },
  verified:  { fr: 'Vérifié',              en: 'Verified',               de: 'Verifiziert',          es: 'Verificado',             it: 'Verificato',              pt: 'Verificado' },
};

function g(key, lang) {
  return LABELS[key]?.[lang] || LABELS[key]?.fr || '';
}

export default function Reviews() {
  const { lang: l } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const [filter, setFilter] = useState('all');

  const getReviewText = (r) => {
    const key = `text${l.charAt(0).toUpperCase() + l.slice(1)}`;
    return r[key] || r.textFr;
  };

  const filtered = filter === 'all'
    ? ALL_REVIEWS
    : ALL_REVIEWS.filter(r => r.rating === Number(filter));

  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(300px, 1fr))';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <section
        className="section-pad"
        style={{ background: 'linear-gradient(135deg, var(--bg-card2) 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="section-eyebrow"
              style={{ justifyContent: 'center', marginBottom: 16 }}
            >
              {g('eyebrow', l)}
            </div>

            <h1
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(28px, 5vw, 56px)',
                color: 'var(--text)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 20,
                whiteSpace: 'pre-line',
              }}
            >
              {g('title', l)}
            </h1>

            {/* Star summary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text)' }}>4.9</span>
              <Stars n={5} />
              <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600 }}>
                ({l === 'fr' ? '30 avis' : l === 'en' ? '30 reviews' : l === 'de' ? '30 Bewertungen' : l === 'es' ? '30 opiniones' : l === 'it' ? '30 recensioni' : '30 avaliações'})
              </span>
            </div>

            <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
              {g('subtitle', l)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px', display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 64, flexWrap: 'wrap' }}>
          {[
            { value: '4.9★', label: g('stat_avg', l) },
            { value: '30',   label: g('stat_total', l) },
            { value: '98%',  label: g('stat_sat', l) },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: isMobile ? 26 : 32, color: '#132853', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FILTER + GRID ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Filter pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: g('filter_all', l) },
              { key: '5',   label: '5★' },
              { key: '4',   label: '4★' },
            ].map(pill => (
              <button
                key={pill.key}
                onClick={() => setFilter(pill.key)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 100,
                  border: '1.5px solid',
                  borderColor: filter === pill.key ? '#132853' : 'var(--border)',
                  background: filter === pill.key ? '#132853' : 'var(--bg-card)',
                  color: filter === pill.key ? '#fff' : 'var(--text-2)',
                  fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Reviews grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: isMobile ? 14 : 20,
            }}
          >
            {filtered.map((r, i) => (
              <motion.div
                key={r.name + i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.07, duration: 0.45 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: isMobile ? 20 : 24,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0E1E3D, #132853)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      color: '#fff',
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {r.avatar}
                  </div>

                  {/* Name + stars */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stars n={r.rating} />
                      <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{r.date}</span>
                    </div>
                  </div>

                  {/* Verified badge */}
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.25)',
                      color: 'var(--green)',
                      padding: '3px 9px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ {g('verified', l)}
                  </span>
                </div>

                {/* Review text */}
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, flex: 1 }}>
                  "{getReviewText(r)}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
