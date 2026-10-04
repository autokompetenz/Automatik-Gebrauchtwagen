import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore, useCartStore, useToastStore, useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Login() {
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const l = lang || 'fr';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      addToast(`${t('welcome_back', l)} ${data.user.firstName} !`, 'success');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      fetchCart();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur de connexion', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? '100px 4% 40px' : '100px 6%' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px', boxShadow:'0 8px 28px rgba(19,40,83,0.3)' }}>🚗</div>
          <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', marginBottom:8 }}>{t('login_title', l)}</h1>
          <p style={{ fontSize:15, color:'var(--text-3)' }}>{t('login_sub', l)}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 36, boxShadow:'var(--shadow-md)', display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{t('email', l)}</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}
              placeholder="exemple@email.com" required className="input-luxury" style={{ fontSize:16 }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{t('password', l)}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})}
              placeholder="••••••••" required className="input-luxury" style={{ fontSize:16 }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', padding:16, fontSize:15, width:'100%', marginTop:4 }}>
            {loading ? t('loading', l) : t('login_title', l)}
          </button>

          <div style={{ height:1, background:'var(--border)' }} />
          <p style={{ textAlign:'center', fontSize:14, color:'var(--text-3)' }}>
            {t('no_account', l)}{' '}
            <Link to="/register" style={{ color:'var(--red)', fontWeight:700, textDecoration:'none' }}>{t('nav_register', l)}</Link>
          </p>
        </form>

        <div style={{ textAlign:'center', marginTop:24 }}>
          <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#25D366', textDecoration:'none', fontWeight:600, fontSize:14 }}>
            💬 {lang==='fr'?'Besoin d\'aide ? WhatsApp':lang==='en'?'Need help? WhatsApp':lang==='de'?'Hilfe? WhatsApp':lang==='es'?'¿Necesita ayuda? WhatsApp':lang==='it'?'Aiuto? WhatsApp':'Precisa de ajuda? WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  );
}
