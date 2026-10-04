import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI, carAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [flash, setFlash] = useState(null);
  const { addToast } = useToastStore();
  const location = useLocation();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setLoadError(false);
    adminAPI.getCars()
      .then(r => {
        setCars(Array.isArray(r.data?.cars) ? r.data.cars : []);
        setLoading(false);
      })
      .catch(() => {
        setCars([]);
        setLoadError(true);
        setLoading(false);
      });
  };

  useEffect(load, []);

  useEffect(() => {
    const msg = location.state?.successMessage;
    if (!msg) return;
    setFlash(msg);
    addToast(msg, 'success', 6000);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate, addToast]);

  const handleToggle = async (car) => {
    try {
      const { data } = await carAPI.toggle(car.id);
      setCars((prev) => prev.map((c) => (c.id === car.id ? data.car : c)));
      addToast(data.message || 'Statut mis à jour', 'success');
    } catch {
      addToast('Erreur', 'error');
    }
  };

  const handleDelete = async (car) => {
    if (!window.confirm(`Supprimer définitivement ${car.make} ${car.model} ? Cette action est irréversible.`)) return;
    try {
      await carAPI.remove(car.id);
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      addToast('Véhicule supprimé', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  if (loading) return <div style={{ padding: 40 }}><Loader text="Chargement des véhicules..." /></div>;

  return (
    <div style={{ padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight: '100vh', background: 'var(--bg)' }}>
      {flash && (
        <div style={{
          marginBottom: 24, padding: '16px 20px', borderRadius: 12,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
          color: 'var(--green)', fontWeight: 700, fontSize: 15,
        }}>
          ✓ {flash}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <div>
          <div className="section-eyebrow">Inventaire</div>
          <h1 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Véhicules <span style={{ color: 'var(--text-3)', fontSize: '0.55em', fontWeight: 600 }}>({cars.length})</span>
          </h1>
        </div>
        <Link to="/admin/cars/new" className="btn-primary" style={{ fontSize: 14, padding: '14px 24px', alignSelf: 'flex-end' }}>
          + Ajouter un véhicule
        </Link>
      </div>

      {loadError && (
        <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: 12 }}>Impossible de charger les véhicules.</p>
          <button type="button" className="btn-ghost" onClick={load}>Réessayer</button>
        </div>
      )}

      {cars.length === 0 && !loadError ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🚗</p>
          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Aucun véhicule</p>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>Ajoutez votre premier véhicule au catalogue.</p>
          <Link to="/admin/cars/new" className="btn-primary">+ Ajouter un véhicule</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Photo', 'Véhicule', 'Année', 'Prix', 'Catégorie', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '14px 20px', background: 'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s var(--ease)' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card2)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '14px 20px' }}>
                      {car.imageUrl ? (
                        <img src={car.imageUrl} alt="" style={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 88, height: 64, borderRadius: 10, background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 800, color: 'var(--text)', fontSize: 16, letterSpacing: '0.01em' }}>{car.make} {car.model}</p>
                        {car.featured && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>
                            ★ TOP
                          </span>
                        )}
                        {car.promotional && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,140,0,0.12)', color: '#FF8C00', border: '1px solid rgba(255,140,0,0.3)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>
                            🔥 PROMO
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, fontWeight: 500 }}>{car.fuelType} · {car.transmission}</p>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>{car.year}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--red)', fontSize: 17, letterSpacing: '-0.01em' }}>{formatEuro(car.price)}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>{car.category}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '6px 12px',
                        borderRadius: 12,
                        background: car.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                        color: car.isActive ? 'var(--green)' : '#EF4444',
                        border: `1px solid ${car.isActive ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)'}`,
                        letterSpacing: '0.04em',
                      }}>
                        {car.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/admin/cars/${car.id}/edit`} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 800 }}>
                          Modifier
                        </Link>
                        <button type="button" onClick={() => { if (window.confirm(`${car.isActive ? 'Désactiver' : 'Activer'} ce véhicule ?`)) handleToggle(car); }}
                          style={{ fontSize: 13, color: car.isActive ? '#DC2626' : 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 700 }}>
                          {car.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button type="button" onClick={() => handleDelete(car)}
                          style={{ fontSize: 13, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 800 }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
