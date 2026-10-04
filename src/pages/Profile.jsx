import { useState } from 'react';
import { useAuthStore, useToastStore, useLangStore } from '../store';
import { userAPI } from '../services/api';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getInitials } from '../utils/helpers';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState({ firstName:user?.firstName||'', lastName:user?.lastName||'', phone:user?.phone||'', monthlySalary:user?.monthlySalary||'' });
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const l = lang || 'fr';

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const setPw = k => e => setPwd(p=>({...p,[k]:e.target.value}));

  const saveProfile = async (e) => {
    e.preventDefault();
    try { setSaving(true); const { data } = await userAPI.updateProfile(form); updateUser(data.user); addToast('✓ ' + t('save',l), 'success'); }
    catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { addToast(l==='fr'?'Mots de passe différents':l==='en'?'Passwords don\'t match':l==='de'?'Passwörter stimmen nicht überein':l==='es'?'Las contraseñas no coinciden':l==='it'?'Le password non coincidono':'As senhas não coincidem', 'error'); return; }
    try { setSaving(true); await userAPI.changePassword({ currentPassword:pwd.current, newPassword:pwd.next }); setPwd({current:'',next:'',confirm:''}); addToast('✓ ' + (l==='fr'?'Mot de passe mis à jour':l==='en'?'Password updated':l==='de'?'Passwort aktualisiert':l==='es'?'Contraseña actualizada':l==='it'?'Password aggiornata':'Senha atualizada'), 'success'); }
    catch (err) { addToast(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const labels = {
    title:    { fr:'Mon Profil',         en:'My Profile',       de:'Mein Profil',        es:'Mi Perfil',         it:'Il mio Profilo',     pt:'Meu Perfil' },
    personal: { fr:'Informations',       en:'Personal Info',    de:'Informationen',      es:'Información',       it:'Informazioni',       pt:'Informações' },
    security: { fr:'Mot de passe',       en:'Password',         de:'Passwort',           es:'Contraseña',        it:'Password',           pt:'Senha' },
    current:  { fr:'Mot de passe actuel', en:'Current password', de:'Aktuelles Passwort', es:'Contraseña actual', it:'Password attuale',   pt:'Senha atual' },
    new_pw:   { fr:'Nouveau mot de passe', en:'New password',   de:'Neues Passwort',     es:'Nueva contraseña',  it:'Nuova password',     pt:'Nova senha' },
    confirm:  { fr:'Confirmer',          en:'Confirm',          de:'Bestätigen',         es:'Confirmar',         it:'Conferma',           pt:'Confirmar' },
  };

  const Field = ({ label, value, onChange, type='text', placeholder='' }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input-luxury" style={{ fontSize:16 }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '36px 4% 24px' : '52px 6% 32px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:'#fff', flexShrink:0 }}>
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div>
            <div className="section-eyebrow">{labels.title[l]}</div>
            <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(24px,4vw,44px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {user?.firstName} {user?.lastName}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding: isMobile ? '24px 4%' : '40px 6%', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Personal info */}
        <form onSubmit={saveProfile} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:22 }}>{labels.personal[l]}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14 }}>
              <Field label={t('first_name',l)} value={form.firstName} onChange={set('firstName')} />
              <Field label={t('last_name',l)}  value={form.lastName}  onChange={set('lastName')} />
            </div>
            <Field label={t('email',l)} value={user?.email||''} onChange={()=>{}} type="email" />
            <Field label={t('phone',l)} value={form.phone} onChange={set('phone')} type="tel" />
            <Field label={t('salary',l)} value={form.monthlySalary} onChange={set('monthlySalary')} type="number" />
            <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent:'center', padding:14, fontSize:14 }}>
              {saving ? t('loading',l) : t('save',l)}
            </button>
          </div>
        </form>

        {/* Password */}
        <form onSubmit={savePassword} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:22 }}>{labels.security[l]}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Field label={labels.current[l]} value={pwd.current} onChange={setPw('current')} type="password" placeholder="••••••••" />
            <Field label={labels.new_pw[l]}  value={pwd.next}    onChange={setPw('next')}    type="password" placeholder="••••••••" />
            <Field label={labels.confirm[l]} value={pwd.confirm} onChange={setPw('confirm')} type="password" placeholder="••••••••" />
            <button type="submit" disabled={saving} className="btn-ghost" style={{ justifyContent:'center', padding:14, fontSize:14 }}>
              {saving ? t('loading',l) : t('save',l)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
