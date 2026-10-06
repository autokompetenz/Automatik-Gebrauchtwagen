import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLangStore, useToastStore } from '../store';

export default function Contact() {
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

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const WA_NUMBER = '491630436338';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      addToast(t({ fr:'Veuillez remplir votre nom et votre message', en:'Please fill in your name and message', de:'Bitte Namen und Nachricht ausfüllen', es:'Rellene su nombre y mensaje', it:'Compilare nome e messaggio', pt:'Preencha o nome e a mensagem', ro:'Vă rugăm să completați numele și mesajul' }), 'error');
      return;
    }

    const waText = [
      `💬 *Nouveau message — Automatik Gebrauchtwagen*`,
      ``,
      `Nom : ${form.name}`,
      `Email : ${form.email || '—'}`,
      `Téléphone : ${form.phone || '—'}`,
      `Sujet : ${form.subject || '—'}`,
      ``,
      form.message,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');

    setSubmitting(true);
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'contact',
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      }),
    })
      .then((res) => {
        setSubmitting(false);
        if (!res.ok) throw new Error();
        addToast(t({ fr:'Message envoyé ! Nous vous répondrons rapidement.', en:'Message sent! We will reply shortly.', de:'Nachricht gesendet! Wir antworten schnellstmöglich.', es:'¡Mensaje enviado! Responderemos pronto.', it:'Messaggio inviato! Risponderemo presto.', pt:'Mensagem enviada! Responderemos em breve.', ro:'Mesaj trimis! Vă răspundem în cel mai scurt timp.' }), 'success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      })
      .catch(() => {
        setSubmitting(false);
        addToast(t({ fr:'Envoi impossible, votre message WhatsApp s\'est ouvert — finalisez-le pour nous joindre.', en:'Sending failed, your WhatsApp message opened — complete it to reach us.', de:'Senden fehlgeschlagen — Ihre WhatsApp-Nachricht wurde geöffnet, bitte abschließen.', es:'No se pudo enviar, su mensaje de WhatsApp se abrió — complételo para contactarnos.', it:'Invio non riuscito, il messaggio WhatsApp si è aperto — completatelo per contattarci.', pt:'Envio falhado, a sua mensagem WhatsApp abriu — conclua-a para nos contactar.', ro:'Trimiterea nu a reușit, mesajul dvs. WhatsApp s-a deschis — finalizați-l pentru a ne contacta.' }), 'error');
      });
  };

  const contactCards = [
    { icon: '📍', title: t({ fr:'Adresse', en:'Address', de:'Adresse', es:'Dirección', it:'Indirizzo', pt:'Morada', ro:'Adresă' }), lines: ['Franz-Julius-Haenel-Str. 3', '06618 Naumburg, Allemagne'] },
    { icon: '📞', title: t({ fr:'Téléphone', en:'Phone', de:'Telefon', es:'Teléfono', it:'Telefono', pt:'Telefone', ro:'Telefon' }), lines: ['+49 163 043 63 38', t({ fr:'Lun–Ven 9h–18h', en:'Mon–Fri 9am–6pm', de:'Mo–Fr 9–18 Uhr', es:'Lun–Vie 9–18h', it:'Lun–Ven 9–18', pt:'Seg–Sex 9–18h', ro:'Lun–Vin 9–18h' })] },
    { icon: '✉', title: t({ fr:'Email', en:'Email', de:'E-Mail', es:'Email', it:'Email', pt:'Email', ro:'Email' }), lines: ['kontakt@automatikgebrauchtwagen.com', t({ fr:'Réponse sous 24h', en:'Reply within 24h', de:'Antwort innerhalb von 24h', es:'Respuesta en 24h', it:'Risposta entro 24h', pt:'Resposta em 24h', ro:'Răspuns în 24h' })] },
    { icon: '💬', title: 'WhatsApp', lines: ['+49 163 043 63 38', t({ fr:'Réponse immédiate', en:'Immediate reply', de:'Sofortige Antwort', es:'Respuesta inmediata', it:'Risposta immediata', pt:'Resposta imediata', ro:'Răspuns imediat' })] },
  ];

  const subjects = [
    t({ fr:'Demande d\'information', en:'General enquiry', de:'Allgemeine Anfrage', es:'Consulta general', it:'Richiesta di informazioni', pt:'Pedido de informação', ro:'Cerere de informații' }),
    t({ fr:'Achat de véhicule', en:'Vehicle purchase', de:'Fahrzeugkauf', es:'Compra de vehículo', it:'Acquisto veicolo', pt:'Compra de veículo', ro:'Achiziție de vehicul' }),
    t({ fr:'Vente / Estimation', en:'Sell / Estimate', de:'Verkauf / Bewertung', es:'Venta / Estimación', it:'Vendita / Stima', pt:'Venda / Estimativa', ro:'Vânzare / Evaluare' }),
    t({ fr:'Financement', en:'Financing', de:'Finanzierung', es:'Financiación', it:'Finanziamento', pt:'Financiamento', ro:'Finanțare' }),
    t({ fr:'Garantie & Après-vente', en:'Warranty & After-sales', de:'Garantie & Kundendienst', es:'Garantía y posventa', it:'Garanzia e post-vendita', pt:'Garantia e pós-venda', ro:'Garanție & servicii post-vânzare' }),
    t({ fr:'Autre', en:'Other', de:'Sonstiges', es:'Otro', it:'Altro', pt:'Outro', ro:'Altele' }),
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, paddingTop:76 }}>

      {/* Hero */}
      <section style={{
        position:'relative', height: isMobile ? '55vh' : '60vh', minHeight:420,
        display:'flex', alignItems:'center', overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <motion.div
          initial={{ opacity:0, scale:1.1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1.2 }}
          style={{
            position:'absolute', inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1800&q=80)',
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
              {t({ fr:'Nous contacter', en:'Contact us', de:'Kontakt', es:'Contáctenos', it:'Contattaci', pt:'Fale connosco', ro:'Contactați-ne' })}
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
            fontSize: isMobile ? 'clamp(36px,8vw,64px)' : 'clamp(48px,6vw,88px)',
            color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20
          }}>
            {t({ fr:'Contactez\nnotre équipe', en:'Contact\nour team', de:'Kontaktieren Sie\nunser Team', es:'Contacte a\nnuestro equipo', it:'Contattate\nil nostro team', pt:'Contacte\na nossa equipa', ro:'Contactați\nechipa noastră' })}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,0.7)', lineHeight:1.7, maxWidth:600, marginBottom:32 }}>
            {t({ fr:'Une question, un projet d\'achat ou de vente ? Notre équipe est à votre écoute.', en:'A question, a purchase or sale project? Our team is here for you.', de:'Fragen, Kauf- oder Verkaufsprojekt? Unser Team ist für Sie da.', es:'¿Una pregunta, proyecto de compra o venta? Nuestro equipo está a su disposición.', it:'Domande, progetto di acquisto o vendita? Il nostro team è a vostra disposizione.', pt:'Perguntas, projeto de compra ou venda? A nossa equipa está ao seu dispor.', ro:'Aveți o întrebare, un proiect de achiziție sau de vânzare? Echipa noastră vă stă la dispoziție.' })}
          </p>
        </motion.div>
      </section>

      {/* Contact cards */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:20, marginBottom:56 }}>
            {contactCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.08, duration:0.5 }}
                style={{ textAlign:'center', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, boxShadow:C.shadow, transition:'all 0.3s' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.4)'; e.currentTarget.style.transform='translateY(-4px)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none';}}
              >
                <div style={{ width:56, height:56, margin:'0 auto 16px', borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:C.text, marginBottom:8 }}>{card.title}</h3>
                {card.lines.map((line, j) => (
                  <p key={j} style={{ fontSize:13, color:C.text2, lineHeight:1.6, fontWeight: line.startsWith('+') || line.includes('@') ? 700 : 500 }}>
                    {line}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:32, alignItems:'start' }}>

            {/* Form */}
            <motion.form
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.6 }}
              onSubmit={handleSubmit}
              style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding: isMobile ? 24 : 36, boxShadow:C.shadow }}
            >
              <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:26, color:C.text, marginBottom:8 }}>
                {t({ fr:'Envoyez-nous un message', en:'Send us a message', de:'Schreiben Sie uns', es:'Envíenos un mensaje', it:'Inviateci un messaggio', pt:'Envie-nos uma mensagem', ro:'Trimiteți-ne un mesaj' })}
              </h2>
              <p style={{ fontSize:13, color:C.text3, marginBottom:24 }}>
                {t({ fr:'Remplissez le formulaire, nous vous répondons sous 24h.', en:'Fill in the form, we reply within 24h.', de:'Formular ausfüllen, Antwort innerhalb von 24h.', es:'Rellene el formulario, respondemos en 24h.', it:'Compilate il modulo, rispondiamo entro 24h.', pt:'Preencha o formulário, respondemos em 24h.', ro:'Completați formularul, vă răspundem în 24h.' })}
              </p>

              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>{t({ fr:'Nom *', en:'Name *', de:'Name *', es:'Nombre *', it:'Nome *', pt:'Nome *', ro:'Nume *' })}</label>
                  <input value={form.name} onChange={set('name')} placeholder="Jean Dupont"
                    style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>{t({ fr:'Email *', en:'Email *', de:'E-Mail *', es:'Email *', it:'Email *', pt:'Email *', ro:'Email *' })}</label>
                  <input value={form.email} onChange={set('email')} type="email" placeholder="jean@email.com"
                    style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>{t({ fr:'Téléphone', en:'Phone', de:'Telefon', es:'Teléfono', it:'Telefono', pt:'Telefone', ro:'Telefon' })}</label>
                  <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+49 ..."
                    style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>{t({ fr:'Sujet', en:'Subject', de:'Betreff', es:'Asunto', it:'Oggetto', pt:'Assunto', ro:'Subiect' })}</label>
                  <select value={form.subject} onChange={set('subject')}
                    style={{ width:'100%', boxSizing:'border-box', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none' }}>
                    {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:C.text3, marginBottom:8 }}>{t({ fr:'Message *', en:'Message *', de:'Nachricht *', es:'Mensaje *', it:'Messaggio *', pt:'Mensagem *', ro:'Mesaj *' })}</label>
                <textarea value={form.message} onChange={set('message')} rows={5}
                  style={{ width:'100%', boxSizing:'border-box', resize:'none', fontSize:15, borderRadius:10, padding:'14px 18px', border:`1px solid ${C.border}`, background:C.bg, color:C.text, outline:'none', lineHeight:1.6 }} />
              </div>
              <button type="submit" disabled={submitting} style={{
                width:'100%', padding:'18px 36px', background:'linear-gradient(135deg,#132853,#0E1E3D)',
                color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700,
                fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", cursor:'pointer', letterSpacing:'0.05em',
                boxShadow:'0 4px 16px rgba(19,40,83,0.3)', opacity: submitting ? 0.6 : 1, transition:'all 0.3s'
              }}>
                {submitting
                  ? t({ fr:'Envoi en cours...', en:'Sending...', de:'Wird gesendet...', es:'Enviando...', it:'Invio...', pt:'A enviar...', ro:'Se trimite...' })
                  : t({ fr:'Envoyer le message', en:'Send message', de:'Nachricht senden', es:'Enviar mensaje', it:'Invia messaggio', pt:'Enviar mensagem', ro:'Trimiteți mesajul' })}
              </button>
            </motion.form>

            {/* Map / Hours */}
            <motion.div
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.6, delay:0.1 }}
              style={{ display:'flex', flexDirection:'column', gap:24 }}
            >
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding: isMobile ? 24 : 32, boxShadow:C.shadow }}>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:20, color:C.text, marginBottom:20 }}>
                  {t({ fr:'Horaires d\'ouverture', en:'Opening hours', de:'Öffnungszeiten', es:'Horarios', it:'Orari', pt:'Horários', ro:'Program de lucru' })}
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[
                    { d: t({ fr:'Lundi – Vendredi', en:'Monday – Friday', de:'Montag – Freitag', es:'Lunes – Viernes', it:'Lunedì – Venerdì', pt:'Segunda – Sexta', ro:'Luni – Vineri' }), h: '09:00 – 18:00' },
                    { d: t({ fr:'Samedi', en:'Saturday', de:'Samstag', es:'Sábado', it:'Sabato', pt:'Sábado', ro:'Sâmbătă' }), h: '10:00 – 16:00' },
                    { d: t({ fr:'Dimanche', en:'Sunday', de:'Sonntag', es:'Domingo', it:'Domenica', pt:'Domingo', ro:'Duminică' }), h: t({ fr:'Fermé', en:'Closed', de:'Geschlossen', es:'Cerrado', it:'Chiuso', pt:'Fechado', ro:'Închis' }) },
                  ].map((row, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:C.card2, borderRadius:10 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{row.d}</span>
                      <span style={{ fontSize:14, fontWeight:700, color: row.h === 'Fermé' || row.h === 'Closed' || row.h === 'Geschlossen' || row.h === 'Cerrado' || row.h === 'Chiuso' || row.h === 'Fechado' ? '#DC2626' : C.red }}>{row.h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Franz-Julius-Haenel-Str.+3+06618+Naumburg"
                target="_blank" rel="noopener noreferrer"
                style={{ textDecoration:'none', display:'block', borderRadius:20, overflow:'hidden', border:`1px solid ${C.border}`, boxShadow:C.shadow }}
              >
                <div style={{
                  height:220, position:'relative',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <iframe
                    title="Carte"
                    width="100%" height="220" style={{ border:0, position:'absolute', inset:0 }}
                    loading="lazy" allowFullScreen
                    src="https://www.openstreetmap.org/export/embed.html?bbox=11.74%2C51.145%2C11.805%2C51.165&layer=mapnik&marker=51.155%2C11.773"
                  />
                  <span style={{
                    position:'absolute', bottom:18, left:0, right:0, textAlign:'center', zIndex:1,
                    color:'#fff', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textShadow:'0 1px 4px rgba(0,0,0,0.6)'
                  }}>
                    Franz-Julius-Haenel-Str. 3, 06618 Naumburg
                  </span>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section style={{ background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)', borderTop:`1px solid ${C.border}` }} className="section-pad">
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
          >
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 42, color:'#fff', letterSpacing:'-0.02em', marginBottom:20 }}>
              {t({ fr:'Besoin d\'une réponse immédiate ?', en:'Need an immediate answer?', de:'Brauchen Sie eine sofortige Antwort?', es:'¿Necesita una respuesta inmediata?', it:'Serve una risposta immediata?', pt:'Precisa de uma resposta imediata?', ro:'Aveți nevoie de un răspuns imediat?' })}
            </h2>
            <a href="https://wa.me/491630436338" target="_blank" rel="noopener noreferrer" style={{
              background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize:15, fontWeight:700, padding:'16px 32px', borderRadius:10, display:'inline-flex', alignItems:'center', gap:10,
              boxShadow:'0 4px 16px rgba(37,211,102,0.3)'
            }}>
              💬 {t({ fr:'Discuter sur WhatsApp', en:'Chat on WhatsApp', de:'Chat auf WhatsApp', es:'Chatear por WhatsApp', it:'Chat su WhatsApp', pt:'Conversar no WhatsApp', ro:'Discutați pe WhatsApp' })}
            </a>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
