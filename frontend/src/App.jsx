import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewLog from './pages/NewLog'
import History from './pages/History'
import EditLog from './pages/EditLog'
import Verify from './pages/Verify'
import { getLogs } from './api'

// Previously this only checked whether *something* existed in localStorage,
// which meant anyone could set a fake token via DevTools and the protected
// page shell would render before any API call had a chance to reject it.
// Now it makes a real authenticated request first and only renders the
// protected content once the backend has actually confirmed the token.
function PrivateRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'valid' | 'invalid'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setStatus('invalid')
      return
    }
    getLogs()
      .then(() => setStatus('valid'))
      .catch(() => setStatus('invalid'))
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return status === 'valid' ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/new" element={<PrivateRoute><NewLog /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditLog /></PrivateRoute>} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App