import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from './firebase'
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

  const handleGoogleCredential = async (response) => {
    const credential = GoogleAuthProvider.credential(response.credential)
    await signInWithCredential(auth, credential)
  }

  useEffect(() => {
    if (user || loading) return
    if (!window.google) return
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    })
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large', text: 'sign_in_with', shape: 'rectangular' }
    )
  }, [user, loading])
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
        <div id="google-signin-btn" style={{ display:'flex', justifyContent:'center' }}></div>
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