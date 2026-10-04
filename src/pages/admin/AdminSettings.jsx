import { useState, useEffect } from 'react';
import { bankAPI } from '../../services/api';
import { useToastStore, useLangStore } from '../../store';
import { Loader } from '../../components/UI';

const L = {
  eyebrow:   { fr:'Paiement', en:'Payment', de:'Zahlung', es:'Pago', it:'Pagamento', pt:'Pagamento' },
  title:     { fr:'Coordonnées bancaires', en:'Bank details', de:'Bankdaten', es:'Datos bancarios', it:'Coordinate bancarie', pt:'Dados bancários' },
  subtitle:  { fr:'Ces informations sont affichées sur la confirmation de commande pour les paiements par virement.', en:'These details are shown on the order confirmation for wire transfer payments.', de:'Diese Angaben werden auf der Bestellbestätigung für Überweisungen angezeigt.', es:'Estos datos se muestran en la confirmación del pedido para pagos por transferencia.', it:'Questi dati vengono mostrati sulla conferma d\'ordine per i pagamenti tramite bonifico.', pt:'Esses dados são exibidos na confirmação do pedido para pagamentos por transferência.' },
  holder:    { fr:'Titulaire du compte', en:'Account holder', de:'Kontoinhaber', es:'Titular de la cuenta', it:'Titolare del conto', pt:'Titular da conta' },
  holderPh:  { fr:'Ex : AUTOMATIK GEBRAUCHTWAGEN', en:'e.g. AUTOMATIK GEBRAUCHTWAGEN', de:'z. B. AUTOMATIK GEBRAUCHTWAGEN', es:'Ej.: AUTOMATIK GEBRAUCHTWAGEN', it:'Es.: AUTOMATIK GEBRAUCHTWAGEN', pt:'Ex.: AUTOMATIK GEBRAUCHTWAGEN' },
  iban:      { fr:'IBAN', en:'IBAN', de:'IBAN', es:'IBAN', it:'IBAN', pt:'IBAN' },
  ibanPh:    { fr:'Ex : DE89 3704 0044 0532 0130 00', en:'e.g. DE89 3704 0044 0532 0130 00', de:'z. B. DE89 3704 0044 0532 0130 00', es:'Ej.: DE89 3704 0044 0532 0130 00', it:'Es.: DE89 3704 0044 0532 0130 00', pt:'Ex.: DE89 3704 0044 0532 0130 00' },
  bic:       { fr:'BIC', en:'BIC', de:'BIC', es:'BIC', it:'BIC', pt:'BIC' },
  bicPh:     { fr:'Ex : COBADEFFXXX', en:'e.g. COBADEFFXXX', de:'z. B. COBADEFFXXX', es:'Ej.: COBADEFFXXX', it:'Es.: COBADEFFXXX', pt:'Ex.: COBADEFFXXX' },
  typePh:    { fr:'Ex : SEPA', en:'e.g. SEPA', de:'z. B. SEPA', es:'Ej.: SEPA', it:'Es.: SEPA', pt:'Ex.: SEPA' },
  save:      { fr:'Enregistrer', en:'Save', de:'Speichern', es:'Guardar', it:'Salva', pt:'Salvar' },
  saving:    { fr:'Enregistrement…', en:'Saving…', de:'Speichern…', es:'Guardando…', it:'Salvataggio…', pt:'Salvando…' },
  saved:     { fr:'Coordonnées bancaires mises à jour.', en:'Bank details updated.', de:'Bankdaten aktualisiert.', es:'Datos bancarios actualizados.', it:'Coordinate bancarie aggiornate.', pt:'Dados bancários atualizados.' },
  error:     { fr:'Erreur lors de l\'enregistrement.', en:'Error while saving.', de:'Fehler beim Speichern.', es:'Error al guardar.', it:'Errore durante il salvataggio.', pt:'Erro ao salvar.' },
  back:      { fr:'← Retour au tableau de bord', en:'← Back to dashboard', de:'← Zurück zum Dashboard', es:'← Volver al panel', it:'← Torna alla dashboard', pt:'← Voltar ao painel' },
  preview:   { fr:'Aperçu', en:'Preview', de:'Vorschau', es:'Vista previa', it:'Anteprima', pt:'Pré-visualização' },
  type:      { fr:'Type de virement', en:'Transfer type', de:'Überweisungsart', es:'Tipo de transferencia', it:'Tipo di bonifico', pt:'Tipo de transferência' },
};

export default function AdminSettings() {
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const l = lang || 'fr';
  const [form, setForm] = useState({ iban:'', bic:'', beneficiary:'AUTOMATIK GEBRAUCHTWAGEN', transferType:'SEPA' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    bankAPI.getAdmin()
      .then(r => {
        const b = r.data.bank || {};
        setForm({ iban: b.iban || '', bic: b.bic || '', beneficiary: b.beneficiary || 'AUTOMATIK GEBRAUCHTWAGEN', transferType: b.transferType || 'SEPA' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bankAPI.update(form);
      addToast(L.saved[l], 'success');
    } catch (err) {
      addToast(err.response?.data?.error || L.error[l], 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding:40 }}><Loader /></div>;

  const cardStyle = {
    background:'var(--bg-card)',
    border:'1px solid var(--border)',
    borderRadius:12,
    padding:24,
    boxShadow:'var(--shadow-sm)',
  };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:32 }}>
        <div className="section-eyebrow">{L.eyebrow[l]}</div>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(26px,3.5vw,40px)', color:'var(--red)', letterSpacing:'-0.02em', marginBottom:8 }}>
          {L.title[l]}
        </h1>
        <p style={{ fontSize:15, color:'var(--text-3)', maxWidth:560, lineHeight:1.7 }}>{L.subtitle[l]}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:24, alignItems:'start' }}>
        <form onSubmit={handleSave} style={cardStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label className="section-eyebrow" style={{ display:'block', marginBottom:8 }}>{L.holder[l]}</label>
              <input
                className="input-luxury"
                value={form.beneficiary}
                onChange={e => setForm(s => ({ ...s, beneficiary: e.target.value }))}
                placeholder={L.holderPh[l]}
                style={{ width:'100%', fontSize:15 }}
              />
            </div>
            <div>
              <label className="section-eyebrow" style={{ display:'block', marginBottom:8 }}>{L.iban[l]}</label>
              <input
                className="input-luxury"
                value={form.iban}
                onChange={e => setForm(s => ({ ...s, iban: e.target.value }))}
                placeholder={L.ibanPh[l]}
                style={{ width:'100%', fontSize:15, fontFamily:'monospace', letterSpacing:'0.04em' }}
              />
            </div>
            <div>
              <label className="section-eyebrow" style={{ display:'block', marginBottom:8 }}>{L.bic[l]}</label>
              <input
                className="input-luxury"
                value={form.bic}
                onChange={e => setForm(s => ({ ...s, bic: e.target.value }))}
                placeholder={L.bicPh[l]}
                style={{ width:'100%', fontSize:15, fontFamily:'monospace', letterSpacing:'0.04em' }}
              />
            </div>
            <div>
              <label className="section-eyebrow" style={{ display:'block', marginBottom:8 }}>{L.type[l]}</label>
              <input
                className="input-luxury"
                value={form.transferType}
                onChange={e => setForm(s => ({ ...s, transferType: e.target.value }))}
                placeholder={L.typePh[l]}
                style={{ width:'100%', fontSize:15 }}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize:15, padding:'18px 36px', borderRadius:10, letterSpacing:'0.05em', justifyContent:'center' }}>
              {saving ? L.saving[l] : L.save[l]}
            </button>
          </div>
        </form>

        <div style={{ ...cardStyle, alignSelf:'start' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:18 }}>
            {L.preview[l]}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label: L.holder[l], value: form.beneficiary },
              { label: L.iban[l], value: form.iban, mono:true },
              { label: L.bic[l], value: form.bic, mono:true },
              { label: L.type, value: form.transferType },
            ].map(({ label, value, mono }, i) => (
              <div key={i} style={{ padding:'12px 14px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:8 }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>
                  {typeof label === 'object' ? label[l] : label}
                </p>
                <p style={{ fontFamily: mono ? 'monospace' : "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:15, color:'var(--text)', letterSpacing:mono ? '0.04em' : 0, wordBreak:'break-all' }}>
                  {value || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
