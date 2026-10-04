import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function Maintenance() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const C = { bg:'#f5f5f5', card:'#ffffff', card2:'#ececec', border:'rgba(0,0,0,0.1)', text:'#111111', text2:'#444444', text3:'#888888', shadow:'0 4px 24px rgba(0,0,0,0.08)' };
  const t = (o) => o[l] || o.fr;

  const services = [
    { icon:'🔧', title:t({fr:'Entretien & révision',en:'Maintenance & service',de:'Wartung & Inspektion',es:'Mantenimiento y revisión',it:'Manutenzione e tagliandi',pt:'Manutenção e revisão',ro:'Întreținere și revizie'}), desc:t({fr:'Vidange, filtres, courroies, fluides : un entretien complet selon les préconisations constructeur.',en:'Oil change, filters, belts, fluids: complete maintenance to manufacturer specifications.',de:'Ölwechsel, Filter, Riemen, Flüssigkeiten: Komplettwartung nach Herstellervorgaben.',es:'Cambio de aceite, filtros, correas, líquidos.',it:'Cambio olio, filtri, cinghie, fluidi.',pt:'Troca de óleo, filtros, correias, líquidos.',ro:'Schimb ulei, filtre, curele, lichide: întreținere completă conform specificațiilor producătorului.'}) },
    { icon:'🚗', title:t({fr:'Diagnostic électronique',en:'Electronic diagnostics',de:'Elektronische Diagnose',es:'Diagnóstico electrónico',it:'Diagnosi elettronica',pt:'Diagnóstico eletrónico',ro:'Diagnostic electronic'}), desc:t({fr:'Lecture des codes défauts sur toutes marques, analyse en temps réel et réparation ciblée.',en:'Fault code reading on all brands, real-time analysis and targeted repair.',de:'Fehlercode-Auslesung aller Marken, Echtzeitanalyse und gezielte Reparatur.',es:'Lectura de códigos de avería en todas las marcas.',it:'Lettura dei codici errore su tutti i marchi.',pt:'Leitura de códigos de avaria em todas as marcas.',ro:'Citirea codurilor de eroare pe toate mărcile, analiză în timp real și reparație țintită.'}) },
    { icon:'🔩', title:t({fr:'Freinage',en:'Braking',de:'Bremsen',es:'Frenos',it:'Impianto frenante',pt:'Travões',ro:'Sistem de frânare'}), desc:t({fr:'Plaquettes, disques, étriers et liquide de frein remplacés avec des pièces d\'origine.',en:'Pads, discs, calipers and brake fluid replaced with original parts.',de:'Bremsbeläge, Scheiben, Sättel und Bremsflüssigkeit mit Originalteilen.',es:'Pastillas, discos, pinzas y líquido de frenos con piezas originales.',it:'Pastiglie, dischi, pinze e liquido freni con ricambi originali.',pt:'Pastilhas, discos, pinças e fluido de travões com peças originais.',ro:'Plăcuțe, discuri, etriere și lichid de frână înlocuite cu piese originale.'}) },
    { icon:'🛞', title:t({fr:'Pneumatiques & géométrie',en:'Tires & alignment',de:'Reifen & Achsvermessung',es:'Neumáticos y geometría',it:'Pneumatici e geometria',pt:'Pneus e geometria',ro:'Anvelope și geometrie'}), desc:t({fr:'Vente et montage de pneumatiques toutes dimensions, équilibrage et parallélisme.',en:'Tire sales and mounting in all sizes, balancing and wheel alignment.',de:'Reifenverkauf und Montage aller Größen, Wuchten und Achsvermessung.',es:'Venta y montaje de neumáticos, equilibrado y paralelo.',it:'Vendita e montaggio pneumatici, equilibratura e parallelo.',pt:'Venda e montagem de pneus, balanceamento e alinhamento.',ro:'Vânzare și montare anvelope în toate dimensiunile, echilibrare și geometrie.'}) },
    { icon:'❄️', title:t({fr:'Climatisation',en:'Air conditioning',de:'Klimaanlage',es:'Aire acondicionado',it:'Climatizzatore',pt:'Ar condicionado',ro:'Aer condiționat'}), desc:t({fr:'Nettoyage du circuit, rechargement de gaz et désinfection antibactérienne.',en:'System cleaning, refrigerant refill and antibacterial disinfection.',de:'Reinigung des Kreislaufs, Kältemittel-Nachfüllung und Desinfektion.',es:'Limpieza del circuito, recarga de gas y desinfección.',it:'Pulizia del circuito, ricarica del gas e disinfezione.',pt:'Limpeza do circuito, recarga de gás e desinfeção.',ro:'Curățarea circuitului, încărcarea cu gaz și dezinfecție antibacteriană.'}) },
    { icon:'⚙️', title:t({fr:'Échappement & embrayage',en:'Exhaust & clutch',de:'Auspuff & Kupplung',es:'Escape y embrague',it:'Scarico e frizione',pt:'Escape e embraiagem',ro:'Sistem de evacuare și ambreiaj'}), desc:t({fr:'Remplacement complet de pots, catalyseurs, embrayages et volants moteur.',en:'Full replacement of exhausts, catalytic converters, clutches and flywheels.',de:'Kompletter Austausch von Auspuffen, Katalysatoren, Kupplungen und Schwungrädern.',es:'Sustitución de escapes, catalizadores, embragues y volantes.',it:'Sostituzione completa di scarichi, catalizzatori, frizioni e volani.',pt:'Substituição completa de escapes, catalisadores, embraiagens e volantes.',ro:'Înlocuire completă a eșapamentelor, catalizatoarelor, ambreiajelor și volantelor.'}) },
    { icon:'🔋', title:t({fr:'Batteries & électricité',en:'Batteries & electrics',de:'Batterien & Elektrik',es:'Baterías y electricidad',it:'Batterie e impianto elettrico',pt:'Baterias e eletricidade',ro:'Baterii și instalație electrică'}), desc:t({fr:'Test de batterie, remplacement, alternateur et démarreur.',en:'Battery testing, replacement, alternator and starter.',de:'Batterietest, Ersatz, Lichtmaschine und Anlasser.',es:'Test de batería, alternador y motor de arranque.',it:'Test batteria, alternatore e motorino.',pt:'Teste de bateria, alternador e motor de arranque.',ro:'Test baterie, înlocuire, alternator și demaror.'}) },
    { icon:'🧰', title:t({fr:'Carrosserie',en:'Bodywork',de:'Karosserie',es:'Carrocería',it:'Carrozzeria',pt:'Carroçaria',ro:'Caroserie'}), desc:t({fr:'Rénovation, peinture et réparation de petits chocs avec finition d\'origine.',en:'Restoration, painting and small dent repair with original finish.',de:'Aufbereitung, Lackierung und Reparatur kleiner Schäden.',es:'Renovación, pintura y reparación de golpes.',it:'Rinovo, verniciatura e riparazione di piccoli danni.',pt:'Renovação, pintura e reparação de pequenos danos.',ro:'Renovare, vopsire și repararea micilor zgârieturi cu finisaj original.'}) },
  ];

  const promises = [
    { icon:'💶', title:t({fr:'Devis gratuit',en:'Free quote',de:'Kostenloses Angebot',es:'Presupuesto gratuito',it:'Preventivo gratuito',pt:'Orçamento gratuito',ro:'Deviz gratuit'}), desc:t({fr:'Un devis détaillé avant toute intervention. Aucun frais caché.',en:'A detailed quote before any work. No hidden fees.',de:'Ein detailliertes Angebot vor jeder Arbeit. Keine versteckten Kosten.',es:'Presupuesto detallado antes de cualquier trabajo.',it:'Preventivo dettagliato prima di ogni intervento.',pt:'Orçamento detalhado antes de qualquer trabalho.',ro:'Un deviz detaliat înainte de orice intervenție. Fără costuri ascunse.'}) },
    { icon:'🛡️', title:t({fr:'Garantie sur les interventions',en:'Warranty on all work',de:'Garantie auf alle Arbeiten',es:'Garantía en las reparaciones',it:'Garanzia sugli interventi',pt:'Garantia nas intervenções',ro:'Garanție la intervenții'}), desc:t({fr:'Chaque réparation est garantie. Nous restons responsables de nos travaux.',en:'Every repair is warranted. We stand behind our work.',de:'Jede Reparatur ist garantiert. Wir stehen hinter unserer Arbeit.',es:'Cada reparación está garantizada.',it:'Ogni riparazione è garantita.',pt:'Cada reparação está garantida.',ro:'Fiecare reparație este garantată. Răspundem pentru lucrările noastre.'}) },
    { icon:'🔑', title:t({fr:'Pièces d\'origine',en:'Original parts',de:'Originalteile',es:'Piezas originales',it:'Ricambi originali',pt:'Peças originais',ro:'Piese originale'}), desc:t({fr:'Des pièces conformes aux préconisations du constructeur pour une fiabilité maximale.',en:'Parts compliant with manufacturer specifications for maximum reliability.',de:'Teile nach Herstellervorgaben für maximale Zuverlässigkeit.',es:'Piezas según las especificaciones del fabricante.',it:'Ricambi conformi alle specifiche del costruttore.',pt:'Peças conforme as especificações do fabricante.',ro:'Piese conforme specificațiilor producătorului pentru o fiabilitate maximă.'}) },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>

      <section style={{ position:'relative', height:isMobile?'50vh':'55vh', minHeight:380, display:'flex', alignItems:'center', overflow:'hidden', background:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 100%)' }}>
        <motion.div initial={{ opacity:0, scale:1.1 }} animate={{ opacity:1, scale:1 }} transition={{ duration:1.2 }} style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1800&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.2 }} style={{ position:'relative', zIndex:2, padding:isMobile?'0 5%':'0 7%', maxWidth:900 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(19,40,83,0.3)', border:'1px solid rgba(19,40,83,0.5)', borderRadius:4, padding:'8px 18px', marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#132853', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>
              {t({ fr:'Entretien & réparations', en:'Maintenance & repairs', de:'Wartung & Reparatur', es:'Mantenimiento y reparaciones', it:'Manutenzione e riparazioni', pt:'Manutenção e reparações',ro:'Întreținere și reparații' })}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:isMobile?'clamp(36px,8vw,64px)':'clamp(48px,6vw,88px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20 }}>
            {t({ fr:'Votre atelier\nautomobile', en:'Your auto\nworkshop', de:'Ihre Auto-\nwerkstatt', es:'Su taller\nautomóvil', it:'La vostra\nofficina', pt:'A sua oficina\nautomóvel',ro:'Atelierul tău\nauto' })}
          </h1>
          <p style={{ fontSize:isMobile?16:18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Toutes marques, toutes réparations. Pièces d\'origine, garantie sur les interventions et devis gratuit.', en:'All brands, all repairs. Original parts, warranty on work and free quotes.', de:'Alle Marken, alle Reparaturen. Originalteile, Garantie und kostenlose Angebote.', es:'Todas las marcas, todas las reparaciones. Piezas originales y presupuesto gratuito.', it:'Tutti i marchi, tutte le riparazioni. Ricambi originali e preventivo gratuito.', pt:'Todas as marcas, todas as reparações. Peças originais e orçamento gratuito.',ro:'Toate mărcile, toate reparațiile. Piese originale, garanție la intervenții și deviz gratuit.' })}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer" style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8 }}>
              💬 {t({ fr:'Prendre rendez-vous', en:'Book an appointment', de:'Termin vereinbaren', es:'Pedir cita', it:'Prenota un appuntamento', pt:'Marcar uma visita',ro:'Programează o vizită' })}
            </a>
            <Link to="/contact" style={{ background:'transparent', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8, border:'1px solid rgba(255,255,255,0.3)' }}>
              {t({ fr:'Nous contacter', en:'Contact us', de:'Kontakt', es:'Contáctenos', it:'Contattaci', pt:'Fale connosco',ro:'Contactează-ne' })}
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Nos services', en:'Our services', de:'Unsere Leistungen', es:'Nuestros servicios', it:'I nostri servizi', pt:'Os nossos serviços',ro:'Serviciile noastre' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:isMobile?28:40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Tout pour votre véhicule', en:'Everything for your vehicle', de:'Alles für Ihr Fahrzeug', es:'Todo para su vehículo', it:'Tutto per il vostro veicolo', pt:'Tudo para o seu veículo',ro:'Totul pentru vehiculul tău' })}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(4,1fr)', gap:20 }}>
            {services.map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:(i%4)*0.08 }} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:isMobile?22:26, boxShadow:C.shadow }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#132853,#0E1E3D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:16.5, color:C.text, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:C.text2, lineHeight:1.75, margin:0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background:C.card }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Nos engagements', en:'Our promises', de:'Unsere Versprechen', es:'Nuestros compromisos', it:'I nostri impegni', pt:'Os nossos compromissos',ro:'Angajamentele noastre' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:isMobile?28:40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'La confiance, en toute transparence', en:'Trust, in full transparency', de:'Vertrauen in voller Transparenz', es:'Confianza con total transparencia', it:'Fiducia in piena trasparenza', pt:'Confiança com total transparência',ro:'Încredere, în deplină transparență' })}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20 }}>
            {promises.map((p,i) => (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.08 }} style={{ textAlign:'center', background:C.bg, border:`1px solid ${C.border}`, borderRadius:18, padding:isMobile?28:36 }}>
                <div style={{ fontSize:38, marginBottom:14 }}>{p.icon}</div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:18, color:C.text, marginBottom:10 }}>{p.title}</h3>
                <p style={{ fontSize:13.5, color:C.text2, lineHeight:1.8, margin:0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }} style={{ maxWidth:1200, margin:'0 auto', background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderRadius:20, padding:isMobile?32:48, display:'flex', flexDirection:isMobile?'column':'row', alignItems:'center', gap:24, justifyContent:'space-between' }}>
          <div style={{ maxWidth:620 }}>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:isMobile?22:30, color:'#fff', marginBottom:12, letterSpacing:'-0.02em' }}>
              {t({ fr:'Un doute ? Un bruit suspect ?', en:'Not sure? A suspicious noise?', de:'Unsicher? Ein verdächtiges Geräusch?', es:'¿Duda? ¿Un ruido extraño?', it:'Un dubbio? Un rumore sospetto?', pt:'Alguma dúvida? Um ruído estranho?',ro:'Ai o îndoială? Un zgomot suspect?' })}
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>
              {t({ fr:'Confiez-nous votre véhicule. Diagnostic gratuit à l\'atelier, devis sous 24h.', en:'Entrust us with your vehicle. Free workshop diagnostics, quote within 24h.', de:'Vertrauen Sie uns Ihr Fahrzeug an. Kostenlose Diagnose, Angebot in 24h.', es:'Confíenos su vehículo. Diagnóstico gratuito en el taller.', it:'Affidateci il vostro veicolo. Diagnosi gratuita in officina.', pt:'Confie-nos o seu veículo. Diagnóstico gratuito na oficina.',ro:'Încredințează-ne vehiculul tău. Diagnostic gratuit în atelier, deviz în 24h.' })}
            </p>
          </div>
          <Link to="/contact" style={{ background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8, whiteSpace:'nowrap' }}>
            {t({ fr:'Prendre rendez-vous', en:'Book an appointment', de:'Termin vereinbaren', es:'Pedir cita', it:'Prenota un appuntamento', pt:'Marcar uma visita',ro:'Programează o vizită' })} →
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
