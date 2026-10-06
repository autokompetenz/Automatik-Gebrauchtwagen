import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI, bankAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro, formatDate, timeAgo } from '../../utils/helpers';
import { StatusBadge, Loader } from '../../components/UI';

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', processing:'En traitement', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };
const PAYMENT_LABELS = { full:'Paiement intégral (-5%)', deposit:'Acompte 25%', monthly:'Acompte 25% + 60 mensualités' };
const INSTALLMENT_LABELS = { full:'Total', deposit:'Acompte', monthly:'Mensualité', balance:'Solde' };
const PAY_STATUS_LABELS = { pending:'À payer', paid:'Payé', late:'En retard', cancelled:'Annulé' };
const PAY_STATUS_COLORS = { pending:'var(--text-3)', paid:'var(--green)', late:'#EF4444', cancelled:'var(--text-3)' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { addToast } = useToastStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [paySaving, setPaySaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ type:'monthly', amount:'', dueDate:'' });
  const [bankInfo, setBankInfo] = useState({ iban:'', bic:'', beneficiary:'AUTOMATIK GEBRAUCHTWAGEN', transferType:'SEPA' });

  const load = () => {
    orderAPI.getAdminDetail(id)
      .then(r => { setOrder(r.data.order); setNewStatus(r.data.order.status); setLoading(false); })
      .catch(() => setLoading(false));
    bankAPI.getAdmin()
      .then(r => setBankInfo({ iban: r.data.bank?.iban || '', bic: r.data.bank?.bic || '', beneficiary: r.data.bank?.beneficiary || 'AUTOMATIK GEBRAUCHTWAGEN', transferType: r.data.bank?.transferType || 'SEPA' }))
      .catch(() => {});
  };
  useEffect(load, [id]);

  const markPaid = async (p) => {
    setPaySaving(true);
    try {
      await orderAPI.updatePayment(p.id, { status: p.status === 'paid' ? 'pending' : 'paid' });
      addToast(p.status === 'paid' ? 'Paiement remis en attente.' : `Paiement de ${formatEuro(p.amount)} validé.`, 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPaySaving(false); }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    setPaySaving(true);
    try {
      await orderAPI.addPayment(id, {
        type: addForm.type,
        amount: Number(addForm.amount),
        dueDate: addForm.dueDate ? new Date(addForm.dueDate).toISOString() : null,
      });
      addToast('Paiement ajouté à l’échéancier.', 'success');
      setAddForm({ type:'monthly', amount:'', dueDate:'' });
      setAddOpen(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPaySaving(false); }
  };

  const updatePayStatus = async (p, status) => {
    setPaySaving(true);
    try {
      await orderAPI.updatePayment(p.id, { status });
      addToast(p.status === status ? 'Aucun changement.' : `Statut passé à « ${status} ».`, 'info');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPaySaving(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await orderAPI.updateStatus(id, { status: newStatus, comment, bankInfo });
      if (data.emailSent) {
        addToast('Mise à jour enregistrée. Un e-mail a été envoyé au client.', 'success');
      } else {
        addToast('Mise à jour enregistrée (aucun e-mail : statut inchangé et pas de message).', 'info');
      }
      setComment('');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:40 }}><Loader /></div>;
  if (!order)  return <div style={{ padding:40, color:'var(--text-3)', fontSize:16 }}>Commande introuvable.</div>;

  const InfoRow = ({ label, value }) => (
    <div>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:15, color:'var(--text)', fontWeight:500 }}>{value || '—'}</p>
    </div>
  );

  const cardStyle = {
    background:'var(--bg-card)',
    border:'1px solid var(--border)',
    borderRadius:12,
    padding:24,
    boxShadow:'var(--shadow-sm)',
  };

  const payments = (order.payments || []).sort((a,b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  const remaining = payments.filter(p => p.status !== 'paid' && p.status !== 'cancelled').reduce((s,p) => s + p.amount, 0);

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, flexWrap:'wrap' }}>
        <div>
          <div className="section-eyebrow">Commande</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(26px,3.5vw,40px)', color:'var(--red)', letterSpacing:'-0.02em' }}>
            {order.orderNumber}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="admin-order-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:18 }}>Informations client</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <InfoRow label="Nom" value={`${order.user?.firstName} ${order.user?.lastName}`} />
              <InfoRow label="Email" value={order.user?.email} />
              <InfoRow label="Téléphone" value={order.user?.phone} />
              <InfoRow label="Adresse livraison" value={order.shippingAddress} />
              <InfoRow label="Membre depuis" value={formatDate(order.user?.createdAt)} />
              <InfoRow label="Commandé le" value={formatDate(order.createdAt)} />
            </div>
            {order.notes && (
              <div style={{ marginTop:16, padding:'12px 16px', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--red)', marginBottom:6 }}>Notes</p>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{order.notes}</p>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:18 }}>Véhicules commandés</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                  <img src={item.car.imageUrl} alt="" style={{ width:96, height:68, objectFit:'cover', borderRadius:8, flexShrink:0, border:'1px solid var(--border)' }} />
                  <div style={{ flex:1, minWidth:160 }}>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:16 }}>{item.car.make} {item.car.model} {item.car.year}</p>
                    <p style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>{item.car.category} · {item.car.fuelType}</p>
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Qté : {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:20, color:'var(--red)', flexShrink:0 }}>{formatEuro(item.unitPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:18 }}>Récapitulatif financier</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>Mode</span>
                <span style={{ color:'var(--text)', fontWeight:600 }}>{PAYMENT_LABELS[order.paymentType]}</span>
              </div>
              {order.discountAmount && (
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--green)' }}>
                  <span>Remise (-5%)</span><span>- {formatEuro(order.discountAmount)}</span>
                </div>
              )}
              {order.depositAmount && (
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-3)' }}>Acompte (25%)</span>
                  <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.depositAmount)}</span>
                </div>
              )}
              {order.monthlyAmount && (
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-3)' }}>Mensualité × {order.monthlyDuration}</span>
                  <span style={{ color:'var(--red)', fontWeight:700 }}>{formatEuro(order.monthlyAmount)}/mo</span>
                </div>
              )}
              <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:700, color:'var(--text)' }}>Total</span>
                <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', letterSpacing:'-0.02em' }}>{formatEuro(order.totalPrice)}</span>
              </div>
            </div>
            {order.paymentProofUrl && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--red)', marginBottom:8 }}>Preuve de virement</p>
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block' }}>
                  <img src={order.paymentProofUrl} alt="Preuve de virement" style={{ width:180, height:'auto', maxHeight:140, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />
                </a>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)' }}>Échéancier de paiement</p>
              <button onClick={() => setAddOpen(v => !v)} className="btn-primary"
                style={{ padding:'8px 14px', fontSize:12, background: addOpen ? 'var(--bg-card2)' : undefined, border: addOpen ? '1px solid var(--border)' : undefined, color: addOpen ? 'var(--text)' : undefined }}>
                {addOpen ? '− Fermer' : '+ Ajouter un paiement'}
              </button>
            </div>

            {addOpen && (
              <form onSubmit={addPayment} style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18, padding:14, border:'1px dashed var(--border)', borderRadius:8 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <select value={addForm.type} onChange={e => setAddForm({ ...addForm, type:e.target.value })}
                    className="input-luxury" style={{ padding:'10px 12px', fontSize:14 }}>
                    {Object.entries(INSTALLMENT_LABELS).map(([k,v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <input type="number" min="0" step="0.01" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount:e.target.value })}
                    placeholder="Montant (€)" className="input-luxury" style={{ padding:'10px 12px', fontSize:14 }} required />
                </div>
                <input type="date" value={addForm.dueDate} onChange={e => setAddForm({ ...addForm, dueDate:e.target.value })}
                  className="input-luxury" style={{ padding:'10px 12px', fontSize:14 }} />
                <button type="submit" disabled={paySaving} className="btn-primary" style={{ padding:'10px 16px', fontSize:13, justifyContent:'center' }}>
                  {paySaving ? '⏳...' : 'Enregistrer le paiement'}
                </button>
              </form>
            )}

            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', marginBottom:12 }}>
              Restant à payer : <span style={{ color:'var(--green)', fontWeight:900 }}>{formatEuro(remaining)}</span>
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {payments.length === 0 && (
                <p style={{ fontSize:14, color:'var(--text-3)' }}>Aucun paiement enregistré.</p>
              )}
              {payments.map(p => (
                <div key={p.id} style={{
                  display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8,
                  padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)',
                  background: p.status==='late' ? 'rgba(239,68,68,0.05)' : p.status==='paid' ? 'rgba(22,163,74,0.05)' : 'var(--bg-card2)',
                  opacity:p.status==='cancelled'?0.55:1,
                }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>
                      {INSTALLMENT_LABELS[p.type] || p.type}
                      {p.amount === order.depositAmount && p.type==='deposit' && ' (25%)'}
                    </p>
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                      {p.dueDate ? formatDate(p.dueDate) : 'À la livraison'}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:16, color:'var(--red)', flexShrink:0 }}>{formatEuro(p.amount)}</p>
                    <span style={{
                      fontSize:11, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0,
                      color:PAY_STATUS_COLORS[p.status]||'var(--text-3)', border:`1px solid ${PAY_STATUS_COLORS[p.status]||'var(--border)'}`,
                      borderRadius:999, padding:'3px 10px',
                    }}>
                      {PAY_STATUS_LABELS[p.status] || p.status}
                    </span>
                    {(p.status === 'pending' || p.status === 'late' || p.status === 'paid') && (
                      <div style={{ display:'flex', gap:4 }}>
                        {p.status === 'paid' ? (
                          <button onClick={() => updatePayStatus(p, 'pending')} disabled={paySaving} title="Remettre en attente"
                            className="btn-ghost" style={{ padding:'5px 10px', fontSize:11 }}>↺</button>
                        ) : (
                          <button onClick={() => markPaid(p)} disabled={paySaving} title="Marquer payé"
                            className="btn-primary" style={{ padding:'5px 10px', fontSize:11 }}>✓</button>
                        )}
                        {p.status !== 'paid' && p.status !== 'cancelled' && (
                          <button onClick={() => updatePayStatus(p, p.status === 'late' ? 'pending' : 'late')} disabled={paySaving}
                            title={p.status === 'late' ? 'Repasser à payer' : 'Marquer en retard'}
                            className="btn-ghost" style={{ padding:'5px 10px', fontSize:11, color:'#EF4444', borderColor:'rgba(239,68,68,0.4)' }}>!</button>
                        )}
                        <button onClick={() => updatePayStatus(p, 'cancelled')} disabled={paySaving} title="Annuler ce paiement"
                          className="btn-ghost" style={{ padding:'5px 10px', fontSize:11 }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.tracking?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:20 }}>Historique</p>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {order.tracking.map(event => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-dot"><div style={{ width:8, height:8, borderRadius:'50%', background:'var(--red)' }} /></div>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                      <div>
                        <StatusBadge status={event.status} />
                        {event.comment && <p style={{ fontSize:13, color:'var(--text-2)', marginTop:8, lineHeight:1.6 }}>{event.comment}</p>}
                        {event.admin && <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>par {event.admin.firstName} {event.admin.lastName}</p>}
                      </div>
                      <p style={{ fontSize:12, color:'var(--text-3)', flexShrink:0 }}>{timeAgo(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <form onSubmit={handleUpdate} style={{ ...cardStyle, position:'sticky', top:24 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--red)', marginBottom:20 }}>Mettre à jour le statut</p>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
              {Object.entries(STATUS_LABELS).map(([val]) => (
                <label key={val} style={{
                  display:'flex',
                  alignItems:'center',
                  gap:12,
                  padding:'10px 12px',
                  borderRadius:8,
                  cursor:'pointer',
                  border:`1px solid ${newStatus===val ? 'var(--red)' : 'var(--border)'}`,
                  background: newStatus===val ? 'var(--red-bg)' : 'var(--bg-card2)',
                  transition:'all 0.2s var(--ease)',
                }}>
                  <input type="radio" name="status" value={val} checked={newStatus===val} onChange={() => setNewStatus(val)} style={{ accentColor:'var(--red)', width:16, height:16 }} />
                  <StatusBadge status={val} />
                </label>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                Message au client
              </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="Ex : Votre véhicule est prêt pour la livraison..." className="input-luxury" style={{ resize:'none', fontSize:14 }} />
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                💳 Coordonnées de paiement (confirmées à la validation)
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
                <input value={bankInfo.beneficiary} onChange={e => setBankInfo({...bankInfo, beneficiary: e.target.value})} placeholder="Titulaire" className="input-luxury" style={{ fontSize:14 }} />
                <input value={bankInfo.iban} onChange={e => setBankInfo({...bankInfo, iban: e.target.value})} placeholder="IBAN" className="input-luxury" style={{ fontSize:14 }} />
                <input value={bankInfo.bic} onChange={e => setBankInfo({...bankInfo, bic: e.target.value})} placeholder="BIC" className="input-luxury" style={{ fontSize:14 }} />
                <select value={bankInfo.transferType} onChange={e => setBankInfo({...bankInfo, transferType: e.target.value})} className="input-luxury" style={{ fontSize:14 }}>
                  <option value="SEPA">SEPA</option>
                  <option value="SWIFT">SWIFT</option>
                </select>
              </div>
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:6 }}>
                Ces coordonnées sont enregistrées et envoyées au client dans l'e-mail de confirmation.
              </p>
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:14 }}>
              {saving ? '⏳ Envoi...' : '✉ Mettre à jour & Notifier'}
            </button>
            <p style={{ fontSize:12, textAlign:'center', color:'var(--text-3)', marginTop:10 }}>
              E-mail au client si le statut change ou si vous laissez un message (même statut).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
