import { useEffect, useState } from 'react'
import { getSummary, getLogs } from '../api'
import Navbar from '../components/Navbar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
                <p className="font-medium text-gray-700 capitalize">{d.symptom}</p>
                <p className="text-gray-500">{d.date}</p>
                <p className="text-blue-600 font-semibold">Severity: {d.severity}/10</p>
            </div>
        )
    }
    return null
}

function Dashboard() {
    const [summary, setSummary] = useState(null)
    const [logs, setLogs] = useState([])
    const [rawLogs, setRawLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const symptomData = Object.values(
        logs.reduce((acc, log) => {
            if (!acc[log.symptom]) acc[log.symptom] = { symptom: log.symptom, total: 0, count: 0 }
            acc[log.symptom].total += log.severity
            acc[log.symptom].count += 1
            return acc
        }, {})
    ).map(s => ({ symptom: s.symptom, avgSeverity: parseFloat((s.total / s.count).toFixed(1)) }))
        .sort((a, b) => b.avgSeverity - a.avgSeverity)

    const barColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']

    // weekly report using raw logs so we can access nested symptoms
    const weeklyReport = () => {
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            const dayLogs = rawLogs.filter(l => l.date === dateStr)
            const allSymptoms = dayLogs.flatMap(l => l.symptoms)
            const avgSev = allSymptoms.length > 0
                ? parseFloat((allSymptoms.reduce((sum, s) => sum + s.severity, 0) / allSymptoms.length).toFixed(1))
                : null
            days.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: dateStr,
                count: allSymptoms.length,
                avgSeverity: avgSev
            })
        }
        return days
    }

    const weekData = weeklyReport()

    // calculate current logging streak in days
    const calculateStreak = () => {
        if (rawLogs.length === 0) return 0
        const loggedDates = new Set(rawLogs.map(l => l.date))
        let streak = 0
        let d = new Date()
        // check today first, if no log today start from yesterday
        const today = d.toISOString().split('T')[0]
        if (!loggedDates.has(today)) {
            d.setDate(d.getDate() - 1)
        }
        while (true) {
            const dateStr = d.toISOString().split('T')[0]
            if (!loggedDates.has(dateStr)) break
            streak++
            d.setDate(d.getDate() - 1)
        }
        return streak
    }

    const streak = calculateStreak()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, logsRes] = await Promise.all([getSummary(), getLogs()])
                setSummary(summaryRes.data)
                const logsData = logsRes.data
                setRawLogs(logsData)
                // flatten all symptoms into individual data points for the line chart
                const sorted = logsData
                    .flatMap(log => log.symptoms.map(s => ({
                        date: log.date,
                        label: `${log.date} (${s.symptom})`,
                        severity: s.severity,
                        symptom: s.symptom
                    })))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"> {/* adjusted for mobile-friendliness */}
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
                    <div className="bg-white rounded-xl shadow-sm p-5"> {/*streaks */}
                        <p className="text-sm text-gray-500 mb-1">Current Streak</p>
                        <p className="text-3xl font-bold text-blue-600">{streak} {streak === 1 ? 'day' : 'days'}</p>
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
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
                                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="severity" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {symptomData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Average Severity by Symptom</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={symptomData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="symptom" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`${value}/10`, 'Avg Severity']} />
                                <Bar dataKey="avgSeverity" radius={[4, 4, 0, 0]}>
                                    {symptomData.map((_, i) => (
                                        <Cell key={i} fill={barColors[i % barColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* weekly report */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Past 7 Days</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {weekData.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-400">{day.day}</span>
                                <div
                                    className={`w-full rounded-lg flex items-center justify-center py-3 text-xs font-semibold ${day.count === 0
                                        ? 'bg-gray-100 text-gray-300'
                                        : day.avgSeverity <= 3
                                            ? 'bg-green-100 text-green-700'
                                            : day.avgSeverity <= 6
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {day.count === 0 ? '—' : day.avgSeverity}
                                </div>
                                <span className="text-xs text-gray-400">{day.count} log{day.count !== 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                        <span>Severity:</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block"></span>Mild (1–3)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 inline-block"></span>Moderate (4–6)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"></span>Severe (7–10)</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard