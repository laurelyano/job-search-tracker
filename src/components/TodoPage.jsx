import { useState } from 'react'
import { useStore, Modal, Btn, Input, Empty, priColor, priText } from './shared'

export default function TodoPage({ uid }) {
  const [tasks, setTasks, ready] = useStore(uid, 'todos', [])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('All')
  const blank = { text:'', priority:'', dueDate:'', done:false, notes:'', link:'' }
  const [form, setForm] = useState(blank)

  const save = () => {
    if (!form.text) return
    if (editing) setTasks(tasks.map(t => t.id===editing ? {...form,id:editing} : t))
    else setTasks([{...form, id:Date.now()}, ...tasks])
    setForm(blank); setShow(false); setEditing(null)
  }
  const openEdit = (t) => { setForm(t); setEditing(t.id); setShow(true) }
  const toggle = (id) => setTasks(tasks.map(t => t.id===id ? {...t,done:!t.done} : t))
  const del = (id) => setTasks(tasks.filter(t => t.id !== id))
  const overdue = (t) => !t.done && t.dueDate && new Date(t.dueDate) < new Date()

  const base = filter==='All' ? tasks : filter==='Done' ? tasks.filter(t=>t.done) : tasks.filter(t=>!t.done)
  const priOrder = ['High','Medium','Low']
  const groups = [
    ...priOrder.map(p => ({ label:p, items:base.filter(t=>t.priority===p) })),
    { label:'No Priority', items:base.filter(t=>!t.priority||!priOrder.includes(t.priority)) }
  ].filter(g => g.items.length > 0)

  const priHeaderColor = { High:'#fef2f2', Medium:'#fefce8', Low:'#f0fdf4', 'No Priority':'#f8f8f8' }
  const priHeaderText = { High:'#b91c1c', Medium:'#92400e', Low:'#166534', 'No Priority':'#888' }

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['All','Active','Done'].map(f => <button key={f} onClick={() => setFilter(f)} style={{ border:'1.5px solid', borderColor:filter===f?'#1a1a1a':'#e5e5e5', borderRadius:20, padding:'4px 13px', fontSize:12, fontWeight:600, cursor:'pointer', background:filter===f?'#1a1a1a':'#fff', color:filter===f?'#fff':'#666' }}>{f}</button>)}
        </div>
        <Btn onClick={() => { setForm(blank); setEditing(null); setShow(true) }}>+ Add Task</Btn>
      </div>
      {base.length===0 && <Empty text="No tasks here." />}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ background:priHeaderColor[g.label], color:priHeaderText[g.label], borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, marginBottom:8, display:'inline-block' }}>{g.label}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {g.items.map(t => (
                <div key={t.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'11px 14px', display:'flex', alignItems:'center', gap:12, opacity:t.done?.55:1, background:'#fff' }}>
                  <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} style={{ width:17, height:17, cursor:'pointer', accentColor:'#1a1a1a', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, textDecoration:t.done?'line-through':'none', color:t.done?'#bbb':'#1a1a1a' }}>{t.text}</div>
                    {(t.dueDate||t.notes||t.link) && (
                      <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center', flexWrap:'wrap' }}>
                        {t.dueDate && <span style={{ fontSize:12, color:overdue(t)?'#dc2626':'#999' }}>{overdue(t)?'Overdue — ':''}{t.dueDate}</span>}
                        {t.notes && <span style={{ fontSize:12, color:'#aaa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{t.notes}</span>}
                        {t.link && <a href={t.link} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#3b82f6', whiteSpace:'nowrap' }}>Link</a>}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <Btn small variant="secondary" onClick={() => openEdit(t)}>Edit</Btn>
                    <Btn small variant="danger" onClick={() => del(t.id)}>×</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {show && (
        <Modal title={editing?'Edit Task':'Add Task'} onClose={() => { setShow(false); setEditing(null) }}>
          <Input label="Task *" value={form.text} onChange={v => setForm({...form,text:v})} placeholder="e.g. Reach out to 3 contacts this week" />
          <div style={{ marginBottom:13 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:4 }}>Priority (optional)</div>
            <div style={{ display:'flex', gap:8 }}>
              {['High','Medium','Low'].map(p => (
                <button key={p} onClick={() => setForm({...form,priority:form.priority===p?'':p})}
                  style={{ flex:1, border:'1.5px solid', borderColor:form.priority===p?'#1a1a1a':'#e5e5e5', borderRadius:7, padding:'7px 0', fontSize:13, fontWeight:600, cursor:'pointer', background:form.priority===p?(priColor(p)||'#f0f0f0'):'#fff', color:form.priority===p?(priText(p)||'#333'):'#888' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Input label="Due Date (optional)" type="date" value={form.dueDate} onChange={v => setForm({...form,dueDate:v})} />
          <Input label="Link (optional)" value={form.link||''} onChange={v => setForm({...form,link:v})} placeholder="https://..." />
          <Input label="Notes (optional)" value={form.notes||''} onChange={v => setForm({...form,notes:v})} placeholder="Any extra details..." multiline rows={2} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="secondary" onClick={() => { setShow(false); setEditing(null) }}>Cancel</Btn>
            <Btn onClick={save}>{editing?'Save Changes':'Add Task'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}