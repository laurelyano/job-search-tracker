import { useState } from 'react'
import { useStore, Modal, Btn, Input, Sel, Tag, Empty, DocUpload, DocViewer } from './shared'

const PREP_CATS = ['Interview Prep','Personal Projects','Job Type Notes']

export default function PrepPage({ uid }) {
  const [items, setItems, ready] = useStore(uid, 'prep', [])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeTab, setActiveTab] = useState('Interview Prep')
  const [viewDoc, setViewDoc] = useState(null)
  const blank = { title:'', category:'Interview Prep', content:'', status:'In Progress', links:[''], docs:[] }
  const [form, setForm] = useState(blank)

  const save = () => {
    if (!form.title) return
    const cleaned = {...form, links:(form.links||[]).filter(l=>l.trim())}
    if (editing) setItems(items.map(i => i.id===editing ? {...cleaned,id:editing} : i))
    else setItems([{...cleaned, id:Date.now()}, ...items])
    setForm(blank); setShow(false); setEditing(null)
  }
  const edit = (item) => { setForm({...item, links:item.links?.length?item.links:[''], docs:item.docs||[]}); setEditing(item.id); setShow(true) }
  const del = (id) => setItems(items.filter(i => i.id !== id))
  const filtered = items.filter(i => i.category === activeTab)

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {PREP_CATS.map(c => <button key={c} onClick={() => setActiveTab(c)} style={{ border:'1.5px solid', borderColor:activeTab===c?'#1a1a1a':'#e5e5e5', borderRadius:20, padding:'5px 14px', fontSize:13, fontWeight:600, cursor:'pointer', background:activeTab===c?'#1a1a1a':'#fff', color:activeTab===c?'#fff':'#666' }}>{c}</button>)}
        <div style={{ marginLeft:'auto' }}><Btn onClick={() => { setForm({...blank,category:activeTab}); setEditing(null); setShow(true) }}>+ Add</Btn></div>
      </div>
      {filtered.length===0 && <Empty text={`No ${activeTab} entries yet.`} />}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(item => (
          <div key={item.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, fontSize:15 }}>{item.title}</span>
                  {item.status && <Tag label={item.status} color={item.status==='Done'?'#dcfce7':item.status==='In Progress'?'#dbeafe':'#f0f0f0'} text={item.status==='Done'?'#166534':item.status==='In Progress'?'#1d4ed8':'#555'} />}
                </div>
                {item.links?.filter(l=>l).map((l,i) => <a key={i} href={l} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#3b82f6', marginTop:3, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</a>)}
                {item.docs?.map((d,i) => <button key={i} onClick={() => setViewDoc(d)} style={{ background:'#f0f0f0', border:'none', borderRadius:6, padding:'3px 10px', fontSize:12, cursor:'pointer', color:'#333', marginTop:4, display:'inline-block', marginRight:6 }}>{d.name}</button>)}
                {item.content && <div style={{ fontSize:13, color:'#555', marginTop:8, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{item.content}</div>}
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:10 }}>
                <Btn small variant="secondary" onClick={() => edit(item)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => del(item.id)}>Delete</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title={editing?'Edit Entry':'Add Entry'} onClose={() => { setShow(false); setEditing(null) }}>
          <Input label="Title *" value={form.title} onChange={v => setForm({...form,title:v})} placeholder={activeTab==='Interview Prep'?'e.g. Behavioral: Leadership story':activeTab==='Personal Projects'?'e.g. Portfolio Website':'e.g. Product Manager roles'} />
          <Sel label="Category" value={form.category} onChange={v => setForm({...form,category:v})} options={PREP_CATS} />
          <Sel label="Status" value={form.status} onChange={v => setForm({...form,status:v})} options={['Not Started','In Progress','Done']} />
          <div style={{ marginBottom:13 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>Links (optional)</div>
            {(form.links||['']).map((l,i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <input style={{ flex:1, border:'1.5px solid #e5e5e5', borderRadius:7, padding:'8px 11px', fontSize:14, fontFamily:'inherit', outline:'none' }} value={l} onChange={e => { const a=[...(form.links||[])]; a[i]=e.target.value; setForm({...form,links:a}) }} placeholder="https://..." />
                {(form.links||[]).length>1 && <button onClick={() => { const a=[...(form.links||[])]; a.splice(i,1); setForm({...form,links:a}) }} style={{ background:'#fee2e2', border:'none', borderRadius:7, padding:'0 10px', cursor:'pointer', color:'#dc2626', fontWeight:700 }}>×</button>}
              </div>
            ))}
            <button onClick={() => setForm({...form,links:[...(form.links||[]),'']})} style={{ background:'none', border:'1.5px dashed #d0d0d0', borderRadius:7, padding:'6px 14px', fontSize:12, color:'#888', cursor:'pointer', width:'100%' }}>+ Add Link</button>
          </div>
          <div style={{ marginBottom:13 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>Documents (optional)</div>
            {(form.docs||[]).map((d,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ flex:1, fontSize:13, color:'#333', background:'#f0f0f0', borderRadius:6, padding:'5px 10px' }}>{d.name}</span>
                <button onClick={() => { const a=[...(form.docs||[])]; a.splice(i,1); setForm({...form,docs:a}) }} style={{ background:'#fee2e2', border:'none', borderRadius:7, padding:'5px 10px', cursor:'pointer', color:'#dc2626', fontWeight:700 }}>×</button>
              </div>
            ))}
            <DocUpload label="" optional={true} fileName={null} onFile={f => setForm({...form,docs:[...(form.docs||[]),f]})} />
          </div>
          <Input label="Notes / Content" value={form.content} onChange={v => setForm({...form,content:v})} placeholder="Your notes here..." multiline rows={5} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="secondary" onClick={() => { setShow(false); setEditing(null) }}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
      {viewDoc && <DocViewer doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </div>
  )
}