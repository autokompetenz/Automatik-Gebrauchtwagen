import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore } from '../store';

export default function Delivery() {
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

  const steps = [
    { icon: '🛒', title: t({ fr:'Achat & confirmation', en:'Purchase & confirmation', de:'Kauf & Bestätigung', es:'Compra y confirmación', it:'Acquisto e conferma', pt:'Compra e confirmação', ro:'Cumpărare și confirmare' }),
      desc: t({ fr:'Vous sélectionnez votre véhicule et validez votre commande. Un conseiller vous contacte sous 24h pour confirmer et organiser la livraison.', en:'You select your vehicle and validate your order. An advisor contacts you within 24h to confirm and arrange delivery.', de:'Sie wählen Ihr Fahrzeug und bestätigen die Bestellung. Ein Berater meldet sich innerhalb von 24h.', es:'Selecciona su vehículo y confirma el pedido. Un asesor le contacta en 24h.', it:'Selezionate il veicolo e confermate l\'ordine. Un consulente vi contatta entro 24h.', pt:'Seleciona o veículo e confirma a encomenda. Um consultor contacta-o em 24h.', ro:'Selectați vehiculul și validați comanda. Un consultant vă contactează în termen de 24h pentru a confirma și organiza livrarea.' }) },
    { icon: '🔧', title: t({ fr:'Préparation en atelier', en:'Workshop preparation', de:'Werkstatt-Aufbereitung', es:'Preparación en taller', it:'Preparazione in officina', pt:'Preparação em oficina', ro:'Pregătire în atelier' }),
      desc: t({ fr:'Le véhicule est contrôlé, nettoyé et ravitaillé dans notre atelier. Les documents (carte grise, contrôle technique) sont préparés à votre nom.', en:'The vehicle is checked, cleaned and refueled in our workshop. Documents (registration, inspection) are prepared in your name.', de:'Das Fahrzeug wird geprüft, gereinigt und vollgetankt. Dokumente werden auf Ihren Namen vorbereitet.', es:'El vehículo se revisa, limpia y reposta. Los documentos se preparan a su nombre.', it:'Il veicolo viene controllato, pulito e rifornito. I documenti sono preparati a vostro nome.', pt:'O veículo é verificado, limpo e abastecido. Os documentos são preparados em seu nome.', ro:'Vehiculul este verificat, curățat și alimentat în atelierul nostru. Documentele (certificatul de înmatriculare, inspecția tehnică) sunt pregătite pe numele dumneavoastră.' }) },
    { icon: '🚚', title: t({ fr:'Livraison en 48h', en:'Delivery within 48h', de:'Lieferung in 48h', es:'Entrega en 48h', it:'Consegna in 48h', pt:'Entrega em 48h', ro:'Livrare în 48h' }),
      desc: t({ fr:'Votre véhicule est livré à votre porte, partout en Europe. Vous recevez les clés, les documents et le plein d\'essence.', en:'Your vehicle is delivered to your door, anywhere in Europe. You receive the keys, documents and a full tank.', de:'Ihr Fahrzeug wird europaweit vor Ihre Tür geliefert. Schlüssel, Dokumente und voller Tank.', es:'Su vehículo se entrega a su puerta en toda Europa. Llaves, documentos y depósito lleno.', it:'Il veicolo viene consegnato a domicilio in tutta Europa. Chiavi, documenti e pieno.', pt:'O veículo é entregue à sua porta em toda a Europa. Chaves, documentos e depósito cheio.', ro:'Vehiculul dumneavoastră este livrat la ușă, oriunde în Europa. Primiți cheile, documentele și rezervorul plin.' }) },
    { icon: '✅', title: t({ fr:'Réception du véhicule', en:'Vehicle reception', de:'Fahrzeugübergabe', es:'Recepción del vehículo', it:'Ritiro del veicolo', pt:'Receção do veículo', ro:'Recepția vehiculului' }),
      desc: t({ fr:'Vous vérifiez le véhicule avec le livreur. En cas d\'écart, signalez-le dans les 48h : nous le prenons en charge immédiatement.', en:'You inspect the vehicle with the driver. In case of discrepancy, report it within 48h: we handle it immediately.', de:'Sie prüfen das Fahrzeug mit dem Fahrer. Bei Abweichungen melden Sie es innerhalb von 48h.', es:'Comprueba el vehículo con el repartidor. Si hay diferencia, repórtela en 48h.', it:'Verificate il veicolo con l\'autista. In caso di differenze, segnalatele entro 48h.', pt:'Verifica o veículo com o motorista. Em caso de diferença, reporte em 48h.', ro:'Verificați vehiculul împreună cu livratorul. În caz de neconformitate, semnalați-o în 48h: ne ocupăm imediat de ea.' }) },
  ];

  const countries = [
    { flag: '🇫🇷', name: 'France', time: '48h' },
    { flag: '🇩🇪', name: 'Allemagne', time: '24-48h' },
    { flag: '🇧🇪', name: 'Belgique', time: '48h' },
    { flag: '🇳🇱', name: 'Pays-Bas', time: '48h' },
    { flag: '🇱🇺', name: 'Luxembourg', time: '48h' },
    { flag: '🇨🇭', name: 'Suisse', time: '48-72h' },
    { flag: '🇮🇹', name: 'Italie', time: '72h' },
    { flag: '🇪🇸', name: 'Espagne', time: '72h' },
    { flag: '🇵🇹', name: 'Portugal', time: '96h' },
    { flag: '🇦🇹', name: 'Autriche', time: '48h' },
    { flag: '🇬🇧', name: 'Royaume-Uni', time: '72h' },
    { flag: '🇵🇱', name: 'Pologne', time: '72h' },
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
            backgroundImage:'url(https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1800&q=80)',
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
              {t({ fr:'Livraison', en:'Delivery', de:'Lieferung', es:'Entrega', it:'Consegna', pt:'Entrega', ro:'Livrare' })}
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)',
            color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20
          }}>
            {t({ fr:'Votre véhicule,\nlivré en 48h', en:'Your vehicle,\ndelivered in 48h', de:'Ihr Fahrzeug,\ngeliefert in 48h', es:'Su vehículo,\nentregado en 48h', it:'Il vostro veicolo,\nconsegnato in 48h', pt:'O seu veículo,\nentregue em 48h', ro:'Vehiculul dumneavoastră,\nlivrat în 48h' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Démarches administratives complètes, livraison à domicile partout en Europe. Clé en main, documents conformes.', en:'Complete administrative formalities, home delivery across Europe. Turnkey, compliant documents.', de:'Komplette Formalitäten, Hauslieferung in ganz Europa. Schlüsselfertig, alle Dokumente.', es:'Trámites completos, entrega a domicilio en toda Europa. Llave en mano.', it:'Formalità complete, consegna a domicilio in tutta Europa. Chiavi in mano.', pt:'Formalidades completas, entrega ao domicílio em toda a Europa. Chave na mão.', ro:'Formalități administrative complete, livrare la domiciliu oriunde în Europa. Cheie în mână, documente conforme.' })}
          </p>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Comment ça marche', en:'How it works', de:'So funktioniert\'s', es:'Cómo funciona', it:'Come funziona', pt:'Como funciona', ro:'Cum funcționează' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'4 étapes jusqu\'à votre porte', en:'4 steps to your door', de:'4 Schritte bis vor Ihre Tür', es:'4 pasos hasta su puerta', it:'4 passi fino a casa', pt:'4 passos até à sua porta', ro:'4 pași până la ușa dumneavoastră' })}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:20 }}>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.1 }}
                style={{ position:'relative', background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding: isMobile ? 24 : 28, boxShadow:C.shadow }}
              >
                <div style={{ position:'absolute', top:20, right:20, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:40, color:C.card2, lineHeight:1 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#132853,#0E1E3D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:17, color:C.text, marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:C.text2, lineHeight:1.8, margin:0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries / délais */}
      <section className="section-pad" style={{ background:C.card }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow">{t({ fr:'Europe entière', en:'Across Europe', de:'Ganz Europa', es:'Toda Europa', it:'Tutta Europa', pt:'Toda a Europa', ro:'Întreaga Europă' })}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 28 : 40, color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Délais de livraison indicatifs', en:'Indicative delivery times', de:'Indikative Lieferzeiten', es:'Plazos de entrega orientativos', it:'Tempi di consegna indicativi', pt:'Prazos de entrega indicativos', ro:'Termene de livrare orientative' })}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:14 }}>
            {countries.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:20 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.4, delay:(i%4)*0.06 }}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:22 }}>{c.flag}</span>
                  <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:14, color:C.text }}>{c.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'#132853', background:'rgba(19,40,83,0.1)', padding:'4px 10px', borderRadius:6, whiteSpace:'nowrap' }}>⏱ {c.time}</span>
              </motion.div>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:12.5, color:C.text3, marginTop:20, maxWidth:700, marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }}>
            {t({ fr:'* Les délais sont donnés à titre indicatif et dépendent de la destination et du planning des transporteurs. Un délai précis est confirmé lors de la commande.', en:'* Times are indicative and depend on the destination and carrier schedule. An exact time is confirmed at order.', de:'* Die Zeiten sind Richtwerte und hängen vom Zielort ab. Eine genaue Zeit wird bei der Bestellung bestätigt.', es:'* Los plazos son orientativos. Un plazo exacto se confirma al hacer el pedido.', it:'* I tempi sono indicativi. Un termine esatto viene confermato all\'ordine.', pt:'* Os prazos são indicativos. Um prazo exato é confirmado na encomenda.', ro:'* Termenele sunt orientative și depind de destinație și de programul transportatorilor. Un termen exact este confirmat la comandă.' })}
          </p>
        </div>
      </section>

      {/* Included */}
      <section className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>
          <motion.div
            initial={{ opacity:0, x:-40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding: isMobile ? 24 : 36, boxShadow:C.shadow }}
          >
            <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 20 : 24, color:C.text, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              ✅ {t({ fr:'Inclus dans la livraison', en:'Included in delivery', de:'In der Lieferung enthalten', es:'Incluido en la entrega', it:'Incluso nella consegna', pt:'Incluído na entrega', ro:'Inclus în livrare' })}
            </h3>
            {[
              { icon:'📄', txt:t({ fr:'Carte grise établie à votre nom', en:'Registration made out to you', de:'Zulassung auf Ihren Namen', es:'Documentos a su nombre', it:'Carta di circolazione a vostro nome', pt:'Documentos em seu nome', ro:'Certificat de înmatriculare pe numele dumneavoastră' }) },
              { icon:'🔍', txt:t({ fr:'Contrôle technique à jour', en:'Valid technical inspection', de:'Aktueller TÜV', es:'ITV al día', it:'Revisione aggiornata', pt:'Inspeção atualizada', ro:'Inspecție tehnică valabilă' }) },
              { icon:'🚿', txt:t({ fr:'Véhicule nettoyé et désinfecté', en:'Cleaned and disinfected vehicle', de:'Gereinigtes und desinfiziertes Fahrzeug', es:'Vehículo limpio y desinfectado', it:'Veicolo pulito e igienizzato', pt:'Veículo limpo e desinfetado', ro:'Vehicul curățat și dezinfectat' }) },
              { icon:'⛽', txt:t({ fr:'Plein de carburant offert', en:'Full tank of fuel included', de:'Voller Tank inklusive', es:'Depósito lleno incluido', it:'Pieno di carburante incluso', pt:'Depósito cheio incluído', ro:'Rezervor plin de combustibil inclus' }) },
              { icon:'🛡️', txt:t({ fr:'Garantie 12 mois incluse', en:'12-month warranty included', de:'12 Monate Garantie inklusive', es:'Garantía de 12 meses incluida', it:'Garanzia 12 mesi inclusa', pt:'Garantia de 12 meses incluída', ro:'Garanție de 12 luni inclusă' }) },
            ].map((row, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderTop:`1px solid ${C.border}` }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{row.icon}</span>
                <span style={{ fontSize:14, color:C.text2, fontWeight:500 }}>{row.txt}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderRadius:18, padding: isMobile ? 24 : 36, boxShadow:C.shadow, display:'flex', flexDirection:'column', justifyContent:'center', gap:20 }}
          >
            <div style={{ fontSize:40 }}>🚚</div>
            <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 26, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
              {t({ fr:'Organisez votre livraison', en:'Arrange your delivery', de:'Organisieren Sie Ihre Lieferung', es:'Organice su entrega', it:'Organizzate la consegna', pt:'Organize a sua entrega', ro:'Organizați-vă livrarea' })}
            </h3>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>
              {t({ fr:'Un conseiller dédié s\'occupe de tout : transport, assurance, immatriculation. Vous n\'avez qu\'à réceptionner les clés.', en:'A dedicated advisor handles everything: transport, insurance, registration. You just receive the keys.', de:'Ein persönlicher Berater kümmert sich um alles: Transport, Versicherung, Zulassung. Sie erhalten nur die Schlüssel.', es:'Un asesor dedicado se encarga de todo. Usted solo recibe las llaves.', it:'Un consulente dedicato si occupa di tutto. Voi ricevete solo le chiavi.', pt:'Um consultor dedicado trata de tudo. Só recebe as chaves.', ro:'Un consultant dedicat se ocupă de tot: transport, asigurare, înmatriculare. Voi trebuie doar să primiți cheile.' })}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link to="/contact" style={{ background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'13px 26px', borderRadius:8 }}>
                {t({ fr:'Demander un devis', en:'Request a quote', de:'Angebot anfordern', es:'Solicitar presupuesto', it:'Richiedi preventivo', pt:'Pedir orçamento', ro:'Cereți o ofertă' })} →
              </Link>
              <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'13px 26px', borderRadius:8 }}>
                💬 WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
