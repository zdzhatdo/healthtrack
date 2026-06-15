import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLog } from '../api'
import Navbar from '../components/Navbar'

function NewLog() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [symptoms, setSymptoms] = useState([{ symptom: '', severity: 5 }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const addSymptom = () => {
    setSymptoms([...symptoms, { symptom: '', severity: 5 }])
  }

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const updateSymptom = (index, field, value) => {
    const updated = symptoms.map((s, i) => i === index ? { ...s, [field]: value } : s)
    setSymptoms(updated)
  }

  const handleSubmit = async () => {
    if (symptoms.some(s => !s.symptom)) { setError('Please fill in all symptom fields'); return }
    if (symptoms.length === 0) { setError('Add at least one symptom'); return }
    setLoading(true)
    setError('')
    try {
      await createLog({
        date,
        notes,
        symptoms: symptoms.map(s => ({ symptom: s.symptom, severity: parseInt(s.severity) }))
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Log a Symptom</h2>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Symptoms</label>
              <button
                onClick={addSymptom}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add another
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {symptoms.map((s, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Symptom {i + 1}</span>
                    {symptoms.length > 1 && (
                      <button
                        onClick={() => removeSymptom(i)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={s.symptom}
                    onChange={(e) => updateSymptom(i, 'symptom', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. headache, fatigue, nausea"
                  />
                  <div>
                    <label className="text-xs text-gray-500">
                      Severity — <span className="text-blue-600 font-semibold">{s.severity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={s.severity}
                      onChange={(e) => updateSymptom(i, 'severity', e.target.value)}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Mild</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Any additional context..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewLog