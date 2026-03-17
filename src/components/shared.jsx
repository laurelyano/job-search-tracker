import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Firestore-backed storage hook — saves to users/{uid}/{key}
export function useStore(uid, key, init) {
  const [val, setVal] = useState(init)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!uid) return
    getDoc(doc(db, 'users', uid, 'data', key)).then(snap => {
      if (snap.exists()) setVal(snap.data().value ?? init)
      setReady(true)
    })
  }, [uid, key])

  const save = (v) => {
    setVal(v)
    setDoc(doc(db, 'users', uid, 'data', key), { value: v })
  }

  return [val, save, ready]
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:12, padding:28, minWidth:340, maxWidth:520, width:'90%', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <span style={{ fontWeight:700, fontSize:16 }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#aaa', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Btn({ onClick, children, variant = 'primary', small }) {
  const base = { border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, transition:'all .15s' }
  const s = {
    primary: { ...base, background:'#1a1a1a', color:'#fff', padding:small ? '6px 14px' : '9px 20px', fontSize:small ? 13 : 14 },
    secondary: { ...base, background:'#f0f0f0', color:'#333', padding:small ? '6px 14px' : '9px 20px', fontSize:small ? 13 : 14 },
    danger: { ...base, background:'#fee2e2', color:'#dc2626', padding:small ? '6px 14px' : '9px 20px', fontSize:small ? 13 : 14 },
  }
  return <button style={s[variant]} onClick={onClick}>{children}</button>
}

export function Input({ label, value, onChange, type = 'text', placeholder, multiline, rows = 3 }) {
  const s = { width:'100%', boxSizing:'border-box', border:'1.5px solid #e5e5e5', borderRadius:7, padding:'8px 11px', fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', background:'#fff' }
  return (
    <div style={{ marginBottom:13 }}>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>{label}</div>}
      {multiline
        ? <textarea style={s} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={s} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  )
}

export function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>{label}</div>}
      <select style={{ width:'100%', border:'1.5px solid #e5e5e5', borderRadius:7, padding:'8px 11px', fontSize:14, fontFamily:'inherit', background:'#fff' }} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function Tag({ label, color = '#f0f0f0', text = '#333' }) {
  return <span style={{ background:color, color:text, borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>
}

export function Empty({ text }) {
  return <div style={{ textAlign:'center', color:'#ccc', fontSize:14, padding:'48px 0' }}>{text}</div>
}

export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    if (file.name.endsWith('.pdf')) {
      reader.onload = async (e) => {
        try {
          if (!window._pdfjsLoaded) {
            await new Promise(res => {
              const s = document.createElement('script')
              s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
              s.onload = res
              document.head.appendChild(s)
            })
            window._pdfjsLoaded = true
          }
          const lib = window['pdfjs-dist/build/pdf']
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          const pdf = await lib.getDocument({ data: new Uint8Array(e.target.result) }).promise
          let text = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const pg = await pdf.getPage(i)
            const c = await pg.getTextContent()
            text += c.items.map(it => it.str).join(' ') + '\n'
          }
          resolve(text)
        } catch (err) { reject(err) }
      }
      reader.readAsArrayBuffer(file)
    } else {
      reader.onload = async (e) => {
        try {
          const mammoth = await import('mammoth')
          const r = await mammoth.extractRawText({ arrayBuffer: e.target.result })
          resolve(r.value)
        } catch (err) { reject(err) }
      }
      reader.readAsArrayBuffer(file)
    }
  })
}

export function DocUpload({ label, fileName, onFile, optional = true }) {
  const [loading, setLoading] = useState(false)
  const id = 'fu_' + Math.random().toString(36).slice(2)
  const handle = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const text = await readFile(file)
      const raw = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(raw)))
      onFile({ name: file.name, content: text, type: file.type }, base64)
    } catch { alert('Could not read file. Please upload a valid .docx or .pdf file.') }
    setLoading(false)
    e.target.value = ''
  }
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>{label}{optional && ' (optional)'}</div>
      <label htmlFor={id} style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px dashed #d0d0d0', borderRadius:7, padding:'9px 13px', cursor:'pointer', background:'#fafafa', fontSize:13, color:'#666' }}>
        {loading ? 'Reading file...' : fileName
          ? <><span style={{ color:'#1a1a1a', fontWeight:600 }}>{fileName}</span><span style={{ color:'#aaa', fontSize:12 }}> — click to replace</span></>
          : 'Click to upload file'}
        <input id={id} type="file" accept=".docx,.pdf" onChange={handle} style={{ display:'none' }} />
      </label>
      <div style={{ fontSize:11, color:'#bbb', marginTop:3 }}>Supported: .docx, .pdf</div>
    </div>
  )
}

export function DocViewer({ doc, onClose }) {
  return (
    <Modal title={doc.name} onClose={onClose}>
      <pre style={{ whiteSpace:'pre-wrap', fontSize:13, lineHeight:1.7, fontFamily:'inherit', background:'#f8f8f8', borderRadius:7, padding:14, maxHeight:420, overflowY:'auto' }}>{doc.content}</pre>
    </Modal>
  )
}

export const stageColor = s => ({ Applied:'#dbeafe', 'Phone Screen':'#fef9c3', Interview:'#dcfce7', 'Final Round':'#e9d5ff', Offer:'#d1fae5', Rejected:'#fee2e2' }[s] || '#f0f0f0')
export const stageText = s => ({ Applied:'#1d4ed8', 'Phone Screen':'#854d0e', Interview:'#166534', 'Final Round':'#6b21a8', Offer:'#065f46', Rejected:'#dc2626' }[s] || '#333')
export const priColor = p => ({ High:'#fee2e2', Medium:'#fef9c3', Low:'#f0f0f0' }[p])
export const priText = p => ({ High:'#dc2626', Medium:'#854d0e', Low:'#555' }[p])