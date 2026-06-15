import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api'

function Login() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    console.log('submitting', email, password, isRegistering)
    try {
      if (isRegistering) {
        await register(email, password)
        setIsRegistering(false)
        setError('Account created! Please log in.')
        return
      }
      const res = await login(email, password)
      localStorage.setItem('token', res.data.access_token)
      navigate('/')
    } catch (err) {
      console.log('error', err)
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">HealthTrack</h1>
        <p className="text-gray-500 mb-6">{isRegistering ? 'Create an account' : 'Sign in to continue'}</p>

        {error && (
          <div className="bg-blue-50 text-blue-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition"
        >
          {isRegistering ? 'Create account' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError('') }}
            className="text-blue-600 ml-1 hover:underline"
          >
            {isRegistering ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login