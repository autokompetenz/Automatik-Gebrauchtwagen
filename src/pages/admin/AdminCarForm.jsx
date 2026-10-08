import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carAPI } from '../../services/api';
import { useToastStore } from '../../store';

const EMPTY = { make:'', model:'', year:new Date().getFullYear(), price:'', description:'', fuelType:'Essence', transmission:'Automatique', mileage:0, color:'', power:'', category:'Berline', imageUrl:'', imageUrl2:'', imageUrl3:'', imageUrl4:'', imageUrl5:'', imageUrl6:'', imageUrl7:'', imageUrl8:'', imageUrl9:'', imageUrl10:'', imageUrl11:'', imageUrl12:'', imageUrl13:'', imageUrl14:'', imageUrl15:'', imageUrl16:'', imageUrl17:'', imageUrl18:'', imageUrl19:'', imageUrl20:'', minSalary:'', featured:false, promotional:false, isActive:true, previousOwners:'', accidentFree:false, serviceHistory:false, historyNotes:'', technicalData:'' };

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:28, marginBottom:22, boxShadow:'var(--shadow-sm)', transition:'all 0.25s var(--ease)' }}>
      <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--red)', marginBottom:20 }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, field, type='text', placeholder, opts, rows, value, onChange }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>{label}</label>
      {opts ? (
        <select 
          name={field}
          value={value} 
          onChange={onChange} 
          className="input-luxury" 
          style={{ fontSize:15, borderRadius:10, padding:'14px 18px' }}
        >
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea 
          name={field}
          value={value} 
          onChange={onChange} 
          rows={rows} 
          placeholder={placeholder} 
          className="input-luxury" 
          style={{ resize:'none', fontSize:15, borderRadius:10, padding:'14px 18px', lineHeight:1.6 }}
        />
      ) : (
        <input 
          name={field}
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className="input-luxury" 
          style={{ fontSize:15, borderRadius:10, padding:'14px 18px' }}
        />
      )}
    </div>
  );
}

export default function AdminCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const MAX_IMAGES = 20;

  useEffect(() => () => {
    previews.forEach(p => {
      if (!p.isExisting && p.url?.startsWith('blob:')) URL.revokeObjectURL(p.url);
    });
  }, [previews]);

  useEffect(() => {
    if (isEdit) {
      carAPI.getById(id).then(r => {
        const c = r.data.car;
        setForm({ ...EMPTY, ...c, price:String(c.price), minSalary:String(c.minSalary||''), power:String(c.power||''), technicalData: c.technicalData ? JSON.stringify(c.technicalData, null, 2) : '' });
        // Load existing images (up to 20)
        const existing = [];
        const imageFields = ['imageUrl', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5', 'imageUrl6', 'imageUrl7', 'imageUrl8', 'imageUrl9', 'imageUrl10', 'imageUrl11', 'imageUrl12', 'imageUrl13', 'imageUrl14', 'imageUrl15', 'imageUrl16', 'imageUrl17', 'imageUrl18', 'imageUrl19', 'imageUrl20'];
        imageFields.forEach((field, idx) => {
          if (c[field]) {
            existing.push({ url: c[field], id: `existing-${idx + 1}`, isExisting: true, field });
          }
        });
        setExistingImages(existing);
      });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => {
    const { type, value, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [field]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? value === ''
            ? ''
            : Number(value)
          : value
    }));
  };

  const handleImageChange = (e) => {
    if (!e.target || !e.target.files) return;
    
    const files = Array.from(e.target.files);
    const currentTotal = previews.length + existingImages.length;
    
    if (currentTotal + files.length > MAX_IMAGES) {
      addToast(`Maximum ${MAX_IMAGES} images autorisées (${currentTotal}/${MAX_IMAGES} déjà sélectionnées)`, 'error');
      return;
    }
    
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          addToast(`Image ${file.name} trop volumineuse (max 10MB)`, 'error');
          return false;
        }
        return true;
      });
      
      setImageFiles(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPreviews(prev => [...prev, { 
          file: file,
          url: url,
          id: crypto.randomUUID(),
          isExisting: false
        }]);
      });
    }
    // Reset input to allow selecting the same files again
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    // Check if it's a new image preview
    const previewToRemove = previews.find(p => p.id === imageId);
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
      setImageFiles(prev => prev.filter(file => file !== previewToRemove.file));
      setPreviews(prev => prev.filter(p => p.id !== imageId));
      return;
    }
    
    // Check if it's an existing image
    const existingToRemove = existingImages.find(img => img.id === imageId);
    if (existingToRemove) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      // Clear the corresponding form field
      if (existingToRemove.field) {
        setForm(prev => ({ ...prev, [existingToRemove.field]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    const compressImage = (file) => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(file);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(1600 / img.width, 1600 / img.height, 1);
          const width = Math.round(img.width * ratio);
          const height = Math.round(img.height * ratio);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              const name = file.name.replace(/\.[^.]+$/, '.jpg');
              resolve(new File([blob], name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
      });
    };

    e.preventDefault();
    if (!isEdit && imageFiles.length === 0) {
      addToast('Ajoutez au moins une image', 'error');
      return;
    }
    setSaving(true);
    try {
      console.log('=== Frontend Debug ===');
      console.log('Form data:', form);
      console.log('Image files:', imageFiles);
      
      const formData = new FormData();
      
      // Add all form fields with proper checks
      if (form.make !== undefined && form.make !== null) formData.append('make', form.make);
      if (form.model !== undefined && form.model !== null) formData.append('model', form.model);
      if (form.year !== undefined && form.year !== null) formData.append('year', form.year);
      if (form.price !== undefined && form.price !== null) formData.append('price', form.price);
      if (form.description) formData.append('description', form.description);
      // Always include required fields that have default values
      if (form.fuelType !== undefined && form.fuelType !== null) formData.append('fuelType', form.fuelType);
      if (form.transmission !== undefined && form.transmission !== null) formData.append('transmission', form.transmission);
      if (form.mileage !== undefined && form.mileage !== null) formData.append('mileage', form.mileage);
      if (form.color) formData.append('color', form.color);
      if (form.power !== undefined && form.power !== null) formData.append('power', form.power);
      if (form.category !== undefined && form.category !== null) formData.append('category', form.category);
      if (form.minSalary !== undefined && form.minSalary !== null) formData.append('minSalary', form.minSalary);
      if (form.previousOwners !== undefined && form.previousOwners !== null && form.previousOwners !== '') formData.append('previousOwners', form.previousOwners);
      formData.append('accidentFree', form.accidentFree ? 'true' : 'false');
      formData.append('serviceHistory', form.serviceHistory ? 'true' : 'false');
      if (form.historyNotes) formData.append('historyNotes', form.historyNotes);
      formData.append('featured', form.featured ? 'true' : 'false');
      formData.append('promotional', form.promotional ? 'true' : 'false');
      formData.append('isActive', form.isActive ? 'true' : 'false');
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      
      // Add image files (compressed to avoid limite serverless, triées 1.webp, 2.webp…)
      const compressedFiles = await Promise.all(imageFiles.map(f => compressImage(f)));
      const totalSize = compressedFiles.reduce((s, f) => s + f.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        addToast('Total des images trop volumineux pour l\'upload. Envoyez moins d\'images ou compressez davantage.', 'error');
        return;
      }
      compressedFiles
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .forEach((file) => formData.append('images', file));
      
      // Add existing image URLs that weren't deleted
      existingImages.forEach(img => {
        formData.append('existingImages', img.url);
      });
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      if (isEdit) {
        await carAPI.update(id, formData);
        navigate('/admin/cars', {
          replace: true,
          state: { successMessage: 'Véhicule mis à jour avec succès' },
        });
      } else {
        await carAPI.create(formData);
        previews.forEach(p => {
          if (!p.isExisting && p.url?.startsWith('blob:')) URL.revokeObjectURL(p.url);
        });
        navigate('/admin/cars', {
          replace: true,
          state: { successMessage: 'Véhicule créé avec succès' },
        });
      }
    } catch (err) { 
      console.error('Submit error:', err);
      const msg = err.code === 'ECONNABORTED'
        ? 'Délai dépassé — trop d\'images ou connexion lente. Réessayez ou réduisez le nombre de photos.'
        : (err.response?.data?.error || 'Erreur');
      addToast(msg, 'error'); 
    }
    finally { setSaving(false); }
  };


  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:32 }}>
        <div className="section-eyebrow">{isEdit ? 'Modifier' : 'Ajouter'}</div>
        <h1 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,44px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          {isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth:780 }}>
        <Section title="Informations principales">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <Field label="Marque *" field="make" placeholder="Toyota" value={form.make} onChange={set("make")} />
            <Field label="Modèle *" field="model" placeholder="Camry" value={form.model} onChange={set("model")} />
            <Field label="Année *" field="year" type="number" placeholder="2024" value={form.year} onChange={set("year")} />
            <Field label="Prix (€) *" field="price" type="number" placeholder="25000" value={form.price} onChange={set("price")} />
          </div>
          <Field label="Description" field="description" rows={4} placeholder="Description détaillée du véhicule..." value={form.description} onChange={set("description")} />
        </Section>

        <Section title="Caractéristiques techniques">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Carburant" field="fuelType" opts={['Essence','Diesel','Electrique','Hybride']} value={form.fuelType} onChange={set("fuelType")} />
            <Field label="Transmission" field="transmission" opts={['Automatique','Manuelle']} value={form.transmission} onChange={set("transmission")} />
            <Field label="Kilométrage" field="mileage" type="number" placeholder="0" value={form.mileage} onChange={set("mileage")} />
            <Field label="Propriétaires précédents" field="previousOwners" type="number" placeholder="1" value={form.previousOwners} onChange={set("previousOwners")} />
            <Field label="Puissance (hp)" field="power" type="number" placeholder="150" value={form.power} onChange={set("power")} />
            <Field label="Historique du véhicule (notes)" field="historyNotes" rows={3} placeholder="Carnet d'entretien, contrôle technique, etc." value={form.historyNotes} onChange={set("historyNotes")} />
          </div>
        </Section>

        <Section title="Images">
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>Images *</label>
              <label 
                style={{ 
                  position:'relative',
                  display:'flex', 
                  alignItems:'center', 
                  justifyContent:'center',
                  gap:12,
                  padding:'16px 20px', 
                  background:'var(--red-bg)', 
                  border:'2px dashed var(--border-2)', 
                  borderRadius:12, 
                  cursor:'pointer', 
                  fontSize:14, 
                  color:'var(--text-2)',
                  fontWeight:600,
                  transition:'all 0.25s var(--ease)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.background='var(--bg-card2)'; e.currentTarget.style.color='var(--text)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--text-2)'; }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  id="images-input"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', zIndex:1 }}
                />
                📷 {previews.length + existingImages.length > 0 ? `${previews.length + existingImages.length} / ${MAX_IMAGES} images` : 'Choisir des images'}
              </label>
            </div>
          </div>
        </Section>

        {(previews.length > 0 || existingImages.length > 0) && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:12 }}>Aperçu ({previews.length + existingImages.length} / {MAX_IMAGES} image{previews.length + existingImages.length > 1 ? 's' : ''})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...existingImages, ...previews].map((img, index) => (
                <div key={img.id} style={{ position:'relative', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)', aspectRatio:'4/3' }}>
                  <img src={img.url} alt={`Aperçu ${index + 1}`} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:12, border:'1px solid var(--border)' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    style={{
                      position:'absolute',
                      top:8,
                      right:8,
                      background:'rgba(0,0,0,0.8)',
                      color:'#fff',
                      border:'none',
                      borderRadius:'50%',
                      width:28,
                      height:28,
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:12,
                      fontWeight:'bold',
                      transition:'all 0.2s',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background='#EF4444'; e.currentTarget.style.transform='scale(1.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.background='rgba(0,0,0,0.8)'; e.currentTarget.style.transform='scale(1)'; }}
                  >
                    ✕
                  </button>
                  <div style={{ position:'absolute', top:8, left:8, background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:'bold', boxShadow:'0 2px 8px rgba(19,40,83,0.4)' }}>
                    {index === 0 ? '★' : index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Options">
          <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
            {[['featured','Véhicule vedette (★ Top)'],['promotional','En promotion (🔥 Promo)'],['isActive','Actif (visible en catalogue)'],['accidentFree','Sans accident connu'],['serviceHistory','Historique d\'entretien complet']].map(([f,l]) => (
              <label key={f} style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', padding:'12px 16px', borderRadius:10, background:'var(--bg-card2)', border:'1px solid var(--border)', transition:'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--red-border)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
                <input type="checkbox" checked={Boolean(form[f])} onChange={set(f)} style={{ accentColor:'var(--red)', width:20, height:20, cursor:'pointer' }} />
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{l}</span>
              </label>
            ))}
          </div>
          <p style={{ fontSize:12, color:'var(--text-3)', marginTop:14, fontWeight:500, lineHeight:1.6 }}>
            💡 La mensualité est calculée automatiquement sur 75% du prix (après acompte de 25%), 6%/an, 60 mois.
          </p>
        </Section>

        <div style={{ display:'flex', gap:16, marginTop:8 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize:15, padding:'18px 36px', borderRadius:10, letterSpacing:'0.05em' }}>
            {saving ? 'Enregistrement...' : isEdit ? '✓ Mettre à jour' : '+ Créer le véhicule'}
          </button>
          <button type="button" onClick={() => navigate('/admin/cars')} className="btn-ghost" style={{ fontSize:15, padding:'18px 36px', borderRadius:10, letterSpacing:'0.05em' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}