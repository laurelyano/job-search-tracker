import { useState } from 'react'
import { useStore, Modal, Btn, Input, Tag, Empty, DocUpload } from './shared'

export default function ResumesPage({ uid }) {
  const [resumes, setResumes, ready] = useStore(uid, 'resumes', [])
  const [show, setShow] = useState(false)
  const [viewing, setViewing] = useState(null)
  const blank = { label:'', date:'', notes:'', file:null, rawFile:null }
  const [form, setForm] = useState(blank)

  const add = () => {
    if (!form.label) { alert('Please add a version label.'); return }
    if (!form.file) { alert('Please upload a resume file.'); return }
    setResumes([{...form, id:Date.now()}, ...resumes])
    setForm(blank)
    setShow(false)
  }
  const del = (id) => setResumes(resumes.filter(r => r.id !== id))

  const downloadOriginal = (r) => {
    if (!r.rawFile) { alert('Original file not available. Please re-upload to enable download.'); return }
    const bytes = Uint8Array.from(atob(r.rawFile), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: r.file.type || 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = r.file.name; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = (r) => {
    if (!window.print) return
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>${r.label}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; padding: 40px; white-space: pre-wrap; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>${r.file.content.replace(/\n/g, '<br/>')}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

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
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <Btn small variant="secondary" onClick={() => setViewing(r.file)}>View</Btn>
                <Btn small variant="secondary" onClick={() => downloadOriginal(r)}>Download</Btn>
                <Btn small variant="secondary" onClick={() => downloadPDF(r)}>Export PDF</Btn>
                <Btn small variant="danger" onClick={() => del(r.id)}>Delete</Btn>
              </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title="Add Resume Version" onClose={() => { setForm(blank); setShow(false) }}>
          <Input label="Version Label *" value={form.label} onChange={v => setForm({...form,label:v})} placeholder="e.g. PM Resume v3" />
          <Input label="Date" type="date" value={form.date} onChange={v => setForm({...form,date:v})} />
          <Input label="What changed?" value={form.notes} onChange={v => setForm({...form,notes:v})} placeholder="e.g. Rewrote summary, added new project" />
          <DocUpload label="Resume *" optional={false} fileName={form.file?.name} onFile={(f, raw) => setForm({...form, file:f, rawFile:raw})} />
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