import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const DARK = {
  bg:'#0a0a0a',surface:'#111111',elevated:'#161616',hover:'#1a1a1a',
  border:'#222222',accent:'#f97316',accentDark:'#1a1200',accentMuted:'#7a3a08',
  text:'#ffffff',textSec:'#aaaaaa',textMuted:'#555555',
  inputBg:'#0a0a0a',inputBorder:'#222222',
  successBg:'#0a1f0a',successFg:'#4ade80',
  errorBg:'#1a0808',errorFg:'#f87171',
  infoBg:'#0a1522',infoFg:'#60a5fa',
  warnBg:'#1a1200',warnFg:'#fbbf24',
}
const LIGHT = {
  bg:'#f5f5f0',surface:'#ffffff',elevated:'#f9f9f6',hover:'#fff8f0',
  border:'#e5e5e0',accent:'#f97316',accentDark:'#fff3e0',accentMuted:'#fb923c',
  text:'#111111',textSec:'#555555',textMuted:'#999999',
  inputBg:'#ffffff',inputBorder:'#e0e0db',
  successBg:'#f0fdf4',successFg:'#16a34a',
  errorBg:'#fff5f5',errorFg:'#dc2626',
  infoBg:'#eff6ff',infoFg:'#1d4ed8',
  warnBg:'#fffbeb',warnFg:'#d97706',
}
const getIsDark = () => { try { return localStorage.getItem('nexflow-theme') !== 'light' } catch { return true } }

export default function WorkflowEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [isDark, setIsDark] = useState(getIsDark)
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [schema, setSchema] = useState([{name:'',type:'string',required:false,allowed_values:''}])
  const [steps, setSteps] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [sName, setSName] = useState('')
  const [sType, setSType] = useState('task')
  const [sOrder, setSOrder] = useState(1)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const sync = () => setIsDark(getIsDark())
    const interval = setInterval(sync, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { if(isEdit) load() }, [id])

  const C = isDark ? DARK : LIGHT

  const inp = {
    width:'100%',padding:'11px 14px',borderRadius:'5px',
    border:`1px solid ${C.inputBorder}`,
    borderTop:'2px solid rgba(249,115,22,0.3)',
    background:C.inputBg,color:C.text,fontSize:'14px',
    boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif',
    transition:'all 0.2s',
  }
  const lbl = {color:C.textSec,fontSize:'11px',marginBottom:'6px',display:'block',textTransform:'uppercase',letterSpacing:'0.6px',fontWeight:'700',fontFamily:'Inter,sans-serif'}
  const card = {background:C.surface,borderRadius:'8px',padding:'24px',marginBottom:'20px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',transition:'all 0.3s',boxShadow:isDark?'none':'0 2px 12px rgba(0,0,0,0.06)'}

  const load = async () => {
    setLoading(true)
    const r = await fetch(`http://127.0.0.1:8000/api/workflows/${id}/`)
    const d = await r.json()
    setName(d.name); setIsActive(d.is_active); setSteps(d.steps||[])
    const f = Object.entries(d.input_schema||{}).map(([n,v])=>({name:n,type:v.type||'string',required:v.required||false,allowed_values:v.allowed_values?v.allowed_values.join(','):''}))
    if(f.length) setSchema(f)
    setLoading(false)
  }

  const buildSchema = () => {
    const s={}
    schema.forEach(f=>{
      if(f.name.trim()){
        s[f.name]={type:f.type,required:f.required}
        if(f.allowed_values.trim()) s[f.name].allowed_values=f.allowed_values.split(',').map(v=>v.trim())
      }
    })
    return s
  }

  const save = async () => {
    if(!name.trim()){setMsg('❌ Name required!');return}
    setSaving(true)
    const r = await fetch(isEdit?`http://127.0.0.1:8000/api/workflows/${id}/`:`http://127.0.0.1:8000/api/workflows/`,
      {method:isEdit?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,is_active:isActive,input_schema:buildSchema()})})
    const d = await r.json()
    if(r.ok){setMsg('✅ Saved!');if(!isEdit)navigate(`/workflows/${d.id}/edit`);else load()}
    else setMsg(`❌ ${JSON.stringify(d)}`)
    setSaving(false)
  }

  const saveStep = async () => {
    if(!sName.trim()){setMsg('❌ Step name required!');return}
    const r = await fetch(editId?`http://127.0.0.1:8000/api/workflows/${id}/steps/${editId}/`:`http://127.0.0.1:8000/api/workflows/${id}/steps/`,
      {method:editId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:sName,step_type:sType,order:sOrder,metadata:{},workflow:id})})
    const d = await r.json()
    if(r.ok){setMsg('✅ Step saved!');setModal(false);load()}
    else setMsg(`❌ ${JSON.stringify(d)}`)
  }

  const delStep = async (sid) => {
    if(!window.confirm('Delete step?')) return
    await fetch(`http://127.0.0.1:8000/api/workflows/${id}/steps/${sid}/`,{method:'DELETE'})
    setMsg('✅ Deleted!'); load()
  }

  const typeColor = t => t==='approval'?{bg:C.warnBg,fg:C.warnFg}:t==='notification'?{bg:C.infoBg,fg:C.infoFg}:{bg:C.successBg,fg:C.successFg}

  if(loading) return <div style={{textAlign:'center',padding:'60px',color:C.textMuted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>Loading...</div>

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',transition:'all 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingTop:'8px'}}>
        <div>
          <p style={{color:C.accent,fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'4px',fontFamily:'Inter,sans-serif'}}>{isEdit?'Edit Mode':'Create New'}</p>
          <h1 style={{color:C.text,fontSize:'28px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'-0.3px',fontFamily:'Inter,sans-serif'}}>
            {isEdit?'Edit Work':'Create Work'}<span style={{color:C.accent}}>flow</span>
          </h1>
        </div>
        <button onClick={()=>navigate('/workflows')} style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>← Back</button>
      </div>

      <div style={{height:'2px',background:'linear-gradient(90deg, #f97316, rgba(249,115,22,0.4), transparent)',marginBottom:'24px'}}></div>

      {/* Message */}
      {msg&&(
        <div style={{padding:'12px 16px',borderRadius:'5px',marginBottom:'16px',background:msg.includes('❌')?C.errorBg:C.successBg,color:msg.includes('❌')?C.errorFg:C.successFg,border:`1px solid ${msg.includes('❌')?'rgba(220,38,38,0.3)':'rgba(22,163,74,0.3)'}`,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>
          {msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:'16px'}}>✕</button>
        </div>
      )}

      {/* Details Card */}
      <div style={card}>
        <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'20px',fontFamily:'Inter,sans-serif'}}>Workflow Details</h2>
        <label style={lbl}>Workflow Name *</label>
        <input style={{...inp,marginBottom:'16px'}} placeholder="e.g. Expense Approval" value={name} onChange={e=>setName(e.target.value)}
          onFocus={e=>{e.target.style.borderTopColor='#f97316';e.target.style.borderColor='rgba(249,115,22,0.4)'}}
          onBlur={e=>{e.target.style.borderTopColor='rgba(249,115,22,0.3)';e.target.style.borderColor=C.inputBorder}}
        />
        <div style={{display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}} onClick={()=>setIsActive(!isActive)}>
          <div style={{width:'42px',height:'23px',borderRadius:'12px',background:isActive?C.accent:(isDark?'#333':'#ddd'),position:'relative',transition:'background 0.2s',border:`1px solid ${isActive?C.accent:(isDark?'#444':'#ccc')}`}}>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'#fff',position:'absolute',top:'2px',left:isActive?'22px':'3px',transition:'left 0.2s'}}></div>
          </div>
          <span style={{color:C.textSec,fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>{isActive?'Active':'Inactive'}</span>
        </div>
      </div>

      {/* Schema Card */}
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif'}}>Input Schema</h2>
          <button onClick={()=>setSchema([...schema,{name:'',type:'string',required:false,allowed_values:''}])}
            style={{background:C.accentDark,color:C.accent,border:'1px solid rgba(249,115,22,0.4)',padding:'7px 14px',borderRadius:'5px',cursor:'pointer',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>+ Add Field</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 80px 2fr 40px',gap:'8px',marginBottom:'8px'}}>
          {['Field Name','Type','Required','Allowed Values',''].map((h,i)=>(
            <span key={i} style={{color:C.textMuted,fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Inter,sans-serif'}}>{h}</span>
          ))}
        </div>
        {schema.map((f,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 80px 2fr 40px',gap:'8px',marginBottom:'8px',alignItems:'center'}}>
            <input style={inp} placeholder="e.g. amount" value={f.name} onChange={e=>{const u=[...schema];u[i].name=e.target.value;setSchema(u)}}/>
            <select style={{...inp,cursor:'pointer'}} value={f.type} onChange={e=>{const u=[...schema];u[i].type=e.target.value;setSchema(u)}}>
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
            </select>
            <label style={{display:'flex',alignItems:'center',gap:'6px',color:C.textSec,fontSize:'12px',cursor:'pointer',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>
              <input type="checkbox" checked={f.required} onChange={e=>{const u=[...schema];u[i].required=e.target.checked;setSchema(u)}} style={{accentColor:'#f97316',width:'14px',height:'14px'}}/>Yes
            </label>
            <input style={inp} placeholder="High,Medium,Low" value={f.allowed_values} onChange={e=>{const u=[...schema];u[i].allowed_values=e.target.value;setSchema(u)}}/>
            <button onClick={()=>setSchema(schema.filter((_,j)=>j!==i))} style={{background:C.errorBg,color:C.errorFg,border:`1px solid rgba(220,38,38,0.25)`,padding:'10px',borderRadius:'5px',cursor:'pointer',fontSize:'12px',fontWeight:'700'}}>✕</button>
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{textAlign:'right',marginBottom:'24px'}}>
        <button onClick={save} disabled={saving} style={{background:'#f97316',color:'#000',border:'none',padding:'12px 28px',borderRadius:'5px',cursor:'pointer',fontWeight:'900',fontSize:'13px',textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Inter,sans-serif'}}>
          {saving?'Saving...':(isEdit?'Update':' Save')}
        </button>
      </div>

      {/* Steps */}
      {isEdit&&(
        <div style={card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <h2 style={{color:C.text,fontSize:'13px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif'}}>Steps <span style={{color:'#f97316'}}>({steps.length})</span></h2>
            <button onClick={()=>{setEditId(null);setSName('');setSType('task');setSOrder(steps.length+1);setModal(true)}}
              style={{background:'#f97316',color:'#000',border:'none',padding:'9px 18px',borderRadius:'5px',cursor:'pointer',fontWeight:'900',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>+ Add Step</button>
          </div>
          {steps.length===0?(
            <p style={{textAlign:'center',padding:'30px',color:C.textMuted,fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700',fontFamily:'Inter,sans-serif'}}>No steps yet. Click "+ Add Step" to begin.</p>
          ):steps.map((step,i)=>{
            const tc=typeColor(step.step_type)
            return (
              <div key={step.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:C.bg,borderRadius:'6px',marginBottom:'10px',border:`1px solid ${C.border}`,borderLeft:'3px solid #f97316',transition:'all 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{width:'30px',height:'30px',background:C.accentDark,color:'#f97316',borderRadius:'5px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'900',border:'1px solid rgba(249,115,22,0.4)',flexShrink:0,fontFamily:'Inter,sans-serif'}}>{i+1}</span>
                  <div>
                    <p style={{color:C.text,fontWeight:'700',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:'3px',fontFamily:'Inter,sans-serif'}}>{step.name}</p>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <span style={{background:tc.bg,color:tc.fg,padding:'2px 8px',borderRadius:'3px',fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>{step.step_type}</span>
                      <span style={{color:C.textMuted,fontSize:'11px',fontFamily:'Inter,sans-serif'}}>{step.rules?.length||0} rules</span>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={()=>navigate(`/workflows/${id}/steps/${step.id}/rules`)} style={{background:C.warnBg,color:C.warnFg,border:'1px solid rgba(217,119,6,0.3)',padding:'7px 12px',borderRadius:'5px',cursor:'pointer',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>Rules</button>
                  <button onClick={()=>{setEditId(step.id);setSName(step.name);setSType(step.step_type);setSOrder(step.order);setModal(true)}} style={{background:C.accentDark,color:'#f97316',border:'1px solid rgba(249,115,22,0.4)',padding:'7px 12px',borderRadius:'5px',cursor:'pointer',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.3px',fontFamily:'Inter,sans-serif'}}>Edit</button>
                  <button onClick={()=>delStep(step.id)} style={{background:C.errorBg,color:C.errorFg,border:'1px solid rgba(220,38,38,0.25)',padding:'7px 10px',borderRadius:'5px',cursor:'pointer',fontSize:'11px',fontWeight:'700'}}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:C.surface,borderRadius:'8px',padding:'32px',width:'480px',border:`1px solid ${C.border}`,borderTop:'3px solid #f97316',boxShadow:'0 20px 60px rgba(0,0,0,0.7)',transition:'all 0.3s'}}>
            <p style={{color:'#f97316',fontSize:'11px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'6px',fontFamily:'Inter,sans-serif'}}>{editId?'Edit Mode':'New Step'}</p>
            <h2 style={{color:C.text,fontSize:'22px',fontWeight:'900',textTransform:'uppercase',marginBottom:'24px',fontFamily:'Inter,sans-serif'}}>{editId?'Edit Step':'Add Step'}</h2>
            <label style={lbl}>Step Name *</label>
            <input style={{...inp,marginBottom:'16px'}} placeholder="e.g. Manager Approval" value={sName} onChange={e=>setSName(e.target.value)}/>
            <label style={lbl}>Step Type *</label>
            <select style={{...inp,marginBottom:'16px',cursor:'pointer'}} value={sType} onChange={e=>setSType(e.target.value)}>
              <option value="task">Task — Automated Action</option>
              <option value="approval">Approval — Requires Human</option>
              <option value="notification">Notification — Sends Alert</option>
            </select>
            <label style={lbl}>Order</label>
            <input type="number" style={{...inp,marginBottom:'24px'}} value={sOrder} min="1" onChange={e=>setSOrder(parseInt(e.target.value)||1)}/>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={saveStep} style={{flex:1,background:'#f97316',color:'#000',border:'none',padding:'12px',borderRadius:'5px',cursor:'pointer',fontWeight:'900',fontSize:'13px',textTransform:'uppercase',letterSpacing:'0.4px',fontFamily:'Inter,sans-serif'}}>Save</button>
              <button onClick={()=>setModal(false)} style={{flex:1,background:C.errorBg,color:C.errorFg,border:'1px solid rgba(220,38,38,0.25)',padding:'12px',borderRadius:'5px',cursor:'pointer',fontSize:'13px',fontWeight:'700',textTransform:'uppercase',fontFamily:'Inter,sans-serif'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}