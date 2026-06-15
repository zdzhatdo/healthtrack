import { useNavigate, Link } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold text-blue-600">HealthTrack</h1>
        <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        <Link to="/new" className="text-sm text-gray-600 hover:text-blue-600">New Log</Link>
        <Link to="/history" className="text-sm text-gray-600 hover:text-blue-600">History</Link>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-500"
      >
        Log out
      </button>
    </nav>
  )
}

export default Navbar