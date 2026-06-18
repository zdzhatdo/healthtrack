import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api'

function Verify() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('verifying')
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            setStatus('error')
            return
        }

        const verify = async () => {
            try {
                await verifyEmail(token)
                setStatus('success')
            } catch (err) {
                setStatus('error')
            }
        }
        verify()
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
                {status === 'verifying' && (
                    <>
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying your email...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Email verified!</h1>
                        <p className="text-gray-500 mb-6">Your account is now active. You can log in below.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Go to login
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Verification failed</h1>
                        <p className="text-gray-500 mb-6">This link may be invalid or expired.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Back to login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Verify