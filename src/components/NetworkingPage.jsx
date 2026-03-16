import { useState } from 'react'
import { useStore, Modal, Btn, Input, Empty } from './shared'

export default function NetworkingPage({ uid }) {
  const [contacts, setContacts, ready] = useStore(uid, 'contacts', [])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const blank = { name:'', company:'', role:'', lastContact:'', followUpDate:'', notes:'' }
  const [form, setForm] = useState(blank)

  const save = () => {
    if (!form.name) return
    if (editing) setContacts(contacts.map(c => c.id===editing ? {...form,id:editing} : c))
    else setContacts([{...form, id:Date.now()}, ...contacts])
    setForm(blank); setShow(false); setEditing(null)
  }
  const edit = (c) => { setForm(c); setEditing(c.id); setShow(true) }
  const del = (id) => setContacts(contacts.filter(c => c.id !== id))
  const overdue = (d) => d && new Date(d) < new Date()

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:13, color:'#999' }}>{contacts.length} contact{contacts.length!==1?'s':''}</div>
        <Btn onClick={() => { setForm(blank); setEditing(null); setShow(true) }}>+ Add Contact</Btn>
      </div>
      {contacts.length===0 && <Empty text="No contacts yet. Start building your network!" />}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                <div style={{ fontSize:13, color:'#666' }}>{c.role}{c.role&&c.company?' @ ':''}{c.company}</div>
                {c.lastContact && <div style={{ fontSize:12, color:'#999', marginTop:3 }}>Last contact: {c.lastContact}</div>}
                {c.followUpDate && <div style={{ fontSize:12, marginTop:3, color:overdue(c.followUpDate)?'#dc2626':'#999' }}>Follow up: {c.followUpDate}{overdue(c.followUpDate)?' — Overdue':''}</div>}
                {c.notes && <div style={{ fontSize:13, color:'#555', marginTop:6, borderTop:'1px solid #f0f0f0', paddingTop:6 }}>{c.notes}</div>}
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:10 }}>
                <Btn small variant="secondary" onClick={() => edit(c)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => del(c.id)}>Delete</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title={editing?'Edit Contact':'Add Contact'} onClose={() => { setShow(false); setEditing(null) }}>
          <Input label="Name *" value={form.name} onChange={v => setForm({...form,name:v})} placeholder="Jane Smith" />
          <Input label="Company" value={form.company} onChange={v => setForm({...form,company:v})} placeholder="Acme Corp" />
          <Input label="Role / Title" value={form.role} onChange={v => setForm({...form,role:v})} placeholder="Engineering Manager" />
          <Input label="Last Contact Date" type="date" value={form.lastContact} onChange={v => setForm({...form,lastContact:v})} />
          <Input label="Follow-Up Date" type="date" value={form.followUpDate} onChange={v => setForm({...form,followUpDate:v})} />
          <Input label="Notes" value={form.notes} onChange={v => setForm({...form,notes:v})} placeholder="How you met, topics discussed..." multiline />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="secondary" onClick={() => { setShow(false); setEditing(null) }}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}