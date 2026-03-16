import { useState } from 'react'
import { useStore, Modal, Btn, Input, Tag, Empty, DocUpload, DocViewer } from './shared'

export default function ResumesPage({ uid }) {
  const [resumes, setResumes, ready] = useStore(uid, 'resumes', [])
  const [show, setShow] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [form, setForm] = useState({ label:'', date:'', notes:'', file:null })

  const add = () => {
    if (!form.label || !form.file) return
    setResumes([{...form, id:Date.now()}, ...resumes])
    setForm({ label:'', date:'', notes:'', file:null })
    setShow(false)
  }
  const del = (id) => setResumes(resumes.filter(r => r.id !== id))

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:13, color:'#999' }}>{resumes.length} version{resumes.length!==1?'s':''} saved</div>
        <Btn onClick={() => setShow(true)}>+ Add Version</Btn>
      </div>
      {resumes.length===0 && <Empty text="No resume versions yet. Upload your first one!" />}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {resumes.map((r,i) => (
          <div key={r.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:15 }}>{r.label}</span>
                {i===0 && <Tag label="Latest" color="#dbeafe" text="#1d4ed8" />}
              </div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>{r.date||'No date'} — {r.file?.name}</div>
              {r.notes && <div style={{ fontSize:13, color:'#666', marginTop:4 }}>{r.notes}</div>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn small variant="secondary" onClick={() => setViewing(r.file)}>View</Btn>
              <Btn small variant="danger" onClick={() => del(r.id)}>Delete</Btn>
            </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title="Add Resume Version" onClose={() => setShow(false)}>
          <Input label="Version Label *" value={form.label} onChange={v => setForm({...form,label:v})} placeholder="e.g. PM Resume v3" />
          <Input label="Date" type="date" value={form.date} onChange={v => setForm({...form,date:v})} />
          <Input label="What changed?" value={form.notes} onChange={v => setForm({...form,notes:v})} placeholder="e.g. Rewrote summary, added new project" />
          <DocUpload label="Resume" optional={false} fileName={form.file?.name} onFile={f => setForm({...form,file:f})} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
            <Btn variant="secondary" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={add}>Save</Btn>
          </div>
        </Modal>
      )}
      {viewing && <DocViewer doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}