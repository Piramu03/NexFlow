import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const DARK = {bg:'#0a0a0a',surface:'#111111',elevated:'#161616',border:'#222222',accent:'#f97316',accentDark:'#1a1200',text:'#ffffff',textSec:'#aaaaaa',textMuted:'#555555',successBg:'#0a1f0a',successFg:'#4ade80',errorBg:'#1a0808',errorFg:'#f87171',warnBg:'#1a1200',warnFg:'#fbbf24',infoBg:'#0a1522',infoFg:'#60a5fa'}
const LIGHT = {bg:'#f5f5f0',surface:'#ffffff',elevated:'#f9f9f6',border:'#e5e5e0',accent:'#f97316',accentDark:'#fff3e0',text:'#111111',textSec:'#555555',textMuted:'#999999',successBg:'#f0fdf4',successFg:'#16a34a',errorBg:'#fff5f5',errorFg:'#dc2626',warnBg:'#fffbeb',warnFg:'#d97706',infoBg:'#eff6ff',infoFg:'#1d4ed8'}
const getIsDark = () => { try { return localStorage.getItem('nexflow-theme') !== 'light' } catch { return true } }

const statusStyle = (s,C) => {
  if(s==='completed') return {bg:C.accentDark,fg:C.accent,border:'rgba(249,115,22,0.4)'}
  if(s==='failed')    return {bg:C.errorBg,fg:C.errorFg,border:'rgba(220,38,38,0.3)'}
  if(s==='cancelled') return {bg:C.warnBg,fg:C.warnFg,border:'rgba(217,119,6,0.3)'}
  return {bg:C.infoBg,fg:C.infoFg,border:'rgba(29,78,216,0.3)'}
}

export default function ExecutionView() {
  const { executionId } = useParams()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(getIsDark)
  const [exec, setExec] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sync = () => setIsDark(getIsDark())
    const interval = setInterval(sync, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { load() }, [executionId])

  const C = isDark ? DARK : LIGHT
  const card = {background:C.surface,borderRadius:'8px',padding:'24px',marginBottom:'20px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 12px rgba(0,0,0,0.06)'}

  const load = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/executions/${executionId}/`)
    setExec(await r.json())
    setLoading(false)
  }

  if(loading) return <div style={{textAlign:'center',padding:'60px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Loading...</div>
  if(!exec)   return <div style={{textAlign:'center',padding:'60px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Execution not found.</div>

  const st = statusStyle(exec.status, C)

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',transition:'all 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingTop:'8px'}}>
        <div>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'4px',fontFamily:'Inter,sans-serif'}}>Execution Log</p>
          <h1 style={{color:C.text,fontSize:'28px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'-0.3px',fontFamily:'Inter,sans-serif'}}>
            Execution <span style={{color:C.accent}}>Result</span>
          </h1>
          <p style={{color:C.textMuted,fontSize:'11px',fontFamily:'JetBrains Mono,monospace',marginTop:'4px'}}>{exec.id}</p>
        </div>
        <button onClick={()=>navigate('/workflows')} style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>← Back</button>
      </div>

      <div style={{height:'2px',background:'linear-gradient(90deg, #f97316, rgba(249,115,22,0.4), transparent)',marginBottom:'24px'}}></div>

      {/* Status Card */}
      <div style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{color:C.textMuted,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'8px',fontFamily:'Inter,sans-serif'}}>Status</p>
          <span style={{background:st.bg,color:st.fg,padding:'7px 18px',borderRadius:'4px',fontWeight:'800',fontSize:'13px',textTransform:'uppercase',letterSpacing:'0.6px',border:`1px solid ${st.border}`,fontFamily:'Inter,sans-serif'}}>{exec.status}</span>
          <p style={{color:C.textMuted,fontSize:'12px',marginTop:'10px',fontFamily:'Inter,sans-serif'}}>Started: {new Date(exec.started_at).toLocaleString()}</p>
          {exec.ended_at&&<p style={{color:C.textMuted,fontSize:'12px',fontFamily:'Inter,sans-serif'}}>Ended: {new Date(exec.ended_at).toLocaleString()}</p>}
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{color:C.textMuted,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>Total Steps</p>
          <p style={{color:C.accent,fontSize:'44px',fontWeight:'900',lineHeight:1,fontFamily:'Inter,sans-serif'}}>{exec.logs?.length||0}</p>
        </div>
      </div>

      {/* Input Data */}
      <div style={card}>
        <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'16px',fontFamily:'Inter,sans-serif'}}>Input Data</h2>
        <div style={{background:C.bg,borderRadius:'5px',padding:'16px',fontFamily:'JetBrains Mono,monospace',fontSize:'13px',borderLeft:'3px solid #f97316',transition:'all 0.3s'}}>
          {Object.entries(exec.data||{}).map(([k,v])=>(
            <div key={k} style={{marginBottom:'6px'}}>
              <span style={{color:C.accent,fontWeight:'700'}}>{k}</span>
              <span style={{color:C.textMuted}}>: </span>
              <span style={{color:C.text}}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Logs */}
      <div style={card}>
        <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'20px',fontFamily:'Inter,sans-serif'}}>
          Step Logs <span style={{color:C.accent}}>({exec.logs?.length||0} steps)</span>
        </h2>

        {(exec.logs||[]).map((log,i)=>(
          <div key={i} style={{background:C.bg,borderRadius:'6px',padding:'20px',marginBottom:'14px',border:`1px solid ${C.border}`,borderLeft:'3px solid #f97316',transition:'all 0.3s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{width:'30px',height:'30px',background:C.accentDark,color:'#f97316',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'900',border:'1px solid rgba(249,115,22,0.4)',flexShrink:0,fontFamily:'Inter,sans-serif'}}>{i+1}</span>
                <div>
                  <p style={{color:C.text,fontWeight:'800',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:'2px',fontFamily:'Inter,sans-serif'}}>{log.step_name}</p>
                  <span style={{color:C.textMuted,fontSize:'11px',textTransform:'uppercase',fontWeight:'700',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>({log.step_type})</span>
                </div>
              </div>
              <span style={{background:C.successBg,color:C.successFg,padding:'4px 12px',borderRadius:'4px',fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.4px',border:'1px solid rgba(22,163,74,0.3)',fontFamily:'Inter,sans-serif'}}>{log.status}</span>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px'}}>
              <div style={{background:C.elevated,padding:'10px 14px',borderRadius:'5px',borderLeft:`2px solid ${C.accent}`,transition:'all 0.3s'}}>
                <p style={{color:C.textMuted,fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'4px',fontWeight:'800',fontFamily:'Inter,sans-serif'}}>Next Step</p>
                <p style={{color:C.accent,fontWeight:'800',fontSize:'13px',textTransform:'uppercase',fontFamily:'Inter,sans-serif'}}>{log.selected_next_step||'End of Workflow'}</p>
              </div>
              <div style={{background:C.elevated,padding:'10px 14px',borderRadius:'5px',transition:'all 0.3s'}}>
                <p style={{color:C.textMuted,fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'4px',fontWeight:'800',fontFamily:'Inter,sans-serif'}}>Duration</p>
                <p style={{color:C.text,fontSize:'13px',fontFamily:'JetBrains Mono,monospace',fontWeight:'700'}}>{log.duration||'N/A'}</p>
              </div>
            </div>

            {log.evaluated_rules?.length>0&&(
              <div>
                <p style={{color:C.textMuted,fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'8px',fontWeight:'800',fontFamily:'Inter,sans-serif'}}>Evaluated Rules</p>
                {log.evaluated_rules.map((r,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                    <span style={{fontSize:'14px',minWidth:'20px'}}>{r.result?'✅':'❌'}</span>
                    <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'12px',color:r.result?C.accent:C.textMuted,background:C.elevated,padding:'5px 10px',borderRadius:'4px',flex:1,fontWeight:r.result?'700':'400',transition:'all 0.3s'}}>{r.rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}