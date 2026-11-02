import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useSite } from '../../context/SiteContext.jsx'

function Field({ label, value, onChange, textarea }) {
  return (
    <div className="field">
      <label>{label}</label>
      {textarea ? (
        <textarea className="input" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

function UploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false)

  async function onFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.upload(file)
      onChange(res.url)
    } catch (err) {
      alert(err.message || 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Вставьте ссылку или загрузите файл"
        />
        <label className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
          {uploading ? '…' : '📁 Загрузить'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
        </label>
      </div>
      {value && (
        <img
          src={value}
          alt=""
          style={{ marginTop: 8, width: 160, height: 90, objectFit: 'cover', borderRadius: 8 }}
        />
      )}
    </div>
  )
}

function SlidesManager() {
  const { show } = useToast()
  const [slides, setSlides] = useState(null)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    api
      .get('/slides')
      .then(setSlides)
      .catch(() => setSlides([]))
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setSaving(true)
    try {
      if (edit.id) await api.put('/admin/slides/' + edit.id, edit)
      else await api.post('/admin/slides', edit)
      show('Слайд сохранён ✅')
      setEdit(null)
      load()
    } catch (e) {
      show(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить слайд?')) return
    try {
      await api.del('/admin/slides/' + id)
      show('Слайд удалён 🗑')
      load()
    } catch (e) {
      show(e.message, 'error')
    }
  }

  return (
    <div className="card mt-16">
      <div className="between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ marginTop: 0 }}>Слайдер</h3>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setEdit({ tag: '', title: '', text: '', icon: '📺', link: '', image: '' })}
        >
          ➕ Добавить слайд
        </button>
      </div>

      {slides === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : slides.length === 0 ? (
        <p className="text-muted">Слайдов пока нет — добавьте первый.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="row between"
              style={{ gap: 8, padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}
            >
              <span>
                <strong>#{i + 1}</strong> {s.icon} {s.title}{' '}
                <span className="text-muted">{s.tag ? `· ${s.tag}` : ''}</span>
              </span>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEdit({ ...s })}>
                  ✏️
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div className="card mt-8" style={{ padding: 16, background: 'var(--bg)' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Заголовок" value={edit.title} onChange={(v) => setEdit((f) => ({ ...f, title: v }))} />
            <Field label="Метка" value={edit.tag} onChange={(v) => setEdit((f) => ({ ...f, tag: v }))} />
            <Field label="Иконка (emoji)" value={edit.icon} onChange={(v) => setEdit((f) => ({ ...f, icon: v }))} />
            <Field label="Ссылка (куда ведёт)" value={edit.link} onChange={(v) => setEdit((f) => ({ ...f, link: v }))} />
          </div>
          <Field label="Текст" value={edit.text} onChange={(v) => setEdit((f) => ({ ...f, text: v }))} textarea />
          <UploadField label="Фото на фон (необязательно)" value={edit.image} onChange={(v) => setEdit((f) => ({ ...f, image: v }))} />
          <div className="row mt-8" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Сохранение…' : '💾 Сохранить слайд'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEdit(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

export default function AdminSite() {
  const { show } = useToast()
  const { refresh } = useSite()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/site')
      .then(setForm)
      .catch(() => show('Не удалось загрузить контент', 'error'))
  }, [])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await api.put('/admin/site', form)
      await refresh()
      show('Сохранено ✅')
    } catch (e) {
      show(e.message || 'Ошибка сохранения', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <p className="text-muted">Загрузка…</p>

  return (
    <div>
      <div className="admin-page__head">
        <h2>🌐 Сайт</h2>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Сохранение…' : '💾 Сохранить'}
        </button>
      </div>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Здесь редактируется содержание главной страницы: герой, слайдер и контакты. Слайды сохраняются отдельно (сразу).
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Герой (главная)</h3>
        <Field label="Заголовок" value={form.heroTitle} onChange={(v) => set('heroTitle', v)} />
        <Field label="Подзаголовок" value={form.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} textarea />
        <UploadField label="Фото на фон" value={form.heroImage} onChange={(v) => set('heroImage', v)} />
      </div>

      <SlidesManager />

      <div className="card mt-16">
        <h3 style={{ marginTop: 0 }}>Контакты</h3>
        <div style={twoCol}>
          <Field label="Телефон" value={form.phone} onChange={(v) => set('phone', v)} />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
          <Field label="Telegram (username)" value={form.telegram} onChange={(v) => set('telegram', v)} />
          <Field label="Город" value={form.city} onChange={(v) => set('city', v)} />
          <Field label="Текст доставки" value={form.deliveryText} onChange={(v) => set('deliveryText', v)} />
        </div>
      </div>
    </div>
  )
}
