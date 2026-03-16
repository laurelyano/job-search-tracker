import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from './firebase'
import Sidebar from './components/Sidebar'
import CalendarPage from './components/CalendarPage'
import ApplicationsPage from './components/ApplicationsPage'
import ResumesPage from './components/ResumesPage'
import NetworkingPage from './components/NetworkingPage'
import TodoPage from './components/TodoPage'
import PrepPage from './components/PrepPage'

const PAGE_TITLES = {
  calendar: 'Calendar',
  applications: 'Applications',
  resumes: 'Resumes',
  networking: 'Networking',
  todo: 'To-Do',
  prep: 'Prep & Projects',
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('calendar')

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const login = () => signInWithPopup(auth, provider)
  const logout = () => signOut(auth)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'#aaa', fontSize:14 }}>
      Loading...
    </div>
  )

  if (!user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f7f7f7' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'48px 40px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', textAlign:'center', maxWidth:360, width:'90%' }}>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px', marginBottom:8 }}>Job Search Tracker</div>
        <div style={{ fontSize:14, color:'#999', marginBottom:32 }}>Your personal job search command center</div>
        <button onClick={login} style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', border:'1.5px solid #e5e5e5', borderRadius:10, padding:'12px 24px', fontSize:15, fontWeight:600, cursor:'pointer', margin:'0 auto', transition:'box-shadow .2s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3-11.2-7.2l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )

  const pages = {
    calendar: <CalendarPage uid={user.uid} />,
    applications: <ApplicationsPage uid={user.uid} />,
    resumes: <ResumesPage uid={user.uid} />,
    networking: <NetworkingPage uid={user.uid} />,
    todo: <TodoPage uid={user.uid} />,
    prep: <PrepPage uid={user.uid} />,
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f7f7f7' }}>
      <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'28px 32px 0', borderBottom:'1.5px solid #ebebeb', background:'#fff' }}>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.3px', paddingBottom:20 }}>{PAGE_TITLES[page]}</div>
        </div>
        <div style={{ padding:'28px 32px', flex:1, overflowY:'auto' }}>
          {pages[page]}
        </div>
      </div>
    </div>
  )
}