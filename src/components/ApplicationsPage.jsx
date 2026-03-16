import { useState } from 'react'
import { useStore, Modal, Btn, Input, Sel, Tag, Empty, DocUpload, DocViewer, stageColor, stageText } from './shared'

const STAGES = ['Applied','Phone Screen','Interview','Final Round','Offer','Rejected']

export default function ApplicationsPage({ uid }) {
  const [apps, setApps, ready] = useStore(uid, 'applications', [])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('All')
  const [viewDoc, setViewDoc] = useState(null)
  const blank = { company:'', role:'', dateApplied:'', stage:'Applied', contact:'', rejectionReason:'', lessons:'', notes:'', url:'', resume:null, coverLetter:null }
  const [form, setForm] = useState(blank)

  const save = () => {
    if (!form.company) return
    if (editing) setApps(apps.map(a => a.id===editing ? {...form,id:editing} : a))
    else setApps([{...form, id:Date.now()}, ...apps])
    setForm(blank); setShow(false); setEditing(null)
  }
  const edit = (a) => { setForm(a); setEditing(a.id); setShow(true) }
  const del = (id) => setApps(apps.filter(a => a.id !== id))
  const counts = STAGES.reduce((acc,s) => ({...acc,[s]:apps.filter(a=>a.stage===s).length}), {})
  const filtered = filter==='All' ? apps : apps.filter(a => a.stage===filter)

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {['All',...STAGES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ border:'1.5px solid', borderColor:filter===s?'#1a1a1a':'#e5e5e5', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer', background:filter===s?'#1a1a1a':'#fff', color:filter===s?'#fff':'#666' }}>
            {s}{s!=='All'&&counts[s]>0?` (${counts[s]})`:''}
          </button>
        ))}
        <div style={{ marginLeft:'auto' }}><Btn onClick={() => { setForm(blank); setEditing(null); setShow(true) }}>+ Add Application</Btn></div>
      </div>
      {filtered.length===0 && <Empty text="No applications here yet." />}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(a => (
          <div key={a.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, fontSize:15 }}>{a.company}</span>
                  <Tag label={a.stage} color={stageColor(a.stage)} text={stageText(a.stage)} />
                </div>
                <div style={{ fontSize:13, color:'#666', marginTop:2 }}>{a.role}</div>
                {a.contact && <div style={{ fontSize:13, color:'#666', marginTop:2 }}>Contact: {a.contact}</div>}
                {a.dateApplied && <div style={{ fontSize:12, color:'#999', marginTop:2 }}>Applied: {a.dateApplied}</div>}
                {(a.resume||a.coverLetter) && (
                  <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                    {a.resume && <Btn small variant="secondary" onClick={() => setViewDoc(a.resume)}>View Resume</Btn>}
                    {a.coverLetter && <Btn small variant="secondary" onClick={() => setViewDoc(a.coverLetter)}>View Cover Letter</Btn>}
                  </div>
                )}
                {a.stage==='Rejected'&&a.rejectionReason && (
                  <div style={{ marginTop:8, background:'#fff5f5', borderRadius:7, padding:'8px 10px', fontSize:13 }}>
                    <b style={{ color:'#dc2626' }}>Rejection reason:</b> {a.rejectionReason}
                    {a.lessons && <div style={{ marginTop:4, color:'#555' }}><b>Lessons:</b> {a.lessons}</div>}
                  </div>
                )}
                {a.notes && <div style={{ fontSize:13, color:'#555', marginTop:6 }}>{a.notes}</div>}
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:10 }}>
                <Btn small variant="secondary" onClick={() => edit(a)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => del(a.id)}>Delete</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title={editing?'Edit Application':'Add Application'} onClose={() => { setShow(false); setEditing(null) }}>
          <Input label="Company *" value={form.company} onChange={v => setForm({...form,company:v})} placeholder="Acme Corp" />
          <Input label="Role" value={form.role} onChange={v => setForm({...form,role:v})} placeholder="Product Manager" />
          <Input label="Date Applied" type="date" value={form.dateApplied} onChange={v => setForm({...form,dateApplied:v})} />
          <Input label="Job URL" value={form.url} onChange={v => setForm({...form,url:v})} placeholder="https://..." />
          <Input label="Point of Contact (optional)" value={form.contact} onChange={v => setForm({...form,contact:v})} placeholder="e.g. Jane Smith — Recruiter" />
          <Sel label="Stage" value={form.stage} onChange={v => setForm({...form,stage:v})} options={STAGES} />
          <DocUpload label="Resume" fileName={form.resume?.name} onFile={f => setForm({...form,resume:f})} />
          <DocUpload label="Cover Letter" fileName={form.coverLetter?.name} onFile={f => setForm({...form,coverLetter:f})} />
          {form.stage==='Rejected' && <>
            <Input label="Rejection Reason" value={form.rejectionReason} onChange={v => setForm({...form,rejectionReason:v})} placeholder="e.g. Lack of experience in X" multiline rows={2} />
            <Input label="Lessons Learned" value={form.lessons} onChange={v => setForm({...form,lessons:v})} placeholder="What would you do differently?" multiline rows={2} />
          </>}
          <Input label="Notes" value={form.notes} onChange={v => setForm({...form,notes:v})} placeholder="Any additional notes..." multiline />
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