import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function Warranty() {
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

  const coverageItems = [
    { 
      title: t({ fr:'Moteur & boîte de vitesses', en:'Engine & Transmission', de:'Motor & Getriebe', es:'Motor y transmisión', it:'Motore e trasmissione', pt:'Motor e transmissão', ro:'Motor și cutie de viteze' }),
      desc: t({ fr:'Protection complète du groupe motopropulseur, y compris les pièces internes du moteur, la culasse, le bloc moteur, les pistons, les bielles, le vilebrequin et la boîte de vitesses.', en:'Complete powertrain protection including internal engine parts, cylinder head, engine block, pistons, connecting rods, crankshaft and transmission.', de:'Vollständiger Antriebsstrangschutz einschließlich interner Motorteile, Zylinderkopf, Motorblock, Kolben, Pleuel, Kurbelwelle und Getriebe.', es:'Protección completa del tren motriz, incluidas las piezas internas del motor, culata, bloque del motor, pistones, bielas, cigüeñal y transmisión.', it:'Protezione completa del powertrain inclusi i pezzi interni del motore, testata, blocco motore, pistoni, bielle, albero a gomiti e trasmissione.', pt:'Proteção completa do trem de força, incluindo peças internas do motor, cabeçote, bloco do motor, pistões, bielas, virabrequim e transmissão.', ro:'Protecție completă a sistemului de propulsie, inclusiv piesele interne ale motorului, chiulasa, blocul motor, pistoanele, bielele, arborele cotit și cutia de viteze.' }),
      icon: '⚙️'
    },
    { 
      title: t({ fr:'Système de refroidissement', en:'Cooling System', de:'Kühlsystem', es:'Sistema de refrigeración', it:'Sistema di raffreddamento', pt:'Sistema de refrigeração', ro:'Sistem de răcire' }),
      desc: t({ fr:'Radiateur, pompe à eau, thermostat, durites, ventilateur de refroidissement et tous les composants du circuit de refroidissement.', en:'Radiator, water pump, thermostat, hoses, cooling fan and all cooling system components.', de:'Kühler, Wasserpumpe, Thermostat, Schläuche, Lüfter und alle Kühlsystemkomponenten.', es:'Radiador, bomba de agua, termostato, mangueras, ventilador de refrigeración y todos los componentes del sistema de refrigeración.', it:'Radiatore, pompa dell\'acqua, termostato, tubi, ventilatore di raffreddamento e tutti i componenti del sistema di raffreddamento.', pt:'Radiador, bomba de água, termostato, mangueiras, ventilador de refrigeração e todos os componentes do sistema de refrigeração.', ro:'Radiator, pompă de apă, termostat, furtunuri, ventilator de răcire și toate componentele circuitului de răcire.' }),
      icon: '❄️'
    },
    { 
      title: t({ fr:'Direction & freinage', en:'Steering & Braking', de:'Lenkung & Bremsen', es:'Dirección y frenado', it:'Sterzo e frenatura', pt:'Direção e frenagem', ro:'Direcție & frânare' }),
      desc: t({ fr:'Direction assistée, pompe de direction, colonne de direction, maître-cylindre, étriers de frein, plaquettes, disques et système ABS.', en:'Power steering, steering pump, steering column, master cylinder, brake calipers, pads, discs and ABS system.', de:'Servolenkung, Lenkpumpe, Lenksäule, Hauptbrezylinder, Bremssättel, Beläge, Scheiben und ABS-System.', es:'Dirección asistida, bomba de dirección, columna de dirección, cilindro maestro, pinzas de freno, pastillas, discos y sistema ABS.', it:'Servosterzo, pompa dello sterzo, colonna dello sterzo, cilindro principale, pinze freno, pastiglie, dischi e sistema ABS.', pt:'Direção assistida, bomba de direção, coluna de direção, cilindro mestre, pinças de freio, pastilhas, discos e sistema ABS.', ro:'Servodirecție, pompă de direcție, coloană de direcție, cilindru principal, etriere de frână, plăcuțe, discuri și sistem ABS.' }),
      icon: '🛞'
    },
    { 
      title: t({ fr:'Électronique embarquée', en:'On-board Electronics', de:'Bordelektronik', es:'Electrónica a bordo', it:'Elettronica di bordo', pt:'Eletrônica embarcada', ro:'Electronică de bord' }),
      desc: t({ fr:'ECU, capteurs, calculateurs, système d\'injection, allumage électronique, tableau de bord et tous les modules électroniques.', en:'ECU, sensors, control units, injection system, electronic ignition, dashboard and all electronic modules.', de:'Steuergerät, Sensoren, Steuergeräte, Einspritzsystem, elektronische Zündung, Armaturenbrett und alle elektronischen Module.', es:'ECU, sensores, unidades de control, sistema de inyección, encendido electrónico, tablero y todos los módulos electrónicos.', it:'ECU, sensori, unità di controllo, sistema di iniezione, accensione elettronica, cruscotto e tutti i moduli elettronici.', pt:'ECU, sensores, unidades de controle, sistema de injeção, ignição eletrônica, painel e todos os módulos eletrônicos.', ro:'ECU, senzori, calculatoare, sistem de injecție, aprindere electronică, bord și toate modulele electronice.' }),
      icon: '📟'
    },
    { 
      title: t({ fr:'Climatisation', en:'Air Conditioning', de:'Klimaanlage', es:'Aire acondicionado', it:'Climatizzazione', pt:'Ar condicionado', ro:'Climatizare' }),
      desc: t({ fr:'Compresseur, condenseur, évaporateur, détendeur, système de chauffage et tous les composants du circuit de climatisation.', en:'Compressor, condenser, evaporator, expansion valve, heating system and all AC components.', de:'Kompressor, Kondensator, Verdampfer, Expansionsventil, Heizsystem und alle Klimaanlagenkomponenten.', es:'Compresor, condensador, evaporador, válvula de expansión, sistema de calefacción y todos los componentes del aire acondicionado.', it:'Compressore, condensatore, evaporatore, valvola di espansione, sistema di riscaldamento e tutti i componenti del climatizzatore.', pt:'Compressor, condensador, evaporador, válvula de expansão, sistema de aquecimento e todos os componentes do ar condicionado.', ro:'Compresor, condensator, evaporator, supapă de expansiune, sistem de încălzire și toate componentele circuitului de climatizare.' }),
      icon: '❄️'
    },
    { 
      title: t({ fr:'Système électrique', en:'Electrical System', de:'Elektrisches System', es:'Sistema eléctrico', it:'Sistema elettrico', pt:'Sistema elétrico', ro:'Sistem electric' }),
      desc: t({ fr:'Alternateur, démarreur, batterie, faisceau électrique, fusibles, relais et tous les composants électriques.', en:'Alternator, starter, battery, wiring harness, fuses, relays and all electrical components.', de:'Lichtmaschine, Anlasser, Batterie, Kabelbaum, Sicherungen, Relais und alle elektrischen Komponenten.', es:'Alternador, motor de arranque, batería, arnés de cables, fusibles, relés y todos los componentes eléctricos.', it:'Alternatore, motorino di avviamento, batteria, cablaggio, fusibili, relè e tutti i componenti elettrici.', pt:'Alternador, motor de partida, bateria, chicote elétrico, fusíveis, relés e todos os componentes elétricos.', ro:'Alternator, demaror, baterie, cablaj electric, siguranțe, relee și toate componentele electrice.' }),
      icon: '⚡'
    },
  ];

  const extensionOptions = [
    {
      title: t({ fr:'Extension 24 mois', en:'24-month Extension', de:'24 Monate Erweiterung', es:'Extensión 24 meses', it:'Estensione 24 mesi', pt:'Extensão 24 meses', ro:'Extensie 24 luni' }),
      price: t({ fr:'À partir de 299€', en:'From 299€', de:'Ab 299€', es:'Desde 299€', it:'Da 299€', pt:'A partir de 299€', ro:'De la 299€' }),
      features: [
        t({ fr:'✓ Couverture moteur et transmission', en:'✓ Engine and transmission coverage', de:'✓ Motor- und Getriebeschutz', es:'✓ Cobertura de motor y transmisión', it:'✓ Copertura motore e trasmissione', pt:'✓ Cobertura de motor e transmissão', ro:'✓ Acoperire motor și transmisie' }),
        t({ fr:'✓ Pièces et main-d\'œuvre', en:'✓ Parts and labor', de:'✓ Teile und Arbeitszeit', es:'✓ Piezas y mano de obra', it:'✓ Ricambi e manodopera', pt:'✓ Peças e mão de obra', ro:'✓ Piese și manoperă' }),
        t({ fr:'✓ Assistance dépannage', en:'✓ Breakdown assistance', de:'✓ Pannenhilfe', es:'✓ Asistencia de averías', it:'✓ Assistenza guasto', pt:'✓ Assistência de pane', ro:'✓ Asistență avarii' }),
      ]
    },
    {
      title: t({ fr:'Extension 36 mois', en:'36-month Extension', de:'36 Monate Erweiterung', es:'Extensión 36 meses', it:'Estensione 36 mesi', pt:'Extensão 36 meses', ro:'Extensie 36 luni' }),
      price: t({ fr:'À partir de 499€', en:'From 499€', de:'Ab 499€', es:'Desde 499€', it:'Da 499€', pt:'A partir de 499€', ro:'De la 499€' }),
      features: [
        t({ fr:'✓ Couverture complète', en:'✓ Full coverage', de:'✓ Vollständige Abdeckung', es:'✓ Cobertura completa', it:'✓ Copertura completa', pt:'✓ Cobertura completa', ro:'✓ Acoperire completă' }),
        t({ fr:'✓ Véhicule de remplacement', en:'✓ Replacement vehicle', de:'✓ Ersatzfahrzeug', es:'✓ Vehículo de reemplazo', it:'✓ Veicolo sostitutivo', pt:'✓ Veículo substituto', ro:'✓ Vehicul de înlocuire' }),
        t({ fr:'✓ Assistance 24/7', en:'✓ 24/7 assistance', de:'✓ 24/7 Assistance', es:'✓ Asistencia 24/7', it:'✓ Assistenza 24/7', pt:'✓ Assistência 24/7', ro:'✓ Asistență 24/7' }),
        t({ fr:'✓ Garantie carrosserie', en:'✓ Body warranty', de:'✓ Karossergarantie', es:'✓ Garantía de carrocería', it:'✓ Garanzia carrozzeria', pt:'✓ Garantia de carroceria', ro:'✓ Garanție caroserie' }),
      ]
    },
    {
      title: t({ fr:'Premium Gold', en:'Premium Gold', de:'Premium Gold', es:'Premium Gold', it:'Premium Gold', pt:'Premium Gold', ro:'Premium Gold' }),
      price: t({ fr:'À partir de 799€', en:'From 799€', de:'Ab 799€', es:'Desde 799€', it:'Da 799€', pt:'A partir de 799€', ro:'De la 799€' }),
      features: [
        t({ fr:'✓ Tous les avantages Premium', en:'✓ All Premium benefits', de:'✓ Alle Premium-Vorteile', es:'✓ Todos los beneficios Premium', it:'✓ Tutti i vantaggi Premium', pt:'✓ Todos os benefícios Premium', ro:'✓ Toate avantajele Premium' }),
        t({ fr:'✓ Kilométrage illimité', en:'✓ Unlimited mileage', de:'✓ Unbegrenzte Kilometer', es:'✓ Kilometraje ilimitado', it:'✓ Chilometraggio illimitato', pt:'✓ Quilometragem ilimitado', ro:'✓ Kilometraj nelimitat' }),
        t({ fr:'✓ Hôtel en cas de panne', en:'✓ Hotel in case of breakdown', de:'✓ Hotel bei Panne', es:'✓ Hotel en caso de avería', it:'✓ Hotel in caso di guasto', pt:'✓ Hotel em caso de pane', ro:'✓ Hotel în caz de avarie' }),
        t({ fr:'✓ Rapatriement véhicule', en:'✓ Vehicle repatriation', de:'✓ Fahrzeugrückführung', es:'✓ Repatriación del vehículo', it:'✓ Rimpatrio veicolo', pt:'✓ Repatriação do veículo', ro:'✓ Repatriere vehicul' }),
      ]
    },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>
      
      {/* Hero */}
      <section style={{ 
        position:'relative', 
        height: isMobile ? '60vh' : '70vh', 
        minHeight:500, 
        display:'flex', 
        alignItems:'center', 
        overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <motion.div 
          initial={{ opacity:0, scale:1.1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.2 }}
          style={{ 
            position:'absolute', 
            inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1800&q=80)',
            backgroundSize:'cover',
            backgroundPosition:'center',
            opacity:0.3
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />
        
        <motion.div 
          initial={{ opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:0.2 }}
          style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:900 }}
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(19,40,83,0.2)', border:'1px solid rgba(19,40,83,0.4)', borderRadius:4, padding:'8px 18px', marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#132853', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>
              {t({ fr:'Protection', en:'Protection', de:'Schutz', es:'Protección', it:'Protezione', pt:'Proteção', ro:'Protecție' })}
            </span>
          </div>
          <h1 style={{ 
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", 
            fontWeight:900, 
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)', 
            color:'#fff', 
            letterSpacing:'-0.03em', 
            lineHeight:1.1, 
            marginBottom:20 
          }}>
            {t({ fr:'Garantie\nAutomatik Gebrauchtwagen', en:'Automatik Gebrauchtwagen\nWarranty', de:'Automatik Gebrauchtwagen\nGarantie', es:'Garantía\nAutomatik Gebrauchtwagen', it:'Garanzia\nAutomatik Gebrauchtwagen', pt:'Garantia\nAutomatik Gebrauchtwagen', ro:'Garanție\nAutomatik Gebrauchtwagen' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Une protection complète pour votre véhicule avec des garanties étendues et une assistance 24/7. Roulez l\'esprit tranquille.', en:'Complete protection for your vehicle with extended warranties and 24/7 assistance. Drive with peace of mind.', de:'Umfassender Schutz für Ihr Fahrzeug mit erweiterten Garantien und 24/7 Assistance. Fahren Sie sorgenfrei.', es:'Protección completa para su vehículo con garantías extendidas y asistencia 24/7. Conduzca con tranquilidad.', it:'Protezione completa per il vostro veicolo con garanzie estese e assistenza 24/7. Guidate tranquilli.', pt:'Proteção completa para seu veículo com garantias estendidas e assistência 24/7. Dirija com tranquilidade.', ro:'O protecție completă pentru vehiculul dvs. cu garanții extinse și asistență 24/7. Conduceți cu liniște sufletească.' })}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" style={{ 
              background:'linear-gradient(135deg,#132853,#0E1E3D)', 
              color:'#fff', 
              textDecoration:'none', 
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", 
              fontSize:14, 
              fontWeight:700, 
              padding:'14px 28px', 
              borderRadius:8, 
              display:'inline-flex', 
              alignItems:'center', 
              gap:8,
              boxShadow:'0 4px 16px rgba(19,40,83,0.4)'
            }}>
              {t({ fr:'Voir les véhicules', en:'View vehicles', de:'Fahrzeuge ansehen', es:'Ver vehículos', it:'Vedi veicoli', pt:'Ver veículos', ro:'Vezi vehiculele' })} →
            </Link>
            <Link to="/insurance" style={{ 
              background:'rgba(255,255,255,0.1)', 
              color:'#fff', 
              textDecoration:'none', 
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", 
              fontSize:14, 
              fontWeight:700, 
              padding:'14px 28px', 
              borderRadius:8, 
              border:'1px solid rgba(255,255,255,0.3)',
              display:'inline-flex', 
              alignItems:'center', 
              gap:8
            }}>
              {t({ fr:'Assurances', en:'Insurance', de:'Versicherung', es:'Seguros', it:'Assicurazione', pt:'Seguros', ro:'Asigurări' })}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Basic Warranty */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {t({ fr:'INCLUSE', en:'INCLUDED', de:'INKLUSIVE', es:'INCLUIDO', it:'INCLUSO', pt:'INCLUÍDO', ro:'INCLUSĂ' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Garantie Basique\nAutomatik Gebrauchtwagen', en:'Automatik Gebrauchtwagen\nBasic Warranty', de:'Automatik Gebrauchtwagen\nBasisgarantie', es:'Garantía Básica\nAutomatik Gebrauchtwagen', it:'Garanzia Base\nAutomatik Gebrauchtwagen', pt:'Garantia Básica\nAutomatik Gebrauchtwagen', ro:'Garanție de Bază\nAutomatik Gebrauchtwagen' })}
            </h2>
            <p style={{ fontSize:16, color:C.text3, marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {t({ fr:'Incluse dans toutes les commandes. Valable 12 mois ou 10 000 km (première échéance atteinte).', en:'Included in all orders. Valid 12 months or 10,000 km (first threshold reached).', de:'In allen Bestellungen enthalten. Gültig 12 Monate oder 10.000 km (erste Schwelle erreicht).', es:'Incluida en todos los pedidos. Válida 12 meses o 10.000 km (primer umbral alcanzado).', it:'Inclusa in tutti gli ordini. Valida 12 mesi o 10.000 km (prima soglia raggiunta).', pt:'Incluída em todos os pedidos. Válida 12 meses ou 10.000 km (primeiro limite atingido).', ro:'Inclusă în toate comenzile. Valabilă 12 luni sau 10.000 km (prima limită atinsă).' })}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding: isMobile ? 32 : 48, marginBottom:48, boxShadow:C.shadow }}
          >
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:24, marginBottom:32 }}>
              {[
                { value:'12', label:t({ fr:'MOIS', en:'MONTHS', de:'MONATE', es:'MESES', it:'MESI', pt:'MESES', ro:'LUNI' }), icon:'📅' },
                { value:'10 000', label:t({ fr:'KM', en:'KM', de:'KM', es:'KM', it:'KM', pt:'KM', ro:'KM' }), icon:'📏' },
                { value:'100%', label:t({ fr:'COUVERTURE', en:'COVERAGE', de:'ABDECKUNG', es:'COBERTURA', it:'COBERTURA', pt:'COBERTURA', ro:'ACOPERIRE' }), icon:'🛡️' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign:'center', padding:24, background:C.card2, borderRadius:16 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{stat.icon}</div>
                  <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:48, color:C.red, lineHeight:1 }}>{stat.value}</div>
                  <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:C.text3, marginTop:8 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coverage Grid */}
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.2 }}
            style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:20 }}
          >
            {coverageItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity:0, y:20 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{ 
                  background:C.card, 
                  border:`1px solid ${C.border}`, 
                  borderRadius:16, 
                  padding:28, 
                  boxShadow:C.shadow,
                  transition:'all 0.3s'
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.4)'; e.currentTarget.style.transform='translateY(-4px)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none';}}
              >
                <div style={{ display:'flex', gap:16, marginBottom:16 }}>
                  <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:8 }}>{item.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Extension Options */}
      <section style={{ background:C.card2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {t({ fr:'EXTENSIONS', en:'EXTENSIONS', de:'ERWEITERUNGEN', es:'EXTENSIONES', it:'ESTENSIONI', pt:'EXTENSÕES', ro:'EXTENSII' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Options d\'Extension\nde Garantie', en:'Warranty\nExtension Options', de:'Garantie-\nErweiterungsoptionen', es:'Opciones de\nExtensión de Garantía', it:'Opzioni di\nEstensione Garanzia', pt:'Opções de\nExtensão de Garantia', ro:'Opțiuni de\nExtensie a Garanției' })}
            </h2>
            <p style={{ fontSize:16, color:C.text3, marginTop:12, maxWidth:600, margin:'12px auto 0' }}>
              {t({ fr:'Étendez votre protection jusqu\'à 36 mois avec nos options d\'extension premium.', en:'Extend your protection up to 36 months with our premium extension options.', de:'Erweitern Sie Ihren Schutz bis zu 36 Monate mit unseren Premium-Erweiterungsoptionen.', es:'Amplíe su protección hasta 36 meses con nuestras opciones de extensión premium.', it:'Estendete la vostra protezione fino a 36 mesi con le nostre opzioni di estensione premium.', pt:'Estenda sua proteção até 36 meses com nossas opções de extensão premium.', ro:'Extindeți-vă protecția până la 36 de luni cu opțiunile noastre premium de extensie.' })}
            </p>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:24 }}>
            {extensionOptions.map((option, i) => (
              <motion.div 
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{ 
                  background:C.card, 
                  border:`1px solid ${C.border}`, 
                  borderRadius:20, 
                  padding:32, 
                  boxShadow:C.shadow,
                  transition:'all 0.3s',
                  position:'relative',
                  overflow:'hidden'
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.4)'; e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(19,40,83,0.15)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=C.shadow;}}
              >
                {i === 2 && (
                  <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 16px', borderBottomLeftRadius:12 }}>
                    {t({ fr:'POPULAIRE', en:'POPULAR', de:'BELIEBT', es:'POPULAR', it:'POPOLARE', pt:'POPULAR', ro:'POPULAR' })}
                  </div>
                )}
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:22, color:C.text, marginBottom:12 }}>{option.title}</h3>
                <div style={{ fontSize:28, fontWeight:900, color:C.red, marginBottom:24 }}>{option.price}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {option.features.map((feature, fi) => (
                    <div key={fi} style={{ fontSize:14, color:C.text2, fontWeight:600, lineHeight:1.6 }}>{feature}</div>
                  ))}
                </div>
                <button style={{ 
                  width:'100%', 
                  marginTop:24, 
                  padding:'14px 20px', 
                  background:'linear-gradient(135deg,#132853,#0E1E3D)', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:10, 
                  fontSize:14, 
                  fontWeight:700, 
                  fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                  cursor:'pointer',
                  transition:'all 0.3s'
                }}>
                  {t({ fr:'Choisir cette option', en:'Choose this option', de:'Diese Option wählen', es:'Elegir esta opción', it:'Scegli questa opzione', pt:'Escolher esta opção', ro:'Alegeți această opțiune' })}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusions */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {t({ fr:'EXCLUSIONS', en:'EXCLUSIONS', de:'AUSSCHLÜSSE', es:'EXCLUSIONES', it:'ESCLUSIONI', pt:'EXCLUSÕES', ro:'EXCLUDERI' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Ce qui n\'est pas\ncouvert', en:'What is not\ncovered', de:'Was nicht\nabgedeckt ist', es:'Lo que no está\ncubierto', it:'Cosa non è\ncoperto', pt:'O que não está\ncoberto', ro:'Ce nu este\nacoperit' })}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:16, padding: isMobile ? 28 : 40 }}
          >
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:20 }}>
              {[
                t({ fr:'✗ Pièces d\'usure (plaquettes, disques, pneus, essuie-glaces)', en:'✗ Wear parts (brake pads, discs, tires, wipers)', de:'✗ Verschleißteile (Bremsbeläge, Scheiben, Reifen, Scheibenwischer)', es:'✗ Piezas de desgaste (pastillas, discos, neumáticos, limpiaparabrisas)', it:'✗ Pezzi di usura (pastiglie, dischi, pneumatici, tergicristallo)', pt:'✗ Peças de desgaste (pastilhas, discos, pneus, limpadores)', ro:'✗ Piese de uzură (plăcuțe, discuri, anvelope, ștergătoare)' }),
                t({ fr:'✗ Entretien courant (huile, filtres, bougies)', en:'✗ Routine maintenance (oil, filters, spark plugs)', de:'✗ Routine-Wartung (Öl, Filter, Zündkerzen)', es:'✗ Mantenimiento rutinario (aceite, filtros, bujías)', it:'✗ Manutenzione ordinaria (olio, filtri, candele)', pt:'✗ Manutenção de rotina (óleo, filtros, velas)', ro:'✗ Întreținere curentă (ulei, filtre, bujii)' }),
                t({ fr:'✗ Carrosserie et peinture (sauf option carrosserie)', en:'✗ Body and paint (unless body option selected)', de:'✗ Karosserie und Lack (außer Karosserie-Option)', es:'✗ Carrocería y pintura (salvo opción de carrocería)', it:'✗ Carrozzeria e vernice (salvo opzione carrozzeria)', pt:'✗ Carroceria e pintura (exceto opção de carroceria)', ro:'✗ Caroserie și vopsea (cu excepția opțiunii de caroserie)' }),
                t({ fr:'✗ Accessoires et modifications non conformes', en:'✗ Non-compliant accessories and modifications', de:'✗ Nicht konforme Zubehörteile und Modifikationen', es:'✗ Accesorios y modificaciones no conformes', it:'✗ Accessori e modifiche non conformi', pt:'✗ Acessórios e modificações não conformes', ro:'✗ Accesorii și modificări neconforme' }),
                t({ fr:'✗ Dommages résultant d\'un accident ou négligence', en:'✗ Damage resulting from accident or negligence', de:'✗ Schäden durch Unfall oder Fahrlässigkeit', es:'✗ Daños resultantes de accidente o negligencia', it:'✗ Danni derivanti da incidente o negligenza', pt:'✗ Danos resultantes de acidente ou negligência', ro:'✗ Daune rezultate în urma unui accident sau neglijenței' }),
                t({ fr:'✗ Utilisation commerciale ou compétition', en:'✗ Commercial use or competition', de:'✗ Gewerbliche Nutzung oder Wettbewerb', es:'✗ Uso comercial o competición', it:'✗ Uso commerciale o competizione', pt:'✗ Uso comercial ou competição', ro:'✗ Utilizare comercială sau competițională' }),
              ].map((item, i) => (
                <div key={i} style={{ fontSize:14, color:C.text2, lineHeight:1.7, fontWeight:600 }}>{item}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderTop:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <motion.div 
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
          >
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 42, color:'#fff', letterSpacing:'-0.02em', marginBottom:20 }}>
              {t({ fr:'Prêt à protéger votre véhicule?', en:'Ready to protect your vehicle?', de:'Bereit, Ihr Fahrzeug zu schützen?', es:'¿Listo para proteger su vehículo?', it:'Pronto a proteggere il tuo veicolo?', pt:'Pronto para proteger seu veículo?', ro:'Gata să vă protejați vehiculul?' })}
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:32 }}>
              {t({ fr:'Contactez-nous pour discuter des options de garantie adaptées à vos besoins.', en:'Contact us to discuss warranty options tailored to your needs.', de:'Kontaktieren Sie uns, um Garantieoptionen zu besprechen, die auf Ihre Bedürfnisse zugeschnitten sind.', es:'Contáctenos para discutir opciones de garantía adaptadas a sus necesidades.', it:'Contattateci per discutere le opzioni di garanzia adatte alle tue esigenze.', pt:'Entre em contato conosco para discutir opções de garantia adaptadas às suas necessidades.', ro:'Contactați-ne pentru a discuta despre opțiunile de garanție adaptate nevoilor dvs.' })}
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{ 
                background:'#25D366', 
                color:'#fff', 
                textDecoration:'none', 
                fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", 
                fontSize:14, 
                fontWeight:700, 
                padding:'14px 28px', 
                borderRadius:8, 
                display:'inline-flex', 
                alignItems:'center', 
                gap:8,
                boxShadow:'0 4px 16px rgba(37,211,102,0.3)'
              }}>
                💬 WhatsApp
              </a>
              <Link to="/catalog" style={{ 
                background:'rgba(255,255,255,0.1)', 
                color:'#fff', 
                textDecoration:'none', 
                fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", 
                fontSize:14, 
                fontWeight:700, 
                padding:'14px 28px', 
                borderRadius:8, 
                border:'1px solid rgba(255,255,255,0.3)',
                display:'inline-flex', 
                alignItems:'center', 
                gap:8
              }}>
                {t({ fr:'Voir les véhicules', en:'View vehicles', de:'Fahrzeuge ansehen', es:'Ver vehículos', it:'Vedi veicoli', pt:'Ver veículos', ro:'Vezi vehiculele' })}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
