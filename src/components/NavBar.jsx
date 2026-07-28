import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Athlete Nutrition</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/dashboard">Dashboard</Link>
            <span className="nav-user">Hi, {user.fullName}</span>
            <button onClick={handleLogout} className="link-button">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
