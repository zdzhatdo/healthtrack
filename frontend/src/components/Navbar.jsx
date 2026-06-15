import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">HealthTrack</h1>

        {/* desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/new" className="text-sm text-gray-600 hover:text-blue-600">New Log</Link>
          <Link to="/history" className="text-sm text-gray-600 hover:text-blue-600">History</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Log out</button>
        </div>

        {/* mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-3 mt-4 pb-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/new" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 hover:text-blue-600">New Log</Link>
          <Link to="/history" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 hover:text-blue-600">History</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 text-left">Log out</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar