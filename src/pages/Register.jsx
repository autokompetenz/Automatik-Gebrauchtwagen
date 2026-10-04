import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

function Field({ label, name, type='text', placeholder, required=false, value, onChange }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        required={required} className="input-luxury" style={{ fontSize:16 }} />
    </div>
  );
}

export default function Register() {
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'', lastName:'', username:'', email:'', password:'', phone:'', monthlySalary:'' });
  const [loading, setLoading] = useState(false);
  const l = lang || 'fr';
  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
      await fetchCart();
      addToast(`🎉 ${t('welcome_back', l)} ${data.user.firstName} !`, 'success');
      navigate('/dashboard?welcome=1');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? '100px 4% 60px' : '100px 6%' }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px', boxShadow:'0 8px 28px rgba(19,40,83,0.3)' }}>🚗</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', marginBottom:8 }}>{t('register_title', l)}</h1>
          <p style={{ fontSize:14, color:'var(--text-3)' }}>Automatik Gebrauchtwagen</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 22 : 36, boxShadow:'var(--shadow-md)', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label={t('first_name', l)} value={form.firstName} onChange={set('firstName')} placeholder="Jean" required />
            <Field label={t('last_name', l)}  value={form.lastName} onChange={set('lastName')} placeholder="Dupont" required />
          </div>
          <Field label="Nom d'utilisateur" value={form.username} onChange={set('username')} placeholder="jean.dupont" required />
          <Field label={t('email', l)} value={form.email} onChange={set('email')} type="email" placeholder="jean@email.com" required />
          <Field label={t('password', l)} value={form.password} onChange={set('password')} type="password" placeholder="••••••••" required />
          <Field label={t('phone', l)} value={form.phone} onChange={set('phone')} type="tel" placeholder="+33 6 00 00 00 00" />
          <Field label={t('salary', l)} value={form.monthlySalary} onChange={set('monthlySalary')} type="number" placeholder="2500" />

          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', padding:16, fontSize:15, width:'100%', marginTop:4 }}>
            {loading ? t('loading', l) : t('register_title', l)}
          </button>

          <div style={{ height:1, background:'var(--border)' }} />
          <p style={{ textAlign:'center', fontSize:14, color:'var(--text-3)' }}>
            {t('already_account', l)}{' '}
            <Link to="/login" style={{ color:'var(--red)', fontWeight:700, textDecoration:'none' }}>{t('nav_login', l)}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
