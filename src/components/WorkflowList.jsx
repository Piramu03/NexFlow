import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:        '#0f0d04',
  surface:   '#1a1508',
  elevated:  '#231d0a',
  hover:     '#2c240e',
  border:    '#3a2e10',
  accent:    '#C78438',
  accentSec: '#F3ED60',
  accentMuted: '#8a5c26',
  accentGlow: 'rgba(199,132,56,0.12)',
  text:      '#e0d5c0',
  textSec:   '#a89880',
  textMuted: '#6b5d45',
  success:   { bg: '#1a2e10', text: '#7bc67a' },
  error:     { bg: '#2e1010', text: '#f87171' },
  info:      { bg: '#0e1a2e', text: '#60a5fa' },
  warning:   { bg: '#2e1f08', text: '#fbbf24' },
}

const btn = {
  primary: {
    backgroundColor: C.accent,
    color: '#0f0d04',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.3px',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: C.accent,
    border: `1px solid ${C.accentMuted}`,
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  danger: {
    backgroundColor: C.error.bg,
    color: C.error.text,
    border: '1px solid #4a1515',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  success: {
    backgroundColor: C.accentGlow,
    color: C.accent,
    border: `1px solid ${C.accentMuted}`,
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
}

function WorkflowList() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchWorkflows()
  }, [search])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const url = search
        ? `http://127.0.0.1:8000/api/workflows/?search=${search}`
        : `http://127.0.0.1:8000/api/workflows/`
      const res = await fetch(url)
      const data = await res.json()
      setWorkflows(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this workflow?')) {
      await fetch(`http://127.0.0.1:8000/api/workflows/${id}/`, {
        method: 'DELETE'
      })
      fetchWorkflows()
    }
  }

  const stepTypeSummary = (steps) => {
    if (!steps || steps.length === 0) return '—'
    const types = steps.map(s => s.step_type)
    const counts = {}
    types.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    return Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ')
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{
            color: C.text,
            fontSize: '26px',
            fontWeight: '600',
            marginBottom: '4px',
          }}>
            Workflows
          </h1>
          <p style={{ color: C.textMuted, fontSize: '13px' }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          style={btn.primary}
          onClick={() => navigate('/workflows/new')}
        >
          + New Workflow
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: C.textMuted,
          fontSize: '14px',
        }}>⌕</span>
        <input
          type="text"
          placeholder="Search workflows..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '11px 14px 11px 38px',
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.text,
            fontSize: '14px',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: C.textMuted }}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>⟳</p>
          <p>Loading workflows...</p>
        </div>
      ) : workflows.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          backgroundColor: C.surface,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: C.accentGlow,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>⚙</div>
          <h3 style={{ color: C.text, marginBottom: '8px' }}>No workflows yet</h3>
          <p style={{ color: C.textMuted, marginBottom: '24px', fontSize: '14px' }}>
            Create your first workflow to get started
          </p>
          <button
            style={btn.primary}
            onClick={() => navigate('/workflows/new')}
          >+ Create Workflow</button>
        </div>
      ) : (
        <div style={{
          backgroundColor: C.surface,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 180px',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: C.elevated,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {['Workflow Name', 'Steps', 'Version', 'Type Summary', 'Status', 'Actions'].map(h => (
              <span key={h} style={{
                color: C.accent,
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}>{h}</span>
            ))}
          </div>

          {/* Table Rows */}
          {workflows.map((wf, i) => (
            <div
              key={wf.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 180px',
                gap: '12px',
                padding: '16px 20px',
                borderBottom: i < workflows.length - 1
                  ? `1px solid ${C.border}` : 'none',
                alignItems: 'center',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.hover}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Name */}
              <div>
                <p style={{
                  color: C.text,
                  fontWeight: '500',
                  fontSize: '14px',
                  marginBottom: '2px',
                }}>{wf.name}</p>
                <p style={{
                  color: C.textMuted,
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {wf.id?.substring(0, 8)}...
                </p>
              </div>

              {/* Steps */}
              <span style={{
                color: C.accentSec,
                fontWeight: '600',
                fontSize: '16px',
              }}>
                {wf.steps?.length || 0}
              </span>

              {/* Version */}
              <span style={{
                color: C.textSec,
                fontSize: '13px',
              }}>v{wf.version}</span>

              {/* Type Summary */}
              <span style={{
                color: C.textMuted,
                fontSize: '12px',
              }}>{stepTypeSummary(wf.steps)}</span>

              {/* Status */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: wf.is_active
                  ? 'rgba(199,132,56,0.1)'
                  : C.error.bg,
                color: wf.is_active ? C.accent : C.error.text,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                border: wf.is_active
                  ? '1px solid rgba(199,132,56,0.25)'
                  : '1px solid #4a1515',
                width: 'fit-content',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: wf.is_active ? C.accent : C.error.text,
                }}></span>
                {wf.is_active ? 'Active' : 'Inactive'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                  style={{ ...btn.secondary, padding: '6px 12px', fontSize: '12px' }}
                >Edit</button>
                <button
                  onClick={() => navigate(`/workflows/${wf.id}/execute`)}
                  style={{ ...btn.success, padding: '6px 12px', fontSize: '12px' }}
                >▶ Run</button>
                <button
                  onClick={() => handleDelete(wf.id)}
                  style={{ ...btn.danger, padding: '6px 10px', fontSize: '12px' }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkflowList