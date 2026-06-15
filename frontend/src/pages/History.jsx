import { useEffect, useState } from 'react'
import { getLogs, deleteLog } from '../api'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchLogs = async () => {
    try {
      const res = await getLogs()
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setLogs(sorted)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return
    try {
      await deleteLog(id)
      setLogs(logs.filter(log => log.id !== id))
    } catch (err) {
      console.log(err)
    }
  }

  const severityColor = (s) => {
    if (s <= 3) return 'text-green-600 bg-green-50'
    if (s <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Log History</h2>

        {logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
            No logs yet — add your first entry from the New Log page
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Symptom</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Severity</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Notes</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-gray-700">{log.date}</td>
                    <td className="px-6 py-4 text-gray-700 capitalize">{log.symptom}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColor(log.severity)}`}>
                        {log.severity}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.notes || '—'}</td>
                    <td className="px-6 py-4 text-right flex gap-3 justify-end">
                        <button
                            onClick={() => navigate(`/edit/${log.id}`)}
                            className="text-blue-400 hover:text-blue-600 text-xs"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(log.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                        >
                            Delete
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default History