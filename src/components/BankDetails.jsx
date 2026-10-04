import { useLangStore, useToastStore } from '../store';
import { useBreakpoint } from '../hooks/useBreakpoint';

const L = {
  transfer:  { fr:'Virement bancaire',          en:'Bank transfer',           de:'Überweisung',                es:'Transferencia bancaria',      it:'Bonifico bancario',           pt:'Transferência bancária' },
  holder:    { fr:'Titulaire',                 en:'Account holder',          de:'Kontoinhaber',               es:'Titular',                     it:'Titolare',                    pt:'Titular' },
  iban:      { fr:'IBAN',                      en:'IBAN',                     de:'IBAN',                       es:'IBAN',                        it:'IBAN',                        pt:'IBAN' },
  bic:       { fr:'BIC',                       en:'BIC',                      de:'BIC',                        es:'BIC',                         it:'BIC',                         pt:'BIC' },
  type:      { fr:'Type de virement',          en:'Transfer type',            de:'Überweisungsart',            es:'Tipo de transferencia',       it:'Tipo di bonifico',            pt:'Tipo de transferência' },
  motif:     { fr:'Motif du virement',         en:'Payment reference',        de:'Verwendungszweck',           es:'Concepto',                    it:'Causale',                     pt:'Motivo' },
  copy:      { fr:'Copier',                    en:'Copy',                     de:'Kopieren',                   es:'Copiar',                      it:'Copia',                       pt:'Copiar' },
  copyDone:  { fr:'Copié !',                   en:'Copied!',                  de:'Kopiert!',                   es:'¡Copiado!',                   it:'Copiato!',                    pt:'Copiado!' },
  hint:      { fr:'Merci d\'indiquer le motif lors de votre virement afin que nous puissions associer votre paiement à la commande.', en:'Please include the payment reference with your transfer so we can match your payment to the order.', de:'Bitte geben Sie den Verwendungszweck bei Ihrer Überweisung an, damit wir Ihre Zahlung der Bestellung zuordnen können.', es:'Indique el concepto al realizar la transferencia para asociar su pago al pedido.', it:'Indichi la causale nel bonifico per associare il pagamento all\'ordine.', pt:'Indique o motivo na transferência para associarmos o pagamento ao pedido.' },
};

function CopyRow({ label, value, copy, l, L, mono, highlight, compact }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding: compact ? '9px 12px' : '12px 14px',
      background: highlight ? 'var(--red-bg)' : 'var(--bg-card2)',
      border:`1px solid ${highlight ? 'var(--red-border)' : 'var(--border)'}`,
      borderRadius:8,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>
          {label}
        </p>
        <p style={{
          fontFamily: mono ? 'monospace' : "'Helvetica Neue',Helvetica,Arial,sans-serif",
          fontWeight: highlight ? 900 : 700,
          fontSize: compact ? 13 : (mono ? 15 : 16),
          color: highlight ? 'var(--red)' : 'var(--text)',
          letterSpacing: mono ? '0.04em' : '0',
          wordBreak:'break-all',
        }}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => copy(value, L.copyDone[l])}
        className="btn-ghost"
        style={{ fontSize: compact ? 11 : 12, padding: compact ? '6px 10px' : '8px 14px', flexShrink:0 }}
      >
        {L.copy[l]}
      </button>
    </div>
  );
}

export default function BankDetails({ bank = {}, reference, compact = false, style, title }) {
  const { lang } = useLangStore();
  const { addToast } = useToastStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const copy = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      addToast(`${label} ✓`, 'success');
    }).catch(() => {});
  };

  const showIban = Boolean(bank.iban || bank.bic);
  if (!showIban && !reference) return null;

  return (
    <div style={{
      background:'var(--bg-card)',
      border:'1px solid var(--red-border)',
      borderRadius:12,
      padding: compact ? 16 : (isMobile ? 18 : 24),
      boxShadow:'var(--shadow-sm)',
      ...style,
    }}>
      <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom: compact ? 12 : 18 }}>
        💳 {title || L.transfer[l]}
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap: compact ? 10 : 14 }}>
        {bank.beneficiary && (
          <CopyRow label={L.holder[l]} value={bank.beneficiary} copy={copy} l={l} L={L} compact={compact} />
        )}
        {bank.iban && (
          <CopyRow label={L.iban[l]} value={bank.iban} copy={copy} l={l} L={L} mono compact={compact} />
        )}
        {bank.bic && (
          <CopyRow label={L.bic[l]} value={bank.bic} copy={copy} l={l} L={L} mono compact={compact} />
        )}
        <CopyRow label={L.type[l]} value={bank.transferType || 'SEPA'} copy={copy} l={l} L={L} compact={compact} />
        {reference && (
          <CopyRow label={L.motif[l]} value={reference} copy={copy} l={l} L={L} mono highlight compact={compact} />
        )}
      </div>
      <p style={{ fontSize: compact ? 12 : 13, color:'var(--text-3)', marginTop: compact ? 12 : 16, lineHeight:1.6 }}>
        {L.hint[l]}
      </p>
    </div>
  );
}
