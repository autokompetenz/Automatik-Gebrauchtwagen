import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function Insurance() {
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

  const getText = (obj) => obj[l] || obj.fr;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>
      <section style={{ position:'relative', height: isMobile ? '60vh' : '70vh', display:'flex', alignItems:'center', background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:900 }}>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 48 : 72, color:'#fff', lineHeight:1.1, marginBottom:20 }}>
            {getText({ fr:'Assurances Véhicules', en:'Vehicle Insurance', de:'Fahrzeugversicherung', es:'Seguros de Vehículos', it:'Assicurazioni Veicoli' })}
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', marginBottom:32, maxWidth:600 }}>
            {getText({ fr:'Solutions d\'assurance complètes pour protéger votre véhicule.', en:'Complete insurance solutions to protect your vehicle.', de:'Umfassende Versicherungslösungen zum Schutz Ihres Fahrzeugs.' })}
          </p>
          <Link to="/catalog" style={{ background:'#132853', color:'#fff', textDecoration:'none', padding:'14px 28px', borderRadius:8, fontWeight:700 }}>
            {getText({ fr:'Voir les véhicules', en:'View vehicles', de:'Fahrzeuge ansehen' })} →
          </Link>
        </motion.div>
      </section>

      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:42, color:C.text, marginBottom:40, textAlign:'center' }}>
            {getText({ fr:'Types de Couverture', en:'Coverage Types', de:'Versicherungsarten' })}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:24 }}>
            {[
              { title:getText({ fr:'Responsabilité Civile', en:'Third Party Liability', de:'Haftpflicht' }), icon:'📋' },
              { title:getText({ fr:'Tous Risques', en:'Comprehensive', de:'Vollkasko' }), icon:'🛡️' },
              { title:getText({ fr:'Intermédiaire', en:'Third Party Fire & Theft', de:'Teilkasko' }), icon:'⚖️' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, boxShadow:C.shadow }}>
                <div style={{ fontSize:40, marginBottom:16 }}>{item.icon}</div>
                <h3 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:12 }}>{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:C.card2, padding:isMobile ? 48 : 72 }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:36, color:C.text, marginBottom:20 }}>
            {getText({ fr:'Besoin d\'un devis?', en:'Need a quote?', de:'Angebot benötigt?' })}
          </h2>
          <a href="https://wa.me/491630436338" target="_blank" style={{ background:'#25D366', color:'#fff', textDecoration:'none', padding:'14px 28px', borderRadius:8, fontWeight:700, display:'inline-flex', alignItems:'center', gap:8 }}>
            💬 WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
