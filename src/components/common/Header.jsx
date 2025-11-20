import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const Header = () => {
  const { token, loginWithGoogle, logout } = useAuth()

  return (
    <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #eee' }}>
      <Link to="/chat" style={{ fontWeight:700 }}>🌤 Cloud1PM</Link>
      <nav style={{ display:'flex', gap:16 }}>
        <Link to="/chat">채팅</Link>
        <Link to="/report">감정 리포트</Link>
        <Link to="/community">커뮤니티</Link>
        <Link to="/character">캐릭터</Link>
      </nav>
      <div>
        {token
          ? <button onClick={logout}>로그아웃</button>
          : <button onClick={loginWithGoogle}>구글 로그인</button>}
      </div>
    </header>
  )
}

export default Header
