import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function About() {
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

  const stats = [
    { icon: '🏛️', value: '1979', label: t({ fr:'Année de création', en:'Year of creation', de:'Gründungsjahr', es:'Año de creación', it:'Anno di creazione', pt:'Ano de criação', ro:'Anul înființării' }) },
    { icon: '💶', value: '230 000 €', label: t({ fr:'Capital social', en:'Share capital', de:'Stammkapital', es:'Capital social', it:'Capitale sociale', pt:'Capital social', ro:'Capital social' }) },
    { icon: '📍', value: 'Naumburg', label: t({ fr:'Siège social, Allemagne', en:'Headquarters, Germany', de:'Hauptsitz, Deutschland', es:'Sede central, Alemania', it:'Sede centrale, Germania', pt:'Sede, Alemanha', ro:'Sediu social, Germania' }) },
    { icon: '🌍', value: '7', label: t({ fr:'Langues parlées', en:'Languages spoken', de:'Gesprochene Sprachen', es:'Idiomas hablados', it:'Lingue parlate', pt:'Línguas faladas', ro:'Limbi vorbite' }) },
  ];

  const values = [
    { icon: '🛡️', title: t({ fr:'Fiabilité', en:'Reliability', de:'Zuverlässigkeit', es:'Fiabilidad', it:'Affidabilità', pt:'Fiabilidade', ro:'Fiabilitate' }),
      desc: t({ fr:'Chaque véhicule est inspecté à l\'atelier avant la vente. Notre réputation repose sur des véhicules vérifiés et honnêtement décrits.', en:'Every vehicle is inspected in the workshop before sale. Our reputation rests on verified, honestly described vehicles.', de:'Jedes Fahrzeug wird vor dem Verkauf in der Werkstatt geprüft. Unser Ruf basiert auf geprüften und ehrlich beschriebenen Fahrzeugen.', es:'Cada vehículo se inspecciona en el taller antes de la venta. Nuestra reputación se basa en vehículos verificados.', it:'Ogni veicolo viene ispezionato in officina prima della vendita. La nostra reputazione si basa su veicoli verificati.', pt:'Cada veículo é inspecionado na oficina antes da venda. A nossa reputação baseia-se em veículos verificados.', ro:'Fiecare vehicul este inspectat în atelier înainte de vânzare. Reputația noastră se bazează pe vehicule verificate și descrise cu sinceritate.' }) },
    { icon: '🤝', title: t({ fr:'Transparence', en:'Transparency', de:'Transparenz', es:'Transparencia', it:'Trasparenza', pt:'Transparência', ro:'Transparență' }),
      desc: t({ fr:'Prix affichés, historique du véhicule, garantie claire : aucune surprise, de la première visite à la remise des clés.', en:'Displayed prices, vehicle history, clear warranty: no surprises, from first visit to key handover.', de:'Angezeigte Preise, Fahrzeughistorie, klare Garantie: keine Überraschungen von der ersten Besichtigung bis zur Schlüsselübergabe.', es:'Precios claros, historial del vehículo, garantía clara: sin sorpresas.', it:'Prezzi esposti, storico del veicolo, garanzia chiara: nessuna sorpresa.', pt:'Preços claros, histórico do veículo, garantia clara: sem surpresas.', ro:'Prețuri afișate, istoric al vehiculului, garanție clară: nicio surpriză, de la prima vizită până la predarea cheilor.' }) },
    { icon: '🚚', title: t({ fr:'Livraison Europe', en:'Europe-wide delivery', de:'Lieferung in ganz Europa', es:'Entrega en Europa', it:'Consegna in Europa', pt:'Entrega na Europa', ro:'Livrare în Europa' }),
      desc: t({ fr:'Démarches administratives complètes et livraison en moyenne sous 48h dans toute l\'Europe.', en:'Complete administrative formalities and delivery within 48h on average across Europe.', de:'Komplette Formalitäten und Lieferung im Schnitt in 48h in ganz Europa.', es:'Trámites completos y entrega en 48h en toda Europa.', it:'Formalità complete e consegna in media entro 48h in tutta Europa.', pt:'Formalidades completas e entrega em média em 48h em toda a Europa.', ro:'Formalități administrative complete și livrare în medie în 48h în toată Europa.' }) },
    { icon: '🔧', title: t({ fr:'Service après-vente', en:'After-sales service', de:'Kundendienst', es:'Servicio posventa', it:'Assistenza post-vendita', pt:'Serviço pós-venda', ro:'Service post-vânzare' }),
      desc: t({ fr:'Atelier intégré, pièces détachées et garantie 12 mois : nous restons à vos côtés après la vente.', en:'In-house workshop, spare parts and 12-month warranty: we stay by your side after the sale.', de:'Eigene Werkstatt, Ersatzteile und 12 Monate Garantie: Wir bleiben auch nach dem Verkauf an Ihrer Seite.', es:'Taller propio, recambios y garantía de 12 meses.', it:'Officina propria, ricambi e garanzia 12 mesi.', pt:'Oficina própria, peças e garantia de 12 meses.', ro:'Atelier propriu, piese de schimb și garanție 12 luni: rămânem alături de dumneavoastră și după vânzare.' }) },
  ];

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
            backgroundImage:'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1800&q=80)',
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
              {t({ fr:'À propos', en:'About us', de:'Über uns', es:'Sobre nosotros', it:'Chi siamo', pt:'Sobre nós', ro:'Despre noi' })}
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)',
            color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20
          }}>
            {t({ fr:'Automatik Gebrauchtwagen', en:'Automatik Gebrauchtwagen', de:'Automatik Gebrauchtwagen', es:'Automatik Gebrauchtwagen', it:'Automatik Gebrauchtwagen', pt:'Automatik Gebrauchtwagen', ro:'Automatik Gebrauchtwagen' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Depuis 1979, Automatik Gebrauchtwagen accompagne ses clients avec des véhicules de qualité, une expertise allemande et un service après-vente à la hauteur.', en:'Since 1979, Automatik Gebrauchtwagen has supported its customers with quality vehicles, German expertise and first-class after-sales service.', de:'Seit 1979 begleitet die Automatik Gebrauchtwagen ihre Kunden mit Qualitätsfahrzeugen, deutscher Kompetenz und erstklassigem Kundendienst.', es:'Desde 1979, Automatik Gebrauchtwagen acompaña a sus clientes con vehículos de calidad, experiencia alemana y un excelente servicio.', it:'Dal 1979, Automatik Gebrauchtwagen accompagna i clienti con veicoli di qualità, competenza tedesca e assistenza di primo livello.', pt:'Desde 1979, a Automatik Gebrauchtwagen acompanha os clientes com veículos de qualidade, experiência alemã e serviço de excelência.', ro:'Din 1979, Automatik Gebrauchtwagen sprijină clienții cu vehicule de calitate, expertiză germană și un serviciu post-vânzare impecabil.' })}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" style={{
              background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px',
              borderRadius:8, display:'inline-flex', alignItems:'center', gap:8,
              boxShadow:'0 4px 16px rgba(19,40,83,0.4)'
            }}>
              {t({ fr:'Voir notre catalogue', en:'View our catalog', de:'Zum Katalog', es:'Ver catálogo', it:'Vedi il catalogo', pt:'Ver catálogo', ro:'Vezi catalogul nostru' })} →
            </Link>
            <Link to="/contact" style={{
              background:'transparent', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8, border:'1px solid rgba(255,255,255,0.3)',
              display:'inline-flex', alignItems:'center', gap:8
            }}>
              {t({ fr:'Nous contacter', en:'Contact us', de:'Kontakt', es:'Contáctenos', it:'Contattaci', pt:'Fale connosco', ro:'Contactați-ne' })}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="section-pad" style={{ background:C.card, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 16 : 32 }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.5, delay:i*0.08 }}
              style={{ textAlign:'center', padding:'12px 8px' }}
            >
              <div style={{ fontSize:34, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 30, color:C.text, letterSpacing:'-0.02em' }}>{s.value}</div>
              <div style={{ fontSize:12.5, color:C.text3, marginTop:6, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64, alignItems:'center' }}>
          <motion.div
            initial={{ opacity:0, x:-40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.7 }}
          >
            <div className="section-eyebrow">{t({ fr:'Notre histoire', en:'Our story', de:'Unsere Geschichte', es:'Nuestra historia', it:'La nostra storia', pt:'A nossa história', ro:'Povestea noastră' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:20 }}>
              {t({ fr:'Une entreprise familiale allemande depuis 1979', en:'A German family business since 1979', de:'Ein deutsches Familienunternehmen seit 1979', es:'Una empresa familiar alemana desde 1979', it:'Un\'azienda familiare tedesca dal 1979', pt:'Uma empresa familiar alemã desde 1979', ro:'O afacere de familie germană din 1979' })}
            </h2>
            <p style={{ fontSize:15, color:C.text2, lineHeight:1.8, marginBottom:16 }}>
              {t({ fr:'Implantée à Naumburg, en Allemagne, Automatik Gebrauchtwagen est spécialisée depuis 1979 dans le commerce de pièces automobiles, d\'accessoires, de véhicules neufs et d\'occasion ainsi que la location de véhicules.', en:'Based in Naumburg, Germany, Automatik Gebrauchtwagen has specialized since 1979 in the trade of automotive parts, accessories, new and used vehicles as well as vehicle rental.', de:'Mit Sitz in Naumburg ist die Automatik Gebrauchtwagen seit 1979 im Handel mit Kfz-Teilen, Zubehör, Neu- und Gebrauchtwagen sowie Fahrzeugvermietung tätig.', es:'Con sede en Naumburg, Automatik Gebrauchtwagen se especializa desde 1979 en el comercio de piezas, accesorios, vehículos nuevos y de ocasión.', it:'Con sede a Naumburg, Automatik Gebrauchtwagen è specializzata dal 1979 nel commercio di ricambi, accessori, veicoli nuovi e usati.', pt:'Com sede em Naumburg, a Automatik Gebrauchtwagen é especializada desde 1979 no comércio de peças, acessórios, veículos novos e usados.', ro:'Cu sediul în Naumburg, Germania, Automatik Gebrauchtwagen este specializată din 1979 în comerțul cu piese auto, accesorii, vehicule noi și rulate, precum și în închirierea de vehicule.' })}
            </p>
            <p style={{ fontSize:15, color:C.text2, lineHeight:1.8, marginBottom:24 }}>
              {t({ fr:'Chaque véhicule présenté sur notre site est inspecté dans notre atelier, préparé avec soin et livré avec toutes les démarches administratives effectuées, partout en Europe.', en:'Every vehicle on our site is inspected in our workshop, carefully prepared and delivered with all administrative formalities completed, across Europe.', de:'Jedes Fahrzeug auf unserer Website wird in unserer Werkstatt geprüft, sorgfältig aufbereitet und mit allen Formalitäten europaweit geliefert.', es:'Cada vehículo de nuestro sitio se inspecciona en nuestro taller y se entrega con todos los trámites realizados.', it:'Ogni veicolo sul nostro sito viene ispezionato in officina e consegnato con tutte le formalità completate.', pt:'Cada veículo do nosso site é inspecionado na oficina e entregue com todas as formalidades tratadas.', ro:'Fiecare vehicul prezentat pe site-ul nostru este inspectat în atelier, pregătit cu grijă și livrat cu toate formalitățile administrative îndeplinite, în toată Europa.' })}
            </p>
            <Link to="/contact" style={{ color:'#132853', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:800, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
              {t({ fr:'En savoir plus', en:'Learn more', de:'Mehr erfahren', es:'Más información', it:'Scopri di più', pt:'Saber mais', ro:'Aflați mai multe' })} →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.7 }}
            style={{ display:'flex', flexDirection:'column', gap:20 }}
          >
            <div style={{ borderRadius:20, overflow:'hidden', boxShadow:C.shadow, position:'relative' }}>
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80" alt="Showroom" style={{ width:'100%', height: isMobile ? 220 : 320, objectFit:'cover' }} />
            </div>
            <div style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderRadius:20, padding: isMobile ? 24 : 32, boxShadow:C.shadow }}>
              <div style={{ fontSize: isMobile ? 26 : 34, marginBottom:12 }}>🏆</div>
              <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 20 : 24, color:'#fff', marginBottom:8 }}>
                {t({ fr:'50 ans d\'expertise', en:'50 years of expertise', de:'50 Jahre Erfahrung', es:'50 años de experiencia', it:'50 anni di esperienza', pt:'50 anos de experiência', ro:'50 de ani de expertiză' })}
              </div>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>
                {t({ fr:'Plus de 4 décennies au service des conducteurs européens, du commerce de pièces à la distribution de véhicules.', en:'More than four decades serving European drivers, from parts trading to vehicle distribution.', de:'Über vier Jahrzehnte im Dienst europäischer Fahrer, vom Teilehandel bis zum Fahrzeugvertrieb.', es:'Más de cuatro décadas al servicio de conductores europeos.', it:'Oltre quattro decenni al servizio dei conducenti europei.', pt:'Mais de quatro décadas ao serviço dos condutores europeus.', ro:'Peste patru decenii în serviciul șoferilor europeni, de la comerțul cu piese până la distribuția de vehicule.' })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad" style={{ background:C.card }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Nos valeurs', en:'Our values', de:'Unsere Werte', es:'Nuestros valores', it:'I nostri valori', pt:'Os nossos valores', ro:'Valorile noastre' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Pourquoi nous choisir', en:'Why choose us', de:'Warum uns wählen', es:'Por qué elegirnos', it:'Perché sceglierci', pt:'Porquê escolher-nos', ro:'De ce să ne alegeți' })}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.08 }}
                style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding: isMobile ? 24 : 32, boxShadow:C.shadow, transition:'transform 0.3s, border-color 0.3s' }}
              >
                <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#132853,#0E1E3D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>
                  {v.icon}
                </div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:19, color:C.text, marginBottom:10 }}>{v.title}</h3>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.8, margin:0 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal info */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>
          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.5 }}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding: isMobile ? 24 : 32, boxShadow:C.shadow }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#132853,#0E1E3D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏢</div>
              <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:19, color:C.text, margin:0 }}>{t({ fr:'Mentions légales', en:'Legal information', de:'Rechtliche Informationen', es:'Información legal', it:'Informazioni legali', pt:'Informação legal', ro:'Informații legale' })}</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, fontSize:14, color:C.text2, lineHeight:1.7 }}>
              {[
                { k: t({ fr:'Raison sociale', en:'Company name', de:'Firmenname', es:'Razón social', it:'Ragione sociale', pt:'Denominação social', ro:'Denumirea societății' }), v: 'Automatik Gebrauchtwagen Großhandel für Kfz-Ersatzteile und Zubehör' },
                { k: t({ fr:'Forme juridique', en:'Legal form', de:'Rechtsform', es:'Forma jurídica', it:'Forma giuridica', pt:'Forma jurídica', ro:'Formă juridică' }), v: 'Gesellschaft mit beschränkter Haftung (GmbH)' },
                { k: t({ fr:'Registre', en:'Register', de:'Register', es:'Registro', it:'Registro', pt:'Registo', ro:'Registru' }), v: 'HRB207153 — EUID DEW1215.HRB207153' },
                { k: t({ fr:'Gérant', en:'Director', de:'Geschäftsführer', es:'Director', it:'Amministratore', pt:'Gerente', ro:'Administrator' }), v: 'Ronny Reinsberger' },
                { k: t({ fr:'Capital social', en:'Share capital', de:'Stammkapital', es:'Capital social', it:'Capitale sociale', pt:'Capital social', ro:'Capital social' }), v: '230.000,00 €' },
                { k: t({ fr:'Activité', en:'Activity', de:'Tätigkeit', es:'Actividad', it:'Attività', pt:'Atividade', ro:'Activitate' }), v: t({ fr:'Commerce de gros et de détail de pièces automobiles, accessoires, véhicules neufs et d\'occasion, location de véhicules.', en:'Wholesale and retail of automotive parts, accessories, new and used vehicles, vehicle rental.', de:'Groß- und Einzelhandel mit Kfz-Teilen, Zubehör, Neu- und Gebrauchtwagen, Vermietung.', es:'Comercio al por mayor y al por menor de piezas, accesorios, vehículos nuevos y de ocasión.', it:'Commercio all\'ingrosso e al dettaglio di ricambi, accessori, veicoli nuovi e usati.', pt:'Comércio por grosso e a retalho de peças, acessórios, veículos novos e usados.', ro:'Comerț cu ridicata și cu amănuntul de piese auto, accesorii, vehicule noi și rulate, închiriere de vehicule.' }) },
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', gap:16, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:150, flexShrink:0, fontWeight:700, color:C.text3, fontSize:12.5 }}>{row.k}</div>
                  <div style={{ fontWeight:500, color:C.text2 }}>{row.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.5, delay:0.1 }}
            style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderRadius:18, padding: isMobile ? 24 : 32, boxShadow:C.shadow, display:'flex', flexDirection:'column', justifyContent:'center', gap:20 }}
          >
            <div style={{ fontSize:40 }}>📞</div>
            <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 26, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
              {t({ fr:'Prêt à rouler avec Automatik ?', en:'Ready to drive with Automatik?', de:'Bereit mit Automatik zu fahren?', es:'¿Listo para conducir con Automatik?', it:'Pronto a guidare con Automatik?', pt:'Pronto a conduzir com a Automatik?', ro:'Gata să plecați la drum cu Automatik?' })}
            </h3>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>
              {t({ fr:'Notre équipe vous accompagne dans le choix de votre prochain véhicule, de la première visite à la livraison.', en:'Our team supports you in choosing your next vehicle, from first visit to delivery.', de:'Unser Team begleitet Sie bei der Wahl Ihres nächsten Fahrzeugs.', es:'Nuestro equipo le acompaña en la elección de su próximo vehículo.', it:'Il nostro team vi accompagna nella scelta del vostro prossimo veicolo.', pt:'A nossa equipa acompanha-o na escolha do seu próximo veículo.', ro:'Echipa noastră vă însoțește în alegerea următorului vehicul, de la prima vizită până la livrare.' })}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'13px 26px', borderRadius:8 }}>
                💬 WhatsApp
              </a>
              <Link to="/contact" style={{ background:'transparent', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'13px 26px', borderRadius:8, border:'1px solid rgba(255,255,255,0.3)' }}>
                {t({ fr:'Nous contacter', en:'Contact us', de:'Kontakt', es:'Contáctenos', it:'Contattaci', pt:'Fale connosco', ro:'Contactați-ne' })}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
