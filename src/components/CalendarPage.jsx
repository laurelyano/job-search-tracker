import { useState } from 'react'
import { useStore, Modal, Btn, Input, Sel, Tag, Empty } from './shared'

const EVENT_TYPES = ['Applied','Heard Back','Follow Up','Meeting','Interview','Deadline','Other']
const EVENT_COLORS = { Applied:'#dbeafe','Heard Back':'#dcfce7','Follow Up':'#fef9c3',Meeting:'#e9d5ff',Interview:'#fed7aa',Deadline:'#fee2e2',Other:'#f0f0f0' }
const EVENT_TEXT = { Applied:'#1d4ed8','Heard Back':'#166534','Follow Up':'#854d0e',Meeting:'#6b21a8',Interview:'#9a3412',Deadline:'#dc2626',Other:'#555' }
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage({ uid }) {
  const [events, setEvents, ready] = useStore(uid, 'calEvents', [])
  const today = new Date()
  const [cur, setCur] = useState({ y:today.getFullYear(), m:today.getMonth() })
  const [show, setShow] = useState(false)
  const [dayModal, setDayModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const blank = { title:'', type:'Meeting', date:'', time:'', notes:'' }
  const [form, setForm] = useState(blank)

  const daysInMonth = new Date(cur.y, cur.m+1, 0).getDate()
  const firstDay = new Date(cur.y, cur.m, 1).getDay()
  const ds = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const todayStr = ds(today.getFullYear(), today.getMonth(), today.getDate())
  const evOnDay = (d) => events.filter(e => e.date === ds(cur.y, cur.m, d))

  const save = () => {
    if (!form.title || !form.date) return
    if (editing) setEvents(events.map(e => e.id===editing ? {...form,id:editing} : e))
    else setEvents([{...form, id:Date.now()}, ...events])
    setForm(blank); setShow(false); setEditing(null)
  }
  const del = (id) => {
    setEvents(events.filter(e => e.id !== id))
    if (dayModal) setDayModal(p => ({...p, events:p.events.filter(e => e.id !== id)}))
  }
  const openEdit = (ev) => { setForm(ev); setEditing(ev.id); setShow(true); setDayModal(null) }
  const openAdd = (date='') => { setForm({...blank,date}); setEditing(null); setShow(true); setDayModal(null) }

  const upcoming = [...events].filter(e => e.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')).slice(0,6)

  if (!ready) return <div style={{color:'#ccc',fontSize:14}}>Loading...</div>

  return (
    <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:300 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setCur(c => c.m===0 ? {y:c.y-1,m:11} : {y:c.y,m:c.m-1})} style={{ background:'none', border:'1.5px solid #e5e5e5', borderRadius:7, padding:'5px 11px', cursor:'pointer', fontSize:15, color:'#555' }}>‹</button>
            <span style={{ fontWeight:700, fontSize:17, minWidth:170, textAlign:'center' }}>{MONTHS[cur.m]} {cur.y}</span>
            <button onClick={() => setCur(c => c.m===11 ? {y:c.y+1,m:0} : {y:c.y,m:c.m+1})} style={{ background:'none', border:'1.5px solid #e5e5e5', borderRadius:7, padding:'5px 11px', cursor:'pointer', fontSize:15, color:'#555' }}>›</button>
          </div>
          <div style={{ fontSize:12, color:'#aaa' }}>Click a date to add events</div>
        </div>
        <div style={{ border:'1.5px solid #e5e5e5', borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f8f8f8', borderBottom:'1.5px solid #e5e5e5' }}>
            {DAYS.map(d => <div key={d} style={{ padding:'9px 0', textAlign:'center', fontSize:12, fontWeight:600, color:'#999' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {Array.from({length:firstDay}).map((_,i) => <div key={`b${i}`} style={{ height:80, borderRight:'1px solid #f0f0f0', borderBottom:'1px solid #f0f0f0', background:'#fafafa' }} />)}
            {Array.from({length:daysInMonth}).map((_,i) => {
              const d=i+1, dayStr=ds(cur.y,cur.m,d), evs=evOnDay(d), isToday=dayStr===todayStr
              return (
                <div key={d} onClick={() => setDayModal({date:dayStr, events:evs})}
                  style={{ height:80, overflow:'hidden', borderRight:'1px solid #f0f0f0', borderBottom:'1px solid #f0f0f0', padding:'6px 5px 4px', cursor:'pointer', background:'#fff', transition:'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8f8f8'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <div style={{ fontWeight:isToday?700:400, fontSize:13, color:isToday?'#fff':'#333', background:isToday?'#1a1a1a':'none', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:3 }}>{d}</div>
                  {evs.slice(0,2).map(ev => <div key={ev.id} style={{ background:EVENT_COLORS[ev.type]||'#f0f0f0', color:EVENT_TEXT[ev.type]||'#333', borderRadius:4, padding:'1px 5px', fontSize:11, fontWeight:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.title}</div>)}
                  {evs.length>2 && <div style={{ fontSize:10, color:'#aaa' }}>+{evs.length-2} more</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:220, flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:'#333' }}>Upcoming</div>
        {upcoming.length===0 ? <div style={{ fontSize:13, color:'#ccc' }}>No upcoming events.</div> :
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {upcoming.map(ev => (
              <div key={ev.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:10, padding:'10px 12px', cursor:'pointer' }} onClick={() => openEdit(ev)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', lineHeight:1.3 }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:'#aaa', flexShrink:0 }}>{ev.date.slice(5).replace('-','/')}</div>
                </div>
                <div style={{ display:'flex', gap:6, marginTop:5, alignItems:'center', flexWrap:'wrap' }}>
                  <Tag label={ev.type} color={EVENT_COLORS[ev.type]} text={EVENT_TEXT[ev.type]} />
                  {ev.time && <span style={{ fontSize:11, color:'#888' }}>{ev.time}</span>}
                </div>
              </div>
            ))}
          </div>
        }
        <div style={{ marginTop:24 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:'#333' }}>Event Types</div>
          {EVENT_TYPES.map(t => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:EVENT_COLORS[t], border:'1px solid rgba(0,0,0,0.06)', flexShrink:0 }} />
              <span style={{ fontSize:12, color:'#666' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {dayModal && (
        <Modal title={dayModal.date} onClose={() => setDayModal(null)}>
          {dayModal.events.length===0 && <div style={{ color:'#aaa', fontSize:14, marginBottom:16 }}>No events on this day. Add one below.</div>}
          {dayModal.events.map(ev => (
            <div key={ev.id} style={{ border:'1.5px solid #e5e5e5', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{ev.title}</div>
                  <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
                    <Tag label={ev.type} color={EVENT_COLORS[ev.type]} text={EVENT_TEXT[ev.type]} />
                    {ev.time && <span style={{ fontSize:12, color:'#888' }}>{ev.time}</span>}
                  </div>
                  {ev.notes && <div style={{ fontSize:12, color:'#666', marginTop:5 }}>{ev.notes}</div>}
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0, marginLeft:8 }}>
                  <Btn small variant="secondary" onClick={() => openEdit(ev)}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => del(ev.id)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
          <Btn onClick={() => openAdd(dayModal.date)}>+ Add Event</Btn>
        </Modal>
      )}

      {show && (
        <Modal title={editing ? 'Edit Event' : 'Add Event'} onClose={() => { setShow(false); setEditing(null) }}>
          <Input label="Title *" value={form.title} onChange={v => setForm({...form,title:v})} placeholder="e.g. Interview at Acme Corp" />
          <Sel label="Type" value={form.type} onChange={v => setForm({...form,type:v})} options={EVENT_TYPES} />
          <Input label="Date *" type="date" value={form.date} onChange={v => setForm({...form,date:v})} />
          <Input label="Time (optional)" type="time" value={form.time} onChange={v => setForm({...form,time:v})} />
          <Input label="Notes (optional)" value={form.notes} onChange={v => setForm({...form,notes:v})} placeholder="Details, prep notes, links..." multiline rows={3} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="secondary" onClick={() => { setShow(false); setEditing(null) }}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}