import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore, useToastStore } from '../store';

export default function Sell() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const { addToast } = useToastStore();
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

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    make: '', model: '', year: '', mileage: '', fuel: 'Essence', price: '', condition: 'Bon état', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const WA_NUMBER = '491630436338';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      addToast(t({ fr:'Veuillez indiquer votre nom et votre téléphone', en:'Please provide your name and phone', de:'Bitte geben Sie Namen und Telefon an', es:'Indique su nombre y teléfono', it:'Indicare nome e telefono', pt:'Indique o seu nome e telefone', ro:'Vă rugăm să indicați numele și numărul de telefon' }), 'error');
      return;
    }

    const waText = [
      `🚗 *Demande d'estimation — Automatik Gebrauchtwagen*`,
      ``,
      `Nom : ${form.name}`,
      `Téléphone : ${form.phone}`,
      `Email : ${form.email || '—'}`,
      ``,
      `Véhicule : ${form.make} ${form.model}`,
      `Année : ${form.year || '—'}`,
      `Kilométrage : ${form.mileage ? form.mileage + ' km' : '—'}`,
      `Carburant : ${form.fuel}`,
      `État : ${form.condition}`,
      `Prix souhaité : ${form.price ? form.price + ' €' : '—'}`,
      form.notes ? `Commentaires : ${form.notes}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');

    setSubmitting(true);
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sell',
        name: form.name,
        email: form.email,
        phone: form.phone,
        make: form.make,
        model: form.model,
        year: form.year,
        mileage: form.mileage,
        fuel: form.fuel,
        price: form.price,
        condition: form.condition,
        notes: form.notes,
      }),
    })
      .then((res) => {
        setSubmitting(false);
        if (!res.ok) throw new Error();
        addToast(t({ fr:'Demande envoyée ! Notre équipe vous contactera rapidement.', en:'Request sent! Our team will contact you shortly.', de:'Anfrage gesendet! Unser Team meldet sich schnellstmöglich.', es:'¡Solicitud enviada! Nuestro equipo se pondrá en contacto.', it:'Richiesta inviata! Il nostro team vi contatterà presto.', pt:'Pedido enviado! A nossa equipa entrará em contacto.', ro:'Cerere trimisă! Echipa noastră vă va contacta în curând.' }), 'success');
        setForm({ name: '', email: '', phone: '', make: '', model: '', year: '', mileage: '', fuel: 'Essence', price: '', condition: 'Bon état', notes: '' });
      })
      .catch(() => {
        setSubmitting(false);
        addToast(t({ fr:'Envoi impossible, votre message WhatsApp s\'est ouvert — finalisez-le pour nous joindre.', en:'Sending failed, your WhatsApp message opened — complete it to reach us.', de:'Senden fehlgeschlagen — Ihre WhatsApp-Nachricht wurde geöffnet, bitte abschließen.', es:'No se pudo enviar, su mensaje de WhatsApp se abrió — complételo para contactarnos.', it:'Invio non riuscito, il messaggio WhatsApp si è aperto — completatelo per contattarci.', pt:'Envio falhado, a sua mensagem WhatsApp abriu — conclua-a para nos contactar.', ro:'Trimiterea a eșuat, mesajul WhatsApp s-a deschis — finalizați-l pentru a ne contacta.' }), 'error');
      });
  };

  const steps = [
    { icon: '📸', title: t({ fr:'Photos & informations', en:'Photos & information', de:'Fotos & Informationen', es:'Fotos e información', it:'Foto e informazioni', pt:'Fotos e informações', ro:'Fotografii și informații' }), desc: t({ fr:'Décrivez votre véhicule : marque, modèle, année, kilométrage, état.', en:'Describe your vehicle: brand, model, year, mileage, condition.', de:'Beschreiben Sie Ihr Fahrzeug: Marke, Modell, Jahr, Kilometerstand, Zustand.', es:'Describa su vehículo: marca, modelo, año, kilometraje, estado.', it:'Descrivete il vostro veicolo: marca, modello, anno, chilometraggio, stato.', pt:'Descreva o seu veículo: marca, modelo, ano, quilometragem, estado.', ro:'Descrieți vehiculul dumneavoastră: marcă, model, an, kilometraj, stare.' }) },
    { icon: '💶', title: t({ fr:'Estimation gratuite', en:'Free estimation', de:'Kostenlose Bewertung', es:'Estimación gratuita', it:'Stima gratuita', pt:'Estimativa gratuita', ro:'Estimare gratuită' }), desc: t({ fr:'Recevez une offre indicative sous 24h, basée sur le marché actuel.', en:'Receive an indicative offer within 24h, based on the current market.', de:'Erhalten Sie innerhalb von 24h ein Angebot auf Basis des aktuellen Marktes.', es:'Reciba una oferta indicativa en 24h, basada en el mercado actual.', it:'Ricevi un\'offerta indicativa entro 24h, basata sul mercato attuale.', pt:'Receba uma oferta indicativa em 24h, baseada no mercado atual.', ro:'Primiți o ofertă orientativă în 24h, bazată pe piața actuală.' }) },
    { icon: '🤝', title: t({ fr:'Vente rapide & sécurisée', en:'Fast & secure sale', de:'Schneller & sicherer Verkauf', es:'Venta rápida y segura', it:'Vendita rapida e sicura', pt:'Venda rápida e segura', ro:'Vânzare rapidă și sigură' }), desc: t({ fr:'Paiement immédiat et reprise de votre véhicule où que vous soyez en Europe.', en:'Immediate payment and vehicle collection anywhere in Europe.', de:'Sofortzahlung und Abholung Ihres Fahrzeugs in ganz Europa.', es:'Pago inmediato y recogida de su vehículo en toda Europa.', it:'Pagamento immediato e ritiro del veicolo in tutta Europa.', pt:'Pagamento imediato e recolha do veículo em toda a Europa.', ro:'Plată imediată și preluarea vehiculului oriunde v-ați afla în Europa.' }) },
  ];

  const reasons = [
    { icon: '⚡', title: t({ fr:'Offre en 24h', en:'Offer within 24h', de:'Angebot in 24h', es:'Oferta en 24h', it:'Offerta entro 24h', pt:'Oferta em 24h', ro:'Ofertă în 24h' }) },
    { icon: '💶', title: t({ fr:'Paiement immédiat', en:'Immediate payment', de:'Sofortzahlung', es:'Pago inmediato', it:'Pagamento immediato', pt:'Pagamento imediato', ro:'Plată imediată' }) },
    { icon: '🌍', title: t({ fr:'Reprise dans toute l\'Europe', en:'Collection across Europe', de:'Abholung in ganz Europa', es:'Recogida en toda Europa', it:'Ritiro in tutta Europa', pt:'Recolha em toda a Europa', ro:'Preluare în toată Europa' }) },
    { icon: '🔒', title: t({ fr:'Transaction sécurisée', en:'Secure transaction', de:'Sichere Transaktion', es:'Transacción segura', it:'Transazione sicura', pt:'Transação segura', ro:'Tranzacție securizată' }) },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>

      {/* Hero */}
      <section style={{
        position:'relative', height: isMobile ? '60vh' : '70vh', minHeight:500,
        display:'flex', alignItems:'center', overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <motion.div
          initial={{ opacity:0, scale:1.1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.2 }}
          style={{
            position:'absolute', inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=80)',
            backgroundSize:'cover', backgroundPosition:'center', opacity:0.25
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
              {t({ fr:'Vendre mon véhicule', en:'Sell my vehicle', de:'Fahrzeug verkaufen', es:'Vender mi vehículo', it:'Vendi il tuo veicolo', pt:'Vender o meu veículo', ro:'Vindeți vehiculul meu' })}
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)',
            color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20
          }}>
            {t({ fr:'Vendez votre voiture\nau meilleur prix', en:'Sell your car\nat the best price', de:'Verkaufen Sie Ihr Auto\nzum besten Preis', es:'Venda su coche\nal mejor precio', it:'Vendete la tua auto\nal miglior prezzo', pt:'Venda o seu carro\npelo melhor preço', ro:'Vindeți-vă mașina\nla cel mai bun preț' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Estimation gratuite et sans engagement. Notre équipe évalue votre véhicule et vous propose la meilleure offre en 24h.', en:'Free, no-obligation estimate. Our team evaluates your vehicle and offers the best deal within 24h.', de:'Kostenlose und unverbindliche Bewertung. Unser Team bewertet Ihr Fahrzeug und bietet das beste Angebot innerhalb von 24h.', es:'Estimación gratuita y sin compromiso. Nuestro equipo evalúa su vehículo y le ofrece la mejor oferta en 24h.', it:'Stima gratuita e senza impegno. Il nostro team valuta il veicolo e propone la migliore offerta entro 24h.', pt:'Estimativa gratuita e sem compromisso. A nossa equipa avalia o seu veículo e oferece a melhor oferta em 24h.', ro:'Estimare gratuită și fără obligații. Echipa noastră evaluează vehiculul dumneavoastră și vă oferă cea mai bună ofertă în 24h.' })}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href="#form" style={{
              background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px',
              borderRadius:8, display:'inline-flex', alignItems:'center', gap:8,
              boxShadow:'0 4px 16px rgba(19,40,83,0.4)'
            }}>
              {t({ fr:'Estimer mon véhicule', en:'Estimate my vehicle', de:'Fahrzeug bewerten', es:'Estimar mi vehículo', it:'Stima il mio veicolo', pt:'Estimar o meu veículo', ro:'Estimează vehiculul meu' })} →
            </a>
            <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{
              background:'rgba(255,255,255,0.1)', color:'#fff', textDecoration:'none',
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:14, fontWeight:700, padding:'14px 28px',
              borderRadius:8, border:'1px solid rgba(255,255,255,0.3)', display:'inline-flex', alignItems:'center', gap:8
            }}>
              💬 WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
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
              {t({ fr:'COMMENT ÇA MARCHE ?', en:'HOW IT WORKS?', de:'SO FUNKTIONIERT ES', es:'¿CÓMO FUNCIONA?', it:'COME FUNZIONA?', pt:'COMO FUNCIONA?', ro:'CUM FUNCȚIONEAZĂ?' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'3 étapes simples', en:'3 simple steps', de:'3 einfache Schritte', es:'3 pasos sencillos', it:'3 semplici passaggi', pt:'3 passos simples', ro:'3 pași simpli' })}
            </h2>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:20 }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{
                  background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28,
                  boxShadow:C.shadow, transition:'all 0.3s'
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.4)'; e.currentTarget.style.transform='translateY(-4px)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none';}}
              >
                <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:16 }}>
                  {step.icon}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:14, color:'#fff', background:'#132853', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                  <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:18, color:C.text }}>{step.title}</h3>
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.7 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Estimation form */}
      <section id="form" style={{ background:C.card2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ textAlign:'center', marginBottom:48 }}
          >
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {t({ fr:'ESTIMATION GRATUITE', en:'FREE ESTIMATION', de:'KOSTENLOSE BEWERTUNG', es:'ESTIMACIÓN GRATUITA', it:'STIMA GRATUITA', pt:'ESTIMATIVA GRATUITA', ro:'ESTIMARE GRATUITĂ' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Décrivez votre véhicule', en:'Describe your vehicle', de:'Beschreiben Sie Ihr Fahrzeug', es:'Describa su vehículo', it:'Descrivete il vostro veicolo', pt:'Descreva o seu veículo', ro:'Descrieți vehiculul dumneavoastră' })}
            </h2>
          </motion.div>

          <motion.form
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.1 }}
            onSubmit={handleSubmit}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding: isMobile ? 24 : 40, boxShadow:C.shadow }}
          >
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Marque *', en:'Brand *', de:'Marke *', es:'Marca *', it:'Marca *', pt:'Marca *', ro:'Marcă *' })}
                </label>
                <input value={form.make} onChange={set('make')} placeholder="BMW, Audi, Mercedes..."
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Modèle *', en:'Model *', de:'Modell *', es:'Modelo *', it:'Modello *', pt:'Modelo *', ro:'Model *' })}
                </label>
                <input value={form.model} onChange={set('model')} placeholder="Série 3, A4, Classe C..."
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Année', en:'Year', de:'Jahr', es:'Año', it:'Anno', pt:'Ano', ro:'An' })}
                </label>
                <input value={form.year} onChange={set('year')} type="number" placeholder="2022"
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Kilométrage', en:'Mileage', de:'Kilometerstand', es:'Kilometraje', it:'Chilometraggio', pt:'Quilometragem', ro:'Kilometraj' })}
                </label>
                <input value={form.mileage} onChange={set('mileage')} type="number" placeholder="45000"
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Carburant', en:'Fuel', de:'Kraftstoff', es:'Combustible', it:'Carburante', pt:'Combustível', ro:'Carburant' })}
                </label>
                <select value={form.fuel} onChange={set('fuel')}
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }}>
                  {['Essence','Diesel','Electrique','Hybride'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'État', en:'Condition', de:'Zustand', es:'Estado', it:'Stato', pt:'Estado', ro:'Stare' })}
                </label>
                <select value={form.condition} onChange={set('condition')}
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }}>
                  {['Neuf','Très bon état','Bon état','Correct','À réparer'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Prix souhaité (€)', en:'Desired price (€)', de:'Wunschpreis (€)', es:'Precio deseado (€)', it:'Prezzo desiderato (€)', pt:'Preço desejado (€)', ro:'Preț dorit (€)' })}
                </label>
                <input value={form.price} onChange={set('price')} type="number" placeholder="12000"
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Nom *', en:'Name *', de:'Name *', es:'Nombre *', it:'Nome *', pt:'Nome *', ro:'Nume *' })}
                </label>
                <input value={form.name} onChange={set('name')} placeholder="Jean Dupont"
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Email', en:'Email', de:'E-Mail', es:'Email', it:'Email', pt:'Email', ro:'Email' })}
                </label>
                <input value={form.email} onChange={set('email')} type="email" placeholder="jean@email.com"
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                  {t({ fr:'Téléphone *', en:'Phone *', de:'Telefon *', es:'Teléfono *', it:'Telefono *', pt:'Telefone *', ro:'Telefon *' })}
                </label>
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+49 ..."
                  style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>
                {t({ fr:'Commentaires', en:'Comments', de:'Anmerkungen', es:'Comentarios', it:'Commenti', pt:'Comentários', ro:'Comentarii' })}
              </label>
              <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Historique, options, travaux effectués..."
                style={{ width:'100%', boxSizing:'border-box', resize:'none', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none', lineHeight:1.6 }} />
            </div>
            <button type="submit" disabled={submitting} style={{
              width:'100%', padding:'18px 36px', background:'linear-gradient(135deg,#132853,#0E1E3D)',
              color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700,
              fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", cursor:'pointer', letterSpacing:'0.05em',
              boxShadow:'0 4px 16px rgba(19,40,83,0.3)', opacity: submitting ? 0.6 : 1,
              transition:'all 0.3s'
            }}>
              {submitting
                ? t({ fr:'Envoi en cours...', en:'Sending...', de:'Wird gesendet...', es:'Enviando...', it:'Invio...', pt:'A enviar...', ro:'Se trimite...' })
                : t({ fr:'Envoyer ma demande d\'estimation', en:'Send my estimation request', de:'Bewertungsanfrage senden', es:'Enviar mi solicitud de estimación', it:'Invia la richiesta di stima', pt:'Enviar o meu pedido de estimativa', ro:'Trimiteți cererea mea de estimare' })}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Why sell with us */}
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
              {t({ fr:'POURQUOI NOUS ?', en:'WHY US?', de:'WARUM WIR?', es:'¿POR QUÉ NOSOTROS?', it:'PERCHÉ NOI?', pt:'PORQUÊ NÓS?', ro:'DE CE NOI?' })}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:C.text, letterSpacing:'-0.02em' }}>
              {t({ fr:'Vendez en toute confiance', en:'Sell with confidence', de:'Sicher verkaufen', es:'Venda con confianza', it:'Vendete in sicurezza', pt:'Venda com confiança', ro:'Vindeți cu încredere' })}
            </h2>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:20 }}>
            {reasons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5 }}
                style={{ textAlign:'center', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, boxShadow:C.shadow }}
              >
                <div style={{ fontSize:36, marginBottom:12 }}>{item.icon}</div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:C.text }}>{item.title}</h3>
              </motion.div>
            ))}
          </div>
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
              {t({ fr:'Une question sur la vente ?', en:'A question about selling?', de:'Fragen zum Verkauf?', es:'¿Preguntas sobre la venta?', it:'Domande sulla vendita?', pt:'Perguntas sobre a venda?', ro:'Aveți o întrebare despre vânzare?' })}
            </h2>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{
                background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8,
                boxShadow:'0 4px 16px rgba(37,211,102,0.3)'
              }}>
                💬 WhatsApp
              </a>
              <a href="mailto:kontakt@automatikgebrauchtwagen.com" style={{
                background:'rgba(255,255,255,0.1)', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                fontSize:14, fontWeight:700, padding:'14px 28px', borderRadius:8, border:'1px solid rgba(255,255,255,0.3)', display:'inline-flex', alignItems:'center', gap:8
              }}>
                ✉ kontakt@automatikgebrauchtwagen.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
