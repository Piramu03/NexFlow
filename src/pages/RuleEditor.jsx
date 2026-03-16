import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const DARK = {
  bg:'#0a0a0a',surface:'#111111',elevated:'#161616',hover:'#1a1a1a',
  border:'#222222',accent:'#f97316',accentDark:'#1a1200',accentMuted:'#7a3a08',
  text:'#ffffff',textSec:'#aaaaaa',textMuted:'#555555',
  inputBg:'#0a0a0a',inputBorder:'#222222',
  successBg:'#0a1f0a',successFg:'#4ade80',
  errorBg:'#1a0808',errorFg:'#f87171',
  warnBg:'#1a1200',warnFg:'#fbbf24',
}
const LIGHT = {
  bg:'#f5f5f0',surface:'#ffffff',elevated:'#f9f9f6',hover:'#fff8f0',
  border:'#e5e5e0',accent:'#f97316',accentDark:'#fff3e0',accentMuted:'#fb923c',
  text:'#111111',textSec:'#555555',textMuted:'#999999',
  inputBg:'#ffffff',inputBorder:'#e0e0db',
  successBg:'#f0fdf4',successFg:'#16a34a',
  errorBg:'#fff5f5',errorFg:'#dc2626',
  warnBg:'#fffbeb',warnFg:'#d97706',
}
const getIsDark = () => { try { return localStorage.getItem('nexflow-theme') !== 'light' } catch { return true } }

export default function RuleEditor() {
  const { workflowId, stepId } = useParams()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(getIsDark)
  const [step, setStep] = useState(null)
  const [rules, setRules] = useState([])
  const [steps, setSteps] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [condition, setCondition] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [priority, setPriority] = useState(1)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sync = () => setIsDark(getIsDark())
    const interval = setInterval(sync, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { loadData() }, [stepId])

  const C = isDark ? DARK : LIGHT
  const inp = {width:'100%',padding:'11px 14px',borderRadius:'5px',border:`1px solid ${C.inputBorder}`,borderTop:'2px solid rgba(249,115,22,0.3)',background:C.inputBg,color:C.text,fontSize:'14px',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}
  const lbl = {color:C.textSec,fontSize:'11px',marginBottom:'6px',display:'block',textTransform:'uppercase',letterSpacing:'0.6px',fontWeight:'700',fontFamily:'Inter,sans-serif'}
  const card = {background:C.surface,borderRadius:'8px',padding:'24px',marginBottom:'20px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 12px rgba(0,0,0,0.06)'}

  const loadData = async () => {
    try {
      setLoading(true)
      const wr = await fetch(`http://127.0.0.1:8000/api/workflows/${workflowId}/`)
      const wd = await wr.json()
      setSteps(wd.steps||[])
      setStep(wd.steps?.find(s=>s.id===stepId))
      const rr = await fetch(`http://127.0.0.1:8000/api/workflows/${workflowId}/steps/${stepId}/rules/`)
      const rd = await rr.json()
      setRules(rd.results||rd)
    } catch(e){console.error(e)}
    setLoading(false)
  }

  const saveRule = async () => {
    if(!condition.trim()){setMsg('❌ Condition required!');return}
    const url = editId
      ?`http://127.0.0.1:8000/api/workflows/${workflowId}/steps/${stepId}/rules/${editId}/`
      :`http://127.0.0.1:8000/api/workflows/${workflowId}/steps/${stepId}/rules/`
    const r = await fetch(url,{method:editId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({condition,priority,step:stepId,next_step:nextStep||null})})
    const d = await r.json()
    if(r.ok){setMsg('✅ Rule saved!');setModal(false);loadData()}
    else setMsg(`❌ ${JSON.stringify(d)}`)
  }

  const delRule = async (rid) => {
    if(!window.confirm('Delete rule?')) return
    await fetch(`http://127.0.0.1:8000/api/workflows/${workflowId}/steps/${stepId}/rules/${rid}/`,{method:'DELETE'})
    setMsg('✅ Deleted!'); loadData()
  }

  if(loading) return <div style={{textAlign:'center',padding:'60px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Loading...</div>

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',transition:'all 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingTop:'8px'}}>
        <div>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'4px',fontFamily:'Inter,sans-serif'}}>Rule Engine</p>
          <h1 style={{color:C.text,fontSize:'28px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'-0.3px',fontFamily:'Inter,sans-serif'}}>
            Rule <span style={{color:C.accent}}>Editor</span>
          </h1>
          <p style={{color:C.accent,fontSize:'12px',marginTop:'4px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>
            Step: {step?.name} <span style={{color:C.textMuted}}>/ {step?.step_type}</span>
          </p>
        </div>
        <button onClick={()=>navigate(`/workflows/${workflowId}/edit`)} style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>← Back</button>
      </div>

      <div style={{height:'2px',background:'linear-gradient(90deg, #f97316, rgba(249,115,22,0.4), transparent)',marginBottom:'24px'}}></div>

      {msg&&(<div style={{padding:'12px 16px',borderRadius:'5px',marginBottom:'16px',background:msg.includes('❌')?C.errorBg:C.successBg,color:msg.includes('❌')?C.errorFg:C.successFg,border:`1px solid ${msg.includes('❌')?'rgba(220,38,38,0.3)':'rgba(22,163,74,0.3)'}`,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>
        {msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:'16px'}}>✕</button>
      </div>)}

      {/* Info Card */}
      <div style={{...card,borderTop:`2px solid ${C.accentMuted}`}}>
        <h3 style={{color:C.accent,fontSize:'12px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px',fontFamily:'Inter,sans-serif'}}>How Rules Work</h3>
        <p style={{color:C.textSec,fontSize:'13px',lineHeight:'1.7',marginBottom:'12px',fontFamily:'Inter,sans-serif'}}>
          Rules are evaluated in <strong style={{color:C.text}}>priority order</strong> (lowest = first). First matching rule decides next step. Always add a <strong style={{color:C.accent}}>DEFAULT</strong> fallback.
        </p>
        
      </div>

      {/* Rules Card */}
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif'}}>Rules <span style={{color:'#f97316'}}>({rules.length})</span></h2>
          <button onClick={()=>{setEditId(null);setCondition('');setNextStep('');setPriority(rules.length+1);setModal(true)}}
            style={{background:'#f97316',color:'#000',border:'none',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'900',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>+ Add Rule</button>
        </div>

        {rules.length===0?(
          <p style={{textAlign:'center',padding:'30px',color:C.textMuted,fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>No rules yet. Click "+ Add Rule" to define conditions.</p>
        ):(
          <>
            <div style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr 100px',gap:'12px',padding:'10px 16px',background:C.elevated,borderRadius:'5px',marginBottom:'8px'}}>
              {['Priority','Condition','Next Step','Actions'].map(h=>(
                <span key={h} style={{color:C.text,fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif'}}>{h}</span>
              ))}
            </div>
            {[...rules].sort((a,b)=>a.priority-b.priority).map(rule=>{
              const ns=steps.find(s=>s.id===rule.next_step)
              const isDef=rule.condition.trim().toUpperCase()==='DEFAULT'
              return (
                <div key={rule.id} style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr 100px',gap:'12px',padding:'14px 16px',background:C.bg,borderRadius:'6px',marginBottom:'8px',border:`1px solid ${isDef?'rgba(249,115,22,0.3)':C.border}`,borderLeft:`3px solid ${isDef?'#f97316':C.border}`,alignItems:'center',transition:'all 0.2s'}}>
                  <span style={{background:C.accentDark,color:'#f97316',padding:'5px 10px',borderRadius:'4px',fontSize:'13px',fontWeight:'900',textAlign:'center',border:'1px solid rgba(249,115,22,0.4)',fontFamily:'Inter,sans-serif'}}>{rule.priority}</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'12px',color:isDef?'#f97316':C.text,background:C.elevated,padding:'6px 10px',borderRadius:'4px',wordBreak:'break-all',fontWeight:isDef?'800':'400'}}>{rule.condition}</span>
                  <span style={{color:ns?'#f97316':C.textMuted,fontSize:'13px',fontWeight:'600',fontFamily:'Inter,sans-serif'}}>{ns?`→ ${ns.name}`:rule.next_step?rule.next_step:'— End workflow'}</span>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button onClick={()=>{setEditId(rule.id);setCondition(rule.condition);setNextStep(rule.next_step||'');setPriority(rule.priority);setModal(true)}} style={{background:C.accentDark,color:'#f97316',border:'1px solid rgba(249,115,22,0.4)',padding:'6px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'12px',fontWeight:'700'}}>Edit</button>
                    <button onClick={()=>delRule(rule.id)} style={{background:C.errorBg,color:C.errorFg,border:'1px solid rgba(220,38,38,0.25)',padding:'6px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'12px',fontWeight:'700'}}>Delete</button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Modal */}
      {modal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:C.surface,borderRadius:'8px',padding:'32px',width:'520px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',boxShadow:'0 20px 60px rgba(0,0,0,0.8)',transition:'all 0.3s'}}>
            <p style={{color:'#f97316',fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>{editId?'Edit Mode':'New Rule'}</p>
            <h2 style={{color:C.text,fontSize:'20px',fontWeight:'900',textTransform:'uppercase',marginBottom:'24px',fontFamily:'Inter,sans-serif'}}>{editId?'Edit Rule':'Add Rule'}</h2>
            <label style={lbl}>Priority (lower = first)</label>
            <input type="number" style={{...inp,marginBottom:'16px'}} value={priority} min="1" onChange={e=>setPriority(parseInt(e.target.value)||1)}/>
            <label style={lbl}>Condition * <span style={{color:C.textMuted,textTransform:'none',letterSpacing:0,fontWeight:'400'}}>(use DEFAULT for fallback)</span></label>
            <input style={{...inp,marginBottom:'10px',fontFamily:'JetBrains Mono,monospace'}} placeholder="amount > 100 && country == 'US'" value={condition} onChange={e=>setCondition(e.target.value)}/>
            <div style={{marginBottom:'16px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {["amount > 100","country == 'US'","priority == 'High'","DEFAULT"].map(t=>(
                <button key={t} onClick={()=>setCondition(t)} style={{background:C.elevated,color:'#f97316',border:'1px solid rgba(249,115,22,0.3)',padding:'4px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontFamily:'JetBrains Mono,monospace',fontWeight:'600'}}>{t}</button>
              ))}
            </div>
            <label style={lbl}>Next Step (empty = end workflow)</label>
            <select style={{...inp,marginBottom:'24px',cursor:'pointer'}} value={nextStep} onChange={e=>setNextStep(e.target.value)}>
              <option value="">— End Workflow —</option>
              {steps.filter(s=>s.id!==stepId).map(s=>(<option key={s.id} value={s.id}>{s.name} ({s.step_type})</option>))}
            </select>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={saveRule} style={{flex:1,background:'#f97316',color:'#000',border:'none',padding:'12px',borderRadius:'5px',cursor:'pointer',fontWeight:'900',fontSize:'13px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>Save</button>
              <button onClick={()=>setModal(false)} style={{flex:1,background:C.errorBg,color:C.errorFg,border:'1px solid rgba(220,38,38,0.25)',padding:'12px',borderRadius:'5px',cursor:'pointer',fontSize:'13px',fontWeight:'700',textTransform:'uppercase',fontFamily:'Inter,sans-serif'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}