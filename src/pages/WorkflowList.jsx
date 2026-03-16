import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Theme Definitions ─────────────────────────
const DARK = {
  bg:          '#0a0a0a',
  surface:     '#111111',
  elevated:    '#161616',
  hover:       '#1a1a1a',
  border:      '#222222',
  accent:      '#f97316',
  accentDark:  '#1a1200',
  accentMuted: '#7a3a08',
  text:        '#ffffff',
  textSec:     '#aaaaaa',
  textMuted:   '#555555',
  inputBg:     '#0a0a0a',
  inputBorder: '#222222',
  successBg:   '#0a1f0a',
  successFg:   '#4ade80',
  errorBg:     '#1a0808',
  errorFg:     '#f87171',
}

const LIGHT = {
  bg:          '#f5f5f0',
  surface:     '#ffffff',
  elevated:    '#f9f9f6',
  hover:       '#fff8f0',
  border:      '#e5e5e0',
  accent:      '#f97316',
  accentDark:  '#fff3e0',
  accentMuted: '#fb923c',
  text:        '#111111',
  textSec:     '#555555',
  textMuted:   '#999999',
  inputBg:     '#ffffff',
  inputBorder: '#e0e0db',
  successBg:   '#f0fdf4',
  successFg:   '#16a34a',
  errorBg:     '#fff5f5',
  errorFg:     '#dc2626',
}

// ── Helper: read theme from localStorage ──────
const getTheme = () => {
  try { return localStorage.getItem('nexflow-theme') !== 'light' }
  catch { return true }
}

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDark, setIsDark] = useState(getTheme)
  const navigate = useNavigate()

  // Sync with Navbar toggle
  useEffect(() => {
    const sync = () => setIsDark(getTheme())
    window.addEventListener('storage', sync)
    // Also poll every 300ms to catch same-tab changes
    const interval = setInterval(sync, 300)
    return () => { window.removeEventListener('storage', sync); clearInterval(interval) }
  }, [])

  useEffect(() => { load() }, [search])

  const C = isDark ? DARK : LIGHT

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:8000/api/workflows/${search ? `?search=${search}` : ''}`)
      const d = await res.json()
      setWorkflows(d.results || d)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const del = async (id) => {
    if (!window.confirm('Delete workflow?')) return
    await fetch(`http://127.0.0.1:8000/api/workflows/${id}/`, { method:'DELETE' })
    load()
  }

  // ── Styles ────────────────────────────────────
  const btnPrimary = {
    background: C.accent, color: '#000',
    border: 'none', padding: '11px 22px',
    borderRadius: '5px', cursor: 'pointer',
    fontWeight: '900', fontSize: '13px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    fontFamily: 'Inter, sans-serif',
    transition: 'opacity 0.15s',
  }
  const btnEdit = {
    background: C.accentDark,
    color: C.accent,
    border: `1px solid rgba(249,115,22,0.4)`,
    padding: '7px 14px', borderRadius: '5px',
    cursor: 'pointer', fontWeight: '700',
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.3px', fontFamily: 'Inter, sans-serif',
  }
  const btnRun = {
    background: C.accent, color: '#000',
    border: 'none', padding: '7px 14px',
    borderRadius: '5px', cursor: 'pointer',
    fontWeight: '900', fontSize: '11px',
    textTransform: 'uppercase', letterSpacing: '0.3px',
    fontFamily: 'Inter, sans-serif',
  }
  const btnDel = {
    background: C.errorBg, color: C.errorFg,
    border: `1px solid ${isDark ? 'rgba(248,113,113,0.25)' : 'rgba(220,38,38,0.2)'}`,
    padding: '7px 10px', borderRadius: '5px',
    cursor: 'pointer', fontWeight: '700', fontSize: '11px',
    fontFamily: 'Inter, sans-serif',
  }

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      animation: 'fadeIn 0.3s ease',
      transition: 'all 0.3s ease',
    }}>

      {/* ── Page Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingTop:'8px' }}>
        <div>
          <p style={{ color:C.accent, fontSize:'11px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'6px', fontFamily:'Inter,sans-serif' }}>
            Automation System
          </p>
          <h1 style={{ fontSize:'36px', fontWeight:'900', color:C.text, textTransform:'uppercase', letterSpacing:'-0.5px', lineHeight:1, marginBottom:'6px', fontFamily:'Inter,sans-serif' }}>
            Work<span style={{ color:C.accent }}>flows</span>
          </h1>
          <p style={{ color:C.textMuted, fontSize:'12px', fontFamily:'JetBrains Mono, monospace' }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button onClick={() => navigate('/workflows/new')} style={btnPrimary}>
          + New Workflow
        </button>
      </div>

      {/* ── Orange Divider ── */}
      <div style={{ height:'2px', background:`linear-gradient(90deg, ${C.accent}, rgba(249,115,22,0.4), transparent)`, marginBottom:'24px', borderRadius:'1px' }}></div>

      {/* ── Search ── */}
      <div style={{ position:'relative', marginBottom:'22px' }}>
        <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:'15px' }}>⌕</span>
        <input
          placeholder="Search workflows..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 40px',
            background: C.inputBg,
            border: `1px solid ${C.inputBorder}`,
            borderTop: `2px solid rgba(249,115,22,0.3)`,
            borderRadius: '6px', color: C.text, fontSize: '14px',
            boxSizing: 'border-box', outline: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
          onFocus={e => { e.target.style.borderTopColor = C.accent; e.target.style.borderColor = `rgba(249,115,22,0.4)` }}
          onBlur={e => { e.target.style.borderTopColor = 'rgba(249,115,22,0.3)'; e.target.style.borderColor = C.inputBorder }}
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'80px', color:C.textMuted, textTransform:'uppercase', letterSpacing:'1px', fontWeight:'700', fontFamily:'Inter,sans-serif' }}>
          Loading...
        </div>
      ) : workflows.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'80px 40px',
          background: C.surface, borderRadius:'8px',
          border: `1px solid ${C.border}`,
          borderTop: `3px solid ${C.accent}`,
          transition: 'all 0.3s',
        }}>
          <p style={{ color:C.accent, fontSize:'11px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'12px', fontFamily:'Inter,sans-serif' }}>Get Started</p>
          <h3 style={{ color:C.text, fontSize:'22px', fontWeight:'900', textTransform:'uppercase', marginBottom:'10px', fontFamily:'Inter,sans-serif' }}>No Workflows Yet</h3>
          <p style={{ color:C.textMuted, fontSize:'13px', marginBottom:'28px' }}>Create your first automation workflow</p>
          <button onClick={() => navigate('/workflows/new')} style={btnPrimary}>+ Create Workflow</button>
        </div>
      ) : (
        <div style={{
          background: C.surface,
          borderRadius: '8px',
          border: `1px solid ${C.border}`,
          borderTop: `3px solid ${C.accent}`,
          overflow: 'hidden',
          transition: 'all 0.3s',
          boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          {/* Table Header */}
          <div style={{
            display:'grid', gridTemplateColumns:'2fr 80px 100px 140px 200px',
            gap:'12px', padding:'13px 22px',
            background: C.elevated,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {['Workflow Name','Steps','Version','Status','Actions'].map(h => (
              <span key={h} style={{ color:C.text, fontSize:'11px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.8px', fontFamily:'Inter,sans-serif' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {workflows.map((wf, i) => (
            <div key={wf.id}
              style={{
                display:'grid', gridTemplateColumns:'2fr 80px 100px 140px 200px',
                gap:'12px', padding:'17px 22px',
                borderBottom: i < workflows.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems:'center', transition:'all 0.15s',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.hover
                e.currentTarget.style.borderLeftColor = C.accent
                e.currentTarget.style.paddingLeft = '19px'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderLeftColor = 'transparent'
                e.currentTarget.style.paddingLeft = '22px'
              }}
            >
              {/* Name */}
              <div>
                <p style={{ color:C.text, fontWeight:'700', fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:'3px', fontFamily:'Inter,sans-serif' }}>
                  {wf.name}
                </p>
                <p style={{ color:C.textMuted, fontSize:'10px', fontFamily:'JetBrains Mono, monospace' }}>
                  {wf.id?.slice(0, 8)}...
                </p>
              </div>

              {/* Steps */}
              <div style={{
                width:'36px', height:'36px',
                background: C.accentDark,
                border: `2px solid ${C.accent}`,
                borderRadius: '5px',
                display:'flex', alignItems:'center', justifyContent:'center',
                color: C.accent, fontWeight:'900', fontSize:'16px',
                fontFamily: 'Inter, sans-serif',
              }}>{wf.steps?.length || 0}</div>

              {/* Version */}
              <span style={{ color:C.textSec, fontSize:'12px', fontFamily:'JetBrains Mono, monospace', fontWeight:'700' }}>
                v{wf.version}
              </span>

              {/* Status — Orange badge */}
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'6px',
                background: wf.is_active ? C.accentDark : C.errorBg,
                color: wf.is_active ? C.accent : C.errorFg,
                padding:'5px 12px', borderRadius:'4px',
                fontSize:'11px', fontWeight:'800',
                border:`1px solid ${wf.is_active ? 'rgba(249,115,22,0.4)' : 'rgba(220,38,38,0.3)'}`,
                textTransform:'uppercase', letterSpacing:'0.4px',
                width:'fit-content', fontFamily:'Inter,sans-serif',
              }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor: wf.is_active ? C.accent : C.errorFg }}></span>
                {wf.is_active ? 'Active' : 'Inactive'}
              </span>

              {/* Actions */}
              <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={() => navigate(`/workflows/${wf.id}/edit`)} style={btnEdit}>Edit</button>
                <button onClick={() => navigate(`/workflows/${wf.id}/execute`)} style={btnRun}>▶ Run</button>
                <button onClick={() => del(wf.id)} style={btnDel}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      
    </div>
  )
}