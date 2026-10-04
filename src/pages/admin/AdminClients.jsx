import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate, getInitials } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.clients();
      setClients(data.clients);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (client) => {
    if (!window.confirm(`Supprimer définitivement le client ${client.firstName} ${client.lastName} (${client.email}) ?\nSes commandes et son panier seront également supprimés.`)) return;
    setDeletingId(client.id);
    try {
      await adminAPI.deleteClient(client.id);
      setClients(prev => prev.filter(c => c.id !== client.id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Erreur lors de la suppression du client');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement des clients..." /></div>;

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:32 }}>
        <div className="section-eyebrow">CRM</div>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          Clients <span style={{ color:'var(--text-3)', fontSize:'0.55em', fontWeight:600 }}>({clients.length})</span>
        </h1>
      </div>

      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Client','Contact','Salaire','Commandes','Total dépensé','Inscrit le',''].map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.2s var(--ease)' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card2)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{
                        width:46,
                        height:46,
                        borderRadius:'50%',
                        background:'linear-gradient(135deg,#0E1E3D,#132853)',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                        fontWeight:900,
                        fontSize:16,
                        color:'#fff',
                        flexShrink:0,
                        boxShadow:'0 4px 12px rgba(19,40,83,0.22)',
                        border:'2px solid var(--red-border)',
                      }}>
                        {getInitials(client.firstName, client.lastName)}
                      </div>
                      <div>
                        <p style={{ fontWeight:800, color:'var(--text)', fontSize:16, letterSpacing:'0.01em' }}>{client.firstName} {client.lastName}</p>
                        <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3, fontWeight:500 }}>@{client.username}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:13, color:'var(--text-2)', fontWeight:500 }}>{client.email}</p>
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{client.phone || '—'}</p>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:14, color:'var(--text-2)', fontWeight:600 }}>
                    {client.monthlySalary ? formatEuro(client.monthlySalary) : '—'}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:26, color:'var(--red)', letterSpacing:'-0.02em' }}>{client.orderCount}</span>
                  </td>
                  <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--text)', fontSize:16, letterSpacing:'-0.01em' }}>
                    {client.totalSpent > 0 ? formatEuro(client.totalSpent) : '—'}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--text-2)', fontWeight:500 }}>
                    {formatDate(client.createdAt)}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(client)}
                      disabled={deletingId === client.id}
                      style={{
                        fontSize:12, padding:'8px 14px', letterSpacing:'0.05em',
                        border:'1px solid rgba(220,38,38,0.35)', borderRadius:8,
                        background:'rgba(220,38,38,0.08)', color:'#DC2626',
                        cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700,
                        opacity: deletingId === client.id ? 0.5 : 1,
                        transition:'all 0.2s var(--ease)',
                      }}
                      onMouseOver={e => { if (deletingId !== client.id) { e.currentTarget.style.background = 'rgba(220,38,38,0.16)'; } }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}>
                      {deletingId === client.id ? 'Suppression…' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:15, fontWeight:500 }}>Aucun client trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
