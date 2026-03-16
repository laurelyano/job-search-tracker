const NAV = [
  { id:'calendar', label:'Calendar' },
  { id:'applications', label:'Applications' },
  { id:'resumes', label:'Resumes' },
  { id:'networking', label:'Networking' },
  { id:'todo', label:'To-Do' },
  { id:'prep', label:'Prep & Projects' },
]

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <div style={{ width:200, flexShrink:0, background:'#fff', borderRight:'1.5px solid #ebebeb', display:'flex', flexDirection:'column', padding:'28px 0 20px', minHeight:'100vh' }}>
      <div style={{ padding:'0 20px 28px' }}>
        <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.3px', color:'#1a1a1a' }}>Job Search</div>
        <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>Tracker</div>
      </div>
      <nav style={{ flex:1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ width:'100%', textAlign:'left', border:'none', background:'none', padding:'10px 20px', fontSize:14, fontWeight:page===n.id ? 700 : 500, color:page===n.id ? '#1a1a1a' : '#888', cursor:'pointer', borderLeft:page===n.id ? '3px solid #1a1a1a' : '3px solid transparent', transition:'all .15s' }}>
            {n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:'16px 20px', borderTop:'1.5px solid #f0f0f0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          {user.photoURL && <img src={user.photoURL} alt="" style={{ width:28, height:28, borderRadius:'50%' }} />}
          <div style={{ fontSize:12, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.displayName || user.email}</div>
        </div>
        <button onClick={onLogout} style={{ background:'none', border:'1.5px solid #e5e5e5', borderRadius:7, padding:'6px 12px', fontSize:12, color:'#888', cursor:'pointer', width:'100%', fontWeight:600 }}>Sign out</button>
      </div>
    </div>
  )
}