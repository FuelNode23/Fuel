import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active (1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active (3-5 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very active (6-7 days/week)' },
  { value: 'EXTRA_ACTIVE', label: 'Extra active (2x/day or physical job)' }
]

const GOALS = [
  { value: 'CUTTING', label: 'Cutting (fat loss, preserve muscle)' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'BULKING', label: 'Bulking (lean mass gain)' }
]

const emptyForm = {
  age: '',
  gender: 'MALE',
  heightCm: '',
  weightKg: '',
  activityLevel: 'MODERATELY_ACTIVE',
  goal: 'MAINTENANCE',
  sport: ''
}

export default function Profile() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiClient
      .get('/athletes/profile')
      .then(({ data }) => {
        if (!cancelled) {
          setForm({
            age: data.age ?? '',
            gender: data.gender ?? 'MALE',
            heightCm: data.heightCm ?? '',
            weightKg: data.weightKg ?? '',
            activityLevel: data.activityLevel ?? 'MODERATELY_ACTIVE',
            goal: data.goal ?? 'MAINTENANCE',
            sport: data.sport ?? ''
          })
        }
      })
      .catch((err) => {
        // 404 just means the athlete hasn't created a profile yet — keep the blank form.
        if (err.response?.status !== 404 && !cancelled) {
          setError('Could not load your profile.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await apiClient.put('/athletes/profile', {
        ...form,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg)
      })
      setSuccess('Profile saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="page-center">Loading profile...</div>
  }

  return (
    <div className="card form-card">
      <h1>Athlete profile</h1>
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Age
          <input type="number" min="10" max="100" value={form.age} onChange={handleChange('age')} required />
        </label>

        <label>
          Gender
          <select value={form.gender} onChange={handleChange('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </label>

        <label>
          Height (cm)
          <input
            type="number"
            step="0.1"
            min="50"
            max="260"
            value={form.heightCm}
            onChange={handleChange('heightCm')}
            required
          />
        </label>

        <label>
          Weight (kg)
          <input
            type="number"
            step="0.1"
            min="20"
            max="400"
            value={form.weightKg}
            onChange={handleChange('weightKg')}
            required
          />
        </label>

        <label>
          Activity level
          <select value={form.activityLevel} onChange={handleChange('activityLevel')}>
            {ACTIVITY_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Goal
          <select value={form.goal} onChange={handleChange('goal')}>
            {GOALS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Primary sport (optional)
          <input type="text" value={form.sport} onChange={handleChange('sport')} placeholder="e.g. Marathon running" />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      <button className="link-button" onClick={() => navigate('/dashboard')}>
        Go to dashboard →
      </button>
    </div>
  )
}
