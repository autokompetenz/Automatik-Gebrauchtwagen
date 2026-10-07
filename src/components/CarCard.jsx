import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEuro } from '../utils/helpers';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';
import { t } from '../utils/i18n';

export default function CarCard({ car, index = 0 }) {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/commander/${car.id}`);
  };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:index*0.08, duration:0.6, ease:[0.16,1,0.3,1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="car-card"
      style={{
        background:'var(--bg-card)', borderRadius:12, overflow:'hidden',
        border:`1px solid ${hovered?'rgba(19,40,83,0.15)':'var(--border)'}`,
        transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform:hovered?'translateY(-3px)':'translateY(0)',
        boxShadow:hovered?'0 12px 40px rgba(0,0,0,0.08)':'var(--shadow-sm)',
      }}>

      {/* Image */}
      <Link to={`/cars/${car.id}`} style={{ display:'block', position:'relative', overflow:'hidden' }}>
        <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=70'}
          alt={`${car.make} ${car.model}`}
          className="car-img-zoom"
          style={{ width:'100%', height:220, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 50%)' }} />

        {/* Badges — top left */}
        <div style={{ position:'absolute', top:14, left:14, display:'flex', gap:6 }}>
          {car.featured && (
            <span style={{ background:'rgba(19,40,83,0.9)', backdropFilter:'blur(8px)', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 12px', borderRadius:4 }}>
              ★ {l==='fr'?'À la une':l==='en'?'Featured':l==='de'?'Empfohlen':l==='es'?'Destacado':l==='it'?'In evidenza':'Destacado'}
            </span>
          )}
          {car.promotional && (
            <span style={{ background:'rgba(255,140,0,0.9)', backdropFilter:'blur(8px)', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 12px', borderRadius:4 }}>
              {l==='fr'?'Promo':l==='en'?'Sale':l==='de'?'Aktion':l==='es'?'Oferta':l==='it'?'Promo':'Promoção'}
            </span>
          )}
        </div>

        {/* Category — top right */}
        <span style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.85)', fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 12px', borderRadius:4 }}>
          {car.category}
        </span>

        {/* Hover overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:hovered?1:0, transition:'opacity 0.3s', background:'rgba(0,0,0,0.15)' }}>
          <span style={{ background:'rgba(255,255,255,0.95)', color:'#111', padding:'10px 28px', borderRadius:6, fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', transform:hovered?'translateY(0)':'translateY(8px)', transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
            {t('view_vehicle', l)} →
          </span>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:'20px 22px 24px' }}>
        <Link to={`/cars/${car.id}`} style={{ textDecoration:'none' }}>
          <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:19, color:'var(--text)', letterSpacing:'-0.015em', marginBottom:4, lineHeight:1.15, transition:'color 0.25s' }}
            onMouseOver={e=>e.target.style.color='var(--red)'} onMouseOut={e=>e.target.style.color='var(--text)'}>
            {car.make} {car.model}
          </h3>
        </Link>
        <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:16, fontWeight:400, letterSpacing:'0.01em' }}>
          {car.year} · {car.fuelType} · {car.transmission}
        </p>

        {/* Price row */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, paddingTop:16, borderTop:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:24, color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1 }}>
              {formatEuro(car.price)}
            </div>
            {car.monthlyPayment && (
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4, fontWeight:400 }}>
                {t('or', l)} {formatEuro(car.monthlyPayment)}{t('per_month', l)}
                <span style={{ opacity:0.7 }}> ({l==='fr'?'ap. acompte 25%':l==='en'?'after 25% dep.':l==='de'?'n. 25% Anzahlung':'tras señal 25%'})</span>
              </div>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={adding}
            style={{ padding:'10px 18px', borderRadius:8, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', border:'1px solid', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", transition:'all 0.3s', borderColor:'var(--red)', background:adding?'rgba(19,40,83,0.08)':'transparent', color:'var(--red)', flexShrink:0 }}
            onMouseOver={e=>{ if(!adding) { e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='#fff'; }}}
            onMouseOut={e=>{ if(!adding) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--red)'; }}}>
            {adding?'...':(l==='fr'?'Commander':l==='en'?'Order':l==='de'?'Bestellen':'Pedir')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
