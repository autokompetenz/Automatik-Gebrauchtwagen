import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { carAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars]             = useState([]);
  const [brands, setBrands]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const l = lang || 'fr';

  const brand    = searchParams.get('brand')    || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || '';
  const category = searchParams.get('category') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minYear  = searchParams.get('minYear')  || '';
  const maxYear  = searchParams.get('maxYear')  || '';
  const maxMileage = searchParams.get('maxMileage') || '';

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (brand) params.brand = brand;
      if (search) params.search = search;
      if (sort)   params.sort   = sort;
      if (category) params.category = category;
      if (fuelType) params.fuelType = fuelType;
      if (transmission) params.transmission = transmission;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minYear) params.minYear = minYear;
      if (maxYear) params.maxYear = maxYear;
      if (maxMileage) params.maxMileage = maxMileage;
      const { data } = await carAPI.getAll(params);
      setCars(data.cars || []);
      setTotal(data.total || 0);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [brand, search, sort, category, fuelType, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage]);

  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => {
    carAPI.getBrands().then(r => setBrands(r.data.brands || [])).catch(console.error);
  }, []);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
    if (isMobile) setDrawerOpen(false);
  };

  const resetAll = () => { setSearchParams({}); setDrawerOpen(false); };

  const SortSelect = () => (
    <select value={sort} onChange={e => setFilter('sort', e.target.value)}
      className="input-luxury"
      style={{ fontSize:13, padding:'9px 14px', width:'auto', cursor:'pointer' }}>
      <option value="">{t('sort_by', l)}</option>
      <option value="price_asc">{t('sort_price_asc', l)}</option>
      <option value="price_desc">{t('sort_price_desc', l)}</option>
      <option value="newest">{t('sort_newest', l)}</option>
    </select>
  );

  const FilterSidebar = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {/* Search */}
      <input type="text" placeholder={t('search_ph', l)} value={search}
        onChange={e => setFilter('search', e.target.value)}
        className="input-luxury" style={{ fontSize:15, marginBottom:6 }} />

      {/* Brands */}
      {brands.length > 0 && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--red)', padding:'14px 16px 8px' }}>
            {l==='fr'?'MARQUE':l==='en'?'BRAND':l==='de'?'MARKE':l==='es'?'MARCA':l==='it'?'MARCA':'MARCA'}
          </p>
          <button onClick={() => setFilter('brand', '')}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:!brand?'var(--red-bg)':'transparent', border:'none', borderLeft:`3px solid ${!brand?'var(--red)':'transparent'}`, color:!brand?'var(--red)':'var(--text-3)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:!brand?700:400, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}
            onMouseOver={e=>{ if(brand){ e.currentTarget.style.background='var(--bg-card2)'; e.currentTarget.style.color='var(--text)'; } }}
            onMouseOut={e=>{ if(brand){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)'; } }}>
            <span>{l==='fr'?'Toutes les marques':l==='en'?'All brands':l==='de'?'Alle Marken':l==='es'?'Todas las marcas':l==='it'?'Tutte le marche':'Todas as marcas'}</span>
          </button>
          {brands.map(b => (
            <button key={b} onClick={() => setFilter('brand', brand===b?'':b)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:brand===b?'var(--red-bg)':'transparent', border:'none', borderLeft:`3px solid ${brand===b?'var(--red)':'transparent'}`, color:brand===b?'var(--red)':'var(--text-3)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:brand===b?700:400, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}
              onMouseOver={e=>{ if(brand!==b){ e.currentTarget.style.background='var(--bg-card2)'; e.currentTarget.style.color='var(--text)'; } }}
              onMouseOut={e=>{ if(brand!==b){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)'; } }}>
              <span>{b}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reset */}
      {(brand || search || sort) && (
        <button onClick={resetAll} style={{ width:'100%', padding:'10px', background:'rgba(19,40,83,0.06)', border:'1px solid var(--red-border)', borderRadius:8, color:'var(--red)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:13, fontWeight:700, cursor:'pointer' }}>
          ✕ {t('reset', l)}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      {/* Page header */}
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '36px 4% 28px' : '52px 6% 36px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div className="section-eyebrow">{t('catalog_title', l)}</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(30px,5vw,56px)', color:'var(--text)', letterSpacing:'-0.025em', marginBottom:10 }}>
            {t('catalog_title', l)}
          </h1>
          <p style={{ fontSize:16, color:'var(--text-3)', maxWidth:560 }}>
            {t('catalog_sub', l)}
          </p>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199, backdropFilter:'blur(4px)' }} />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:200, width:'80vw', maxWidth:320, background:'var(--bg-card)', boxShadow:'var(--shadow-xl)', padding:'24px 16px', overflowY:'auto', transform:drawerOpen?'translateX(0)':'translateX(-100%)', transition:'transform 0.3s var(--ease)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontWeight:700, fontSize:17, color:'var(--text)' }}>{t('filters', l)}</span>
            <button onClick={() => setDrawerOpen(false)} style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:8, width:34, height:34, cursor:'pointer', fontSize:16, color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <FilterSidebar />
        </div>
      )}

      <div style={{ maxWidth:1400, margin:'0 auto', padding: isMobile ? '20px 4%' : '40px 6%' }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <button onClick={() => setDrawerOpen(true)}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', color:'var(--text)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
              ⚙ {t('filters', l)} {(brand)&&`· ${brand||''}`}
            </button>
            <SortSelect />
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '200px 1fr' : '240px 1fr', gap: isMobile ? 0 : 40 }}>

          {/* Sidebar — desktop/tablet only */}
          {!isMobile && (
            <div style={{ position:'sticky', top:88, alignSelf:'start' }}>
              <FilterSidebar />
              <div style={{ marginTop:12 }}>
                <SortSelect />
              </div>
            </div>
          )}

          {/* Results */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ fontSize:14, color:'var(--text-3)' }}>
                <span style={{ color:'var(--red)', fontWeight:700 }}>{total}</span> {t('found', l)}
              </p>
              {!isMobile && (brand||search||sort) && (
                <button onClick={resetAll} style={{ fontSize:13, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:600, textDecoration:'underline' }}>
                  {t('reset', l)}
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Loader /></div>
            ) : cars.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:24, color:'var(--text)', marginBottom:10 }}>{t('no_results', l)}</h3>
                <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:24 }}>
                  {lang==='fr'?'Essayez une autre marque ou un autre terme.':lang==='en'?'Try another brand or term.':lang==='de'?'Versuchen Sie eine andere Marke oder einen anderen Begriff.':lang==='es'?'Pruebe otra marca u otro término.':lang==='it'?'Prova un\'altra marca o un altro termine.':'Tente outra marca ou outro termo.'}
                </p>
                <button onClick={resetAll} className="btn-primary">{t('reset', l)}</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(270px,1fr))', gap: isMobile ? 14 : 24 }}>
                <AnimatePresence>
                  {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
