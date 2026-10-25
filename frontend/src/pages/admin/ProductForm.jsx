import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client.js'
import Spinner from '../../components/Spinner.jsx'

const RESOLUTIONS = [
  { value: '', label: '— выберите —' },
  { value: 'HD', label: 'HD (1280×720)' },
  { value: 'Full HD', label: 'Full HD (1920×1080)' },
  { value: '4K UHD', label: '4K UHD (3840×2160)' },
  { value: '8K', label: '8K (7680×4320)' },
]

const TECHNOLOGIES = ['QLED', 'OLED', 'LED', 'NanoCell', 'Mini-LED', 'Лазерный', 'DLP']

const EMPTY = {
  name: '',
  categoryId: '',
  price: '',
  oldPrice: '',
  brand: '',
  screenSizeInches: '',
  resolution: '',
  smartTv: false,
  stock: 0,
  active: true,
  imageUrl: '',
  slug: '',
  description: '',
  technology: '',
  refreshRateHz: '',
  hdr: '',
  os: '',
  powerOutputW: '',
  channels: '',
  luminousFluxLm: '',
  contrast: '',
  specifications: [],
  images: [],
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    api.get('/admin/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api
      .get(`/admin/products/${id}`)
      .then((p) => {
        setForm({
          name: p.name || '',
          categoryId: p.categoryId || '',
          price: p.price ?? '',
          oldPrice: p.oldPrice ?? '',
          brand: p.brand || '',
          screenSizeInches: p.screenSizeInches ?? '',
          resolution: p.resolution || '',
          smartTv: Boolean(p.smartTv),
          stock: p.stock ?? 0,
          active: p.active !== false,
          imageUrl: p.imageUrl || '',
          slug: p.slug || '',
          description: p.description || '',
          technology: p.technology || '',
          refreshRateHz: p.refreshRateHz ?? '',
          hdr: p.hdr || '',
          os: p.os || '',
          powerOutputW: p.powerOutputW ?? '',
          channels: p.channels || '',
          luminousFluxLm: p.luminousFluxLm ?? '',
          contrast: p.contrast || '',
          specifications: p.specifications
            ? Object.entries(p.specifications).map(([name, value]) => ({ name, value }))
            : [],
          images: p.images || [],
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setError('')
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        const res = await api.upload(file)
        urls.push(res.url)
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  function addSpec() {
    setForm((f) => ({ ...f, specifications: [...f.specifications, { name: '', value: '' }] }))
  }
  function updateSpec(i, field, value) {
    setForm((f) => {
      const specs = [...f.specifications]
      specs[i] = { ...specs[i], [field]: value }
      return { ...f, specifications: specs }
    })
  }
  function removeSpec(i) {
    setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }))
  }

  async function onGenerate() {
    if (!form.name || !form.brand) {
      setError('Укажите название и бренд товара')
      return
    }
    const parts = []
    if (form.screenSizeInches) parts.push(`диагональ ${form.screenSizeInches}"`)
    if (form.resolution) parts.push(`разрешение ${form.resolution}`)
    if (form.technology) parts.push(`технология ${form.technology}`)
    if (form.refreshRateHz) parts.push(`частота обновления ${form.refreshRateHz} Гц`)
    if (form.os) parts.push(`ОС ${form.os}`)
    if (form.smartTv) parts.push('Smart TV')
    setGenerating(true)
    setError('')
    try {
      const res = await api.post('/admin/ai/description', {
        name: form.name,
        brand: form.brand,
        specs: parts.join(', '),
      })
      set('description', res.description)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      name: form.name,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      oldPrice: form.oldPrice === '' || form.oldPrice === null ? null : Number(form.oldPrice),
      brand: form.brand || null,
      screenSizeInches: form.screenSizeInches === '' ? null : Number(form.screenSizeInches),
      resolution: form.resolution || null,
      smartTv: form.smartTv,
      stock: Number(form.stock),
      active: form.active,
      imageUrl: form.images[0] || null,
      slug: form.slug || null,
      description: form.description || null,
      technology: form.technology || null,
      refreshRateHz: form.refreshRateHz === '' ? null : Number(form.refreshRateHz),
      hdr: form.hdr || null,
      os: form.os || null,
      powerOutputW: form.powerOutputW === '' ? null : Number(form.powerOutputW),
      channels: form.channels || null,
      luminousFluxLm: form.luminousFluxLm === '' ? null : Number(form.luminousFluxLm),
      contrast: form.contrast || null,
      specifications: form.specifications
        .filter((s) => s.name.trim() !== '')
        .map((s) => ({ name: s.name.trim(), value: s.value })),
      images: form.images,
    }
    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      setSavedMsg(isEdit ? 'Изменения приняты' : 'Товар сохранён')
      setError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mt-24" style={{ maxWidth: 780 }}>
      <h1 className="mt-0">{isEdit ? 'Редактирование товара' : 'Новый товар'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card" style={{ padding: 24 }} onSubmit={onSubmit}>
        <div className="field">
          <label>Название *</label>
          <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Категория *</label>
            <select className="select" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              <option value="">Выберите…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Бренд</label>
            <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Цена, ₽ *</label>
            <input className="input" type="number" min="1" step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div className="field">
            <label>Старая цена, ₽</label>
            <input className="input" type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Диагональ, ″</label>
            <input className="input" type="number" min="1" value={form.screenSizeInches} onChange={(e) => set('screenSizeInches', e.target.value)} />
          </div>
          <div className="field">
            <label>Разрешение</label>
            <select className="select" value={form.resolution} onChange={(e) => set('resolution', e.target.value)}>
              {RESOLUTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Остаток, шт. *</label>
            <input className="input" type="number" min="0" required value={form.stock} onChange={(e) => set('stock', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Тип технологии</label>
            <select className="select" value={form.technology} onChange={(e) => set('technology', e.target.value)}>
              <option value="">—</option>
              {TECHNOLOGIES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Частота обновления, Гц</label>
            <input className="input" type="number" min="1" value={form.refreshRateHz} onChange={(e) => set('refreshRateHz', e.target.value)} />
          </div>
          <div className="field">
            <label>HDR</label>
            <input className="input" placeholder="HDR10+, Dolby Vision" value={form.hdr} onChange={(e) => set('hdr', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Операционная система</label>
            <input className="input" placeholder="Tizen, webOS, VIDAA…" value={form.os} onChange={(e) => set('os', e.target.value)} />
          </div>
          <div className="field">
            <label>Мощность звука, Вт</label>
            <input className="input" type="number" min="0" value={form.powerOutputW} onChange={(e) => set('powerOutputW', e.target.value)} />
          </div>
          <div className="field">
            <label>Количество каналов</label>
            <input className="input" placeholder="2.0, 2.1, 3.1.2" value={form.channels} onChange={(e) => set('channels', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Световой поток, лм (проекторы)</label>
            <input className="input" type="number" min="0" value={form.luminousFluxLm} onChange={(e) => set('luminousFluxLm', e.target.value)} />
          </div>
          <div className="field">
            <label>Контрастность (проекторы)</label>
            <input className="input" placeholder="1 000 000:1" value={form.contrast} onChange={(e) => set('contrast', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Фотографии</label>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading} />
            {uploading && <span className="text-muted">Загрузка…</span>}
          </div>
          {form.images.length > 0 && (
            <div className="row mt-8" style={{ gap: 8, flexWrap: 'wrap' }}>
              {form.images.map((url, i) => (
                <div key={url + i} style={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt=""
                    style={{ width: 80, height: 54, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                  />
                  <button type="button" className="img-remove" onClick={() => removeImage(i)} title="Удалить">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            className="input mt-8"
            placeholder="…или вставьте URL изображения и нажмите Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault()
                setForm((f) => ({ ...f, images: [...f.images, e.target.value.trim()] }))
                e.target.value = ''
              }
            }}
          />
          <div className="text-muted" style={{ fontSize: 12 }}>
            Поддерживаются: JPG, PNG, WebP, GIF, BMP, AVIF. Первое фото — главное.
          </div>
        </div>

        <div className="field">
          <label>Slug (URL)</label>
          <input className="input" placeholder="оставьте пустым для авто-генерации" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>

        <div className="field">
          <label>Описание</label>
          <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onGenerate} disabled={generating}>
              {generating ? 'Генерируем…' : '✨ Сгенерировать описание'}
            </button>
          </div>
        </div>

        <div className="row mb-16" style={{ gap: 24 }}>
          <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.smartTv} onChange={(e) => set('smartTv', e.target.checked)} />
            Smart TV
          </label>
          <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            Активен (показывать на сайте)
          </label>
        </div>

        <div className="field">
          <label>Характеристики</label>
          {form.specifications.map((spec, i) => (
            <div className="row" key={i} style={{ gap: 8, marginBottom: 8 }}>
              <input
                className="input"
                placeholder="Название (напр. Процессор)"
                value={spec.name}
                onChange={(e) => updateSpec(i, 'name', e.target.value)}
              />
              <input
                className="input"
                placeholder="Значение"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
              />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSpec(i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}>
            + Добавить характеристику
          </button>
        </div>

        {savedMsg && <div className="alert alert-success">{savedMsg}</div>}

        <div className="row">
          <button className="btn btn-primary btn-lg" disabled={saving || uploading}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
            ← К товарам
          </button>
        </div>
      </form>
    </div>
  )
}
