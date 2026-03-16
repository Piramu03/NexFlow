import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const DARK = {bg:'#0a0a0a',surface:'#111111',elevated:'#161616',border:'#222222',accent:'#f97316',accentDark:'#1a1200',text:'#ffffff',textSec:'#aaaaaa',textMuted:'#555555',inputBg:'#0a0a0a',inputBorder:'#222222',successBg:'#0a1f0a',successFg:'#4ade80',errorBg:'#1a0808',errorFg:'#f87171'}
const LIGHT = {bg:'#f5f5f0',surface:'#ffffff',elevated:'#f9f9f6',border:'#e5e5e0',accent:'#f97316',accentDark:'#fff3e0',text:'#111111',textSec:'#555555',textMuted:'#999999',inputBg:'#ffffff',inputBorder:'#e0e0db',successBg:'#f0fdf4',successFg:'#16a34a',errorBg:'#fff5f5',errorFg:'#dc2626'}
const getIsDark = () => { try { return localStorage.getItem('nexflow-theme') !== 'light' } catch { return true } }

export default function ExecuteWorkflow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(getIsDark)
  const [workflow, setWorkflow] = useState(null)
  const [inputData, setInputData] = useState({})
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const sync = () => setIsDark(getIsDark())
    const interval = setInterval(sync, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { load() }, [id])

  const C = isDark ? DARK : LIGHT
  const inp = {width:'100%',padding:'11px 14px',borderRadius:'5px',border:`1px solid ${C.inputBorder}`,borderTop:'2px solid rgba(249,115,22,0.3)',background:C.inputBg,color:C.text,fontSize:'14px',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}
  const lbl = {color:C.textSec,fontSize:'11px',marginBottom:'6px',display:'block',textTransform:'uppercase',letterSpacing:'0.6px',fontWeight:'700',fontFamily:'Inter,sans-serif'}
  const card = {background:C.surface,borderRadius:'8px',padding:'24px',marginBottom:'20px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 12px rgba(0,0,0,0.06)'}

  const load = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/workflows/${id}/`)
    const d = await r.json()
    setWorkflow(d)
    const defaults={}
    Object.entries(d.input_schema||{}).forEach(([k,v])=>{defaults[k]=v.type==='number'?0:''})
    setInputData(defaults)
    setLoading(false)
  }

  const execute = async () => {
    setExecuting(true); setMsg('')
    const schema=workflow.input_schema||{}
    const processed={}
    Object.entries(inputData).forEach(([k,v])=>{processed[k]=schema[k]?.type==='number'?parseFloat(v)||0:v})
    const r = await fetch(`http://127.0.0.1:8000/api/workflows/${id}/execute/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:processed})})
    const d = await r.json()
    if(r.ok){setMsg('✅ Workflow executed successfully!');setTimeout(()=>navigate(`/executions/${d.execution_id}`),1000)}
    else setMsg(`❌ ${JSON.stringify(d)}`)
    setExecuting(false)
  }

  if(loading) return <div style={{textAlign:'center',padding:'60px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Loading...</div>

  return (
    <div style={{maxWidth:'700px',margin:'0 auto',transition:'all 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingTop:'8px'}}>
        <div>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'4px',fontFamily:'Inter,sans-serif'}}>Execution Mode</p>
          <h1 style={{color:C.text,fontSize:'28px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'-0.3px',fontFamily:'Inter,sans-serif'}}>
            Execute <span style={{color:C.accent}}>Workflow</span>
          </h1>
          <p style={{color:C.accent,fontSize:'13px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',marginTop:'4px',fontFamily:'Inter,sans-serif'}}>
            {workflow?.name} <span style={{color:C.textMuted}}>v{workflow?.version}</span>
          </p>
        </div>
        <button onClick={()=>navigate('/workflows')} style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>← Back</button>
      </div>

      <div style={{height:'2px',background:'linear-gradient(90deg, #f97316, rgba(249,115,22,0.4), transparent)',marginBottom:'24px'}}></div>

      {msg&&(<div style={{padding:'14px 18px',borderRadius:'5px',marginBottom:'20px',background:msg.includes('❌')?C.errorBg:C.successBg,color:msg.includes('❌')?C.errorFg:C.successFg,border:`1px solid ${msg.includes('❌')?'rgba(220,38,38,0.3)':'rgba(22,163,74,0.3)'}`,fontSize:'13px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>{msg}</div>)}

      {/* Steps Preview */}
      <div style={card}>
        <h3 style={{color:C.text,fontSize:'12px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'14px',fontFamily:'Inter,sans-serif'}}>Workflow Steps</h3>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          {workflow?.steps?.map((step,i)=>(
            <div key={step.id} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{background:C.accentDark,color:C.text,padding:'6px 14px',borderRadius:'4px',fontSize:'12px',border:`1px solid rgba(249,115,22,0.3)`,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>
                {i+1}. {step.name}
              </span>
              {i<workflow.steps.length-1&&<span style={{color:C.textMuted,fontSize:'16px',fontWeight:'900'}}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div style={card}>
        <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>Input Data</h2>
        <p style={{color:C.textMuted,fontSize:'12px',marginBottom:'24px',fontFamily:'Inter,sans-serif'}}>Fill in required fields to start execution</p>

        {Object.keys(workflow?.input_schema||{}).length===0?(
          <p style={{color:C.textMuted,fontSize:'13px',fontFamily:'Inter,sans-serif'}}>No input fields defined.</p>
        ):Object.entries(workflow?.input_schema||{}).map(([key,fieldDef])=>(
          <div key={key} style={{marginBottom:'18px'}}>
            <label style={lbl}>
              {key}{fieldDef.required&&<span style={{color:C.errorFg}}> *</span>}
              <span style={{color:C.textMuted,marginLeft:'8px',textTransform:'none',letterSpacing:0,fontWeight:'400'}}>({fieldDef.type})</span>
            </label>
            {fieldDef.allowed_values?(
              <select style={{...inp,cursor:'pointer'}} value={inputData[key]||''} onChange={e=>setInputData({...inputData,[key]:e.target.value})}>
                <option value="">-- Select --</option>
                {fieldDef.allowed_values.map(v=>(<option key={v} value={v}>{v}</option>))}
              </select>
            ):(
              <input style={inp} type={fieldDef.type==='number'?'number':'text'} placeholder={`Enter ${key}...`} value={inputData[key]||''} onChange={e=>setInputData({...inputData,[key]:e.target.value})}/>
            )}
          </div>
        ))}

        <button onClick={execute} disabled={executing} style={{width:'100%',marginTop:'8px',background:executing?C.accentMuted||'#7a3a08':'#f97316',color:'#000',border:'none',padding:'14px',borderRadius:'6px',cursor:executing?'not-allowed':'pointer',fontWeight:'900',fontSize:'15px',textTransform:'uppercase',letterSpacing:'1px',transition:'opacity 0.2s',fontFamily:'Inter,sans-serif'}}>
          {executing?'Executing...':'▶  Start Execution'}
        </button>
      </div>
    </div>
  )
}