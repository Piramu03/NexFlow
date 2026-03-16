import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DARK = {bg:'#0a0a0a',surface:'#111111',elevated:'#161616',hover:'#1a1a1a',border:'#222222',accent:'#f97316',accentDark:'#1a1200',text:'#ffffff',textSec:'#aaaaaa',textMuted:'#555555',successBg:'#0a1f0a',successFg:'#4ade80',errorBg:'#1a0808',errorFg:'#f87171',warnBg:'#1a1200',warnFg:'#fbbf24',infoBg:'#0a1522',infoFg:'#60a5fa'}
const LIGHT = {bg:'#f5f5f0',surface:'#ffffff',elevated:'#f9f9f6',hover:'#fff8f0',border:'#e5e5e0',accent:'#f97316',accentDark:'#fff3e0',text:'#111111',textSec:'#555555',textMuted:'#999999',successBg:'#f0fdf4',successFg:'#16a34a',errorBg:'#fff5f5',errorFg:'#dc2626',warnBg:'#fffbeb',warnFg:'#d97706',infoBg:'#eff6ff',infoFg:'#1d4ed8'}
const getIsDark = () => { try { return localStorage.getItem('nexflow-theme') !== 'light' } catch { return true } }

const statusStyle = (s,C) => {
  if(s==='completed') return {bg:C.accentDark,fg:C.accent,border:'rgba(249,115,22,0.4)'}
  if(s==='failed')    return {bg:C.errorBg,fg:C.errorFg,border:'rgba(220,38,38,0.3)'}
  if(s==='cancelled') return {bg:C.warnBg,fg:C.warnFg,border:'rgba(217,119,6,0.3)'}
  return {bg:C.infoBg,fg:C.infoFg,border:'rgba(29,78,216,0.3)'}
}

export default function AuditLog() {
  const [execs, setExecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(getIsDark)
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setIsDark(getIsDark())
    const interval = setInterval(sync, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { load() }, [])

  const C = isDark ? DARK : LIGHT

  const load = async () => {
    try {
      setLoading(true)
      const r = await fetch('http://127.0.0.1:8000/api/executions/')
      const d = await r.json()
      setExecs(d.results||d)
    } catch(e){console.error(e)}
    setLoading(false)
  }

  const totalCompleted = execs.filter(e=>e.status==='completed').length
  const totalFailed = execs.filter(e=>e.status==='failed').length
  const successRate = execs.length?Math.round((totalCompleted/execs.length)*100):0

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto',transition:'all 0.3s'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingTop:'8px'}}>
        <div>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'4px',fontFamily:'Inter,sans-serif'}}>Compliance & Tracking</p>
          <h1 style={{color:C.text,fontSize:'36px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'-0.5px',lineHeight:1,marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>
            Audit <span style={{color:C.accent}}>Log</span>
          </h1>
          <p style={{color:C.textMuted,fontSize:'12px',fontFamily:'JetBrains Mono,monospace'}}>{execs.length} execution{execs.length!==1?'s':''} recorded</p>
        </div>
        <button onClick={load} style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'10px 20px',borderRadius:'5px',cursor:'pointer',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>⟳ Refresh</button>
      </div>

      <div style={{height:'2px',background:'linear-gradient(90deg, #f97316, rgba(249,115,22,0.4), transparent)',marginBottom:'24px'}}></div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[
          {label:'Total',value:execs.length,color:C.accent},
          {label:'Completed',value:totalCompleted,color:C.successFg},
          {label:'Failed',value:totalFailed,color:C.errorFg},
          {label:'Success Rate',value:`${successRate}%`,color:C.accent},
        ].map(s=>(
          <div key={s.label} style={{background:C.surface,borderRadius:'6px',padding:'16px 18px',border:`1px solid ${C.border}`,borderTop:`2px solid ${s.color}`,transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 8px rgba(0,0,0,0.05)'}}>
            <p style={{color:C.textMuted,fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>{s.label}</p>
            <p style={{color:s.color,fontSize:'28px',fontWeight:'900',lineHeight:1,fontFamily:'Inter,sans-serif'}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{textAlign:'center',padding:'80px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Loading...</div>
      ) : execs.length===0 ? (
        <div style={{textAlign:'center',padding:'80px',background:C.surface,borderRadius:'8px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',transition:'all 0.3s'}}>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'12px',fontFamily:'Inter,sans-serif'}}>Empty Log</p>
          <h3 style={{color:C.text,fontSize:'20px',fontWeight:'900',textTransform:'uppercase',marginBottom:'10px',fontFamily:'Inter,sans-serif'}}>No Executions Yet</h3>
          <p style={{color:C.textMuted,fontSize:'13px',fontFamily:'Inter,sans-serif'}}>Execute a workflow to see logs here</p>
        </div>
      ) : (
        <div style={{background:C.surface,borderRadius:'8px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',overflow:'hidden',transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.2fr 70px 130px 70px 1fr 130px',gap:'12px',padding:'13px 22px',background:C.elevated,borderBottom:`1px solid ${C.border}`}}>
            {['Execution ID','Workflow','Version','Status','Steps','Started','Actions'].map(h=>(
              <span key={h} style={{color:C.text,fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif'}}>{h}</span>
            ))}
          </div>

          {execs.map((ex,i)=>{
            const st=statusStyle(ex.status,C)
            return (
              <div key={ex.id}
                style={{display:'grid',gridTemplateColumns:'1.2fr 1.2fr 70px 130px 70px 1fr 130px',gap:'12px',padding:'15px 22px',borderBottom:i<execs.length-1?`1px solid ${C.border}`:'none',alignItems:'center',transition:'all 0.15s',borderLeft:'3px solid transparent'}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.hover;e.currentTarget.style.borderLeftColor='#f97316';e.currentTarget.style.paddingLeft='19px'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderLeftColor='transparent';e.currentTarget.style.paddingLeft='22px'}}
              >
                <span style={{color:C.textMuted,fontSize:'11px',fontFamily:'JetBrains Mono,monospace',fontWeight:'600'}}>{ex.id?.slice(0,8)}...</span>
                <span style={{color:C.text,fontWeight:'700',fontSize:'13px',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>{ex.workflow_name||'Workflow'}</span>
                <span style={{color:C.textSec,fontSize:'12px',fontFamily:'JetBrains Mono,monospace',fontWeight:'700'}}>v{ex.workflow_version}</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:'6px',background:st.bg,color:st.fg,padding:'5px 10px',borderRadius:'4px',fontSize:'11px',fontWeight:'800',border:`1px solid ${st.border}`,textTransform:'uppercase',letterSpacing:'0.4px',width:'fit-content',fontFamily:'Inter,sans-serif'}}>
                  <span style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:st.fg}}></span>
                  {ex.status}
                </span>
                <span style={{color:C.accent,fontWeight:'900',fontSize:'16px',fontFamily:'Inter,sans-serif'}}>{ex.logs?.length||0}</span>
                <span style={{color:C.textMuted,fontSize:'11px',fontFamily:'JetBrains Mono,monospace'}}>{new Date(ex.started_at).toLocaleString()}</span>
                <button onClick={()=>navigate(`/executions/${ex.id}`)} style={{background:'#f97316',color:'#000',border:'none',padding:'7px 14px',borderRadius:'5px',cursor:'pointer',fontSize:'11px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>View Logs</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}