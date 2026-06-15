import { useEffect, useState } from 'react'
import { getSummary, getLogs } from '../api'
import Navbar from '../components/Navbar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, logsRes] = await Promise.all([getSummary(), getLogs()])
        setSummary(summaryRes.data)
        const sorted = logsRes.data
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(log => ({ date: log.date, severity: log.severity, symptom: log.symptom }))
        setLogs(sorted)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Health Overview</h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Total Logs</p>
            <p className="text-3xl font-bold text-blue-600">{summary?.total_logs ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Avg Severity</p>
            <p className="text-3xl font-bold text-blue-600">{summary?.average_severity ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Most Common</p>
            <p className="text-3xl font-bold text-blue-600 truncate">{summary?.most_common_symptom ?? '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Symptom Severity Over Time</h3>
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No logs yet — add your first entry to see your chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="severity" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard