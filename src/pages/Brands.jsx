import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';
import { BRANDS } from '../utils/brands';
import BrandLogo from '../components/BrandLogo';

export default function Brands() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const C = {
    bg: '#f5f5f5',
    card: '#ffffff',
    card2: '#ececec',
    border: 'rgba(0,0,0,0.1)',
    text: '#111111',
    text2: '#444444',
    text3: '#888888',
    red: '#132853',
    shadow: '0 4px 24px rgba(0,0,0,0.08)',
  };

  const t = (obj) => obj[l] || obj.fr;

  const brands = BRANDS;

  const featured = brands.slice(0, 10);

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>

      {/* Hero */}
      <section style={{
        position:'relative', height: isMobile ? '50vh' : '55vh', minHeight:380,
        display:'flex', alignItems:'center', overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <motion.div
          initial={{ opacity:0, scale:1.1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.2 }}
          style={{
            position:'absolute', inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1800&q=80)',
            backgroundSize:'cover', backgroundPosition:'center', opacity:0.2
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />

        <motion.div
          initial={{ opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:0.2 }}
          style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:900 }}
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(19,40,83,0.3)', border:'1px solid rgba(19,40,83,0.5)', borderRadius:4, padding:'8px 18px', marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#132853', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>
              {t({ fr:'Marques', en:'Brands', de:'Marken', es:'Marcas', it:'Marchi', pt:'Marcas', ro:'Mărci' })}
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)',
            color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20
          }}>
            {t({ fr:'Toutes les\nmarques', en:'All\nbrands', de:'Alle\nMarken', es:'Todas las\nmarcas', it:'Tutti i\nmarchi', pt:'Todas as\nmarcas', ro:'Toate\nmărcile' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Cliquez sur une marque pour découvrir tous les modèles disponibles dans notre catalogue.', en:'Click on a brand to discover all available models in our catalog.', de:'Klicken Sie auf eine Marke, um alle verfügbaren Modelle in unserem Katalog zu sehen.', es:'Haga clic en una marca para descubrir todos los modelos disponibles.', it:'Cliccate su un marchio per scoprire tutti i modelli disponibili.', pt:'Clique numa marca para descobrir todos os modelos disponíveis.', ro:'Faceți clic pe o marcă pentru a descoperi toate modelele disponibile în catalogul nostru.' })}
          </p>
        </motion.div>
      </section>

      {/* Featured brands */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Marques populaires', en:'Popular brands', de:'Beliebte Marken', es:'Marcas populares', it:'Marchi popolari', pt:'Marcas populares', ro:'Mărci populare' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Nos marques phares', en:'Our flagship brands', de:'Unsere Top-Marken', es:'Nuestras marcas principales', it:'I nostri marchi di punta', pt:'As nossas marcas principais', ro:'Mărcile noastre de top' })}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: isMobile ? 14 : 20 }}>
            {featured.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.06 }}
              >
                <Link to={`/catalog?brand=${encodeURIComponent(b.name)}`} style={{ textDecoration:'none' }}>
                  <div style={{
                    background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:'34px 16px',
                    boxShadow:C.shadow, textAlign:'center', transition:'all 0.3s', height:'100%'
                  }}>
                    <div style={{ margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', minHeight:40 }}>
                      <BrandLogo brand={b} height={isMobile ? 30 : 36} />
                    </div>
                    <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:C.text }}>{b.name}</div>
                    <div style={{ fontSize:12, color:C.text3, marginTop:6, fontWeight:600 }}>
                      {t({ fr:'Voir les modèles', en:'View models', de:'Modelle ansehen', es:'Ver modelos', it:'Vedi i modelli', pt:'Ver modelos', ro:'Vezi modelele' })} →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All brands */}
      <section className="section-pad" style={{ background:C.card }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Catalogue complet', en:'Full catalog', de:'Vollständiger Katalog', es:'Catálogo completo', it:'Catalogo completo', pt:'Catálogo completo', ro:'Catalog complet' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Toutes les marques disponibles', en:'All available brands', de:'Alle verfügbaren Marken', es:'Todas las marcas disponibles', it:'Tutti i marchi disponibili', pt:'Todas as marcas disponíveis', ro:'Toate mărcile disponibile' })}
            </h2>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:14 }}>
            {brands.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, scale:0.9 }}
                whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }}
                transition={{ duration:0.4, delay:(i%10)*0.04 }}
              >
                <Link to={`/catalog?brand=${encodeURIComponent(b.name)}`} style={{ textDecoration:'none' }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:10, background:C.bg, border:`1px solid ${C.border}`,
                    borderRadius:12, padding:'10px 18px', transition:'all 0.25s', cursor:'pointer'
                  }}>
                    <BrandLogo brand={b} height={20} width={24} style={{ flexShrink:0, margin:0 }} />
                    <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:14, color:C.text }}>{b.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.5 }}
            style={{ textAlign:'center', marginTop:48 }}
          >
            <Link to="/catalog" style={{
              background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px',
              borderRadius:8, display:'inline-flex', alignItems:'center', gap:8,
              boxShadow:'0 4px 16px rgba(19,40,83,0.4)'
            }}>
              {t({ fr:'Voir tout le catalogue', en:'View full catalog', de:'Zum kompletten Katalog', es:'Ver catálogo completo', it:'Vedi catalogo completo', pt:'Ver catálogo completo', ro:'Vezi tot catalogul' })} →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <motion.div
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.5 }}
          style={{ maxWidth:1200, margin:'0 auto', background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderRadius:20, padding: isMobile ? 32 : 48, textAlign:'center' }}
        >
          <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 24 : 30, color:'#fff', marginBottom:12 }}>
            {t({ fr:'Vous ne trouvez pas votre marque ?', en:'Can\'t find your brand?', de:'Ihre Marke ist nicht dabei?', es:'¿No encuentra su marca?', it:'Non trovate il vostro marchio?', pt:'Não encontra a sua marca?', ro:'Nu găsiți marca dumneavoastră?' })}
          </h2>
          <p style={{ fontSize:14.5, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, margin:'0 auto 24px' }}>
            {t({ fr:'Contactez-nous, nous pouvons commander le véhicule de vos rêves sur demande.', en:'Contact us, we can order the vehicle of your dreams on request.', de:'Kontaktieren Sie uns, wir können Ihr Traumfahrzeug auf Anfrage besorgen.', es:'Contáctenos, podemos pedir el vehículo de sus sueños.', it:'Contattateci, possiamo ordinare il veicolo dei vostri sogni.', pt:'Contacte-nos, podemos encomendar o veículo dos seus sonhos.', ro:'Contactați-ne, putem comanda vehiculul visurilor dumneavoastră la cerere.' })}
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/contact" style={{
              background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8
            }}>
              {t({ fr:'Nous contacter', en:'Contact us', de:'Kontakt', es:'Contáctenos', it:'Contattaci', pt:'Fale connosco', ro:'Contactați-ne' })} →
            </Link>
            <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer" style={{
              background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8
            }}>
              💬 WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
