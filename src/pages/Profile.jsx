import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'

const GENDERS = ['Male', 'Female', 'Other']

const emptyForm = {
  name: '',
  age: '',
  gender: 'Male',
  weight: '',
  height: '',
}

// This page only edits the basics (name/age/gender/weight/height).
// Everything else on the athlete's profile (sports, goals, race plan,
// diet preferences, delivery day, ...) was collected during onboarding
// and must be sent back unchanged on save — PUT /athletes/profile
// overwrites every field it's given, so omitting them would wipe them.
function buildCarryForward(profile) {
  if (!profile) return {}
  return {
    sports: (profile.sports || []).map((s) => s.sport),
    sport_profiles: Object.fromEntries(
      (profile.sports || []).map((s) => [
        s.sport,
        { discipline: s.discipline, level: s.experienceLevel },
      ])
    ),
    goals: profile.objectives || [],
    connectChoice: profile.connectChoice,
    sessions_per_week: profile.sessionsPerWeek,
    typical_distance: profile.weeklyDistanceKm,
    pace: profile.averagePace,
    avg_elevation: profile.averageElevation,
    session_time: profile.trainingTime,
    target_event: profile.racePlanned ? 'Yes' : 'No',
    goal_event: profile.goalEvent,
    race_distance: profile.raceDistance,
    weeks_to_event: profile.weeksToEvent,
    race_date: profile.raceDate,
    event_location: profile.eventLocation,
    stomach_sensitivity: profile.stomachSensitivity,
    caffeine_intake: profile.caffeinePreference,
    diet_pattern: profile.regime,
    restrictions: profile.restrictions || [],
    preferred_formats: profile.preferredFormats || [],
    supplement_type: profile.supplements || [],
    delivery_day: profile.deliveryDay,
    nutrition_issue_history: profile.nutritionIssueHistory,
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [existingProfile, setExistingProfile] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiClient
      .get('/athletes/profile')
      .then(({ data }) => {
        if (cancelled) return
        setExistingProfile(data)
        setHasProfile(true)
        setForm({
          name: data.firstName ?? '',
          age: data.age ?? '',
          gender: data.gender ?? 'Male',
          weight: data.weightKg ?? '',
          height: data.heightCm ?? '',
        })
      })
      .catch((err) => {
        // 404 just means the athlete hasn't completed onboarding yet.
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
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        weight: Number(form.weight),
        height: Number(form.height),
        ...buildCarryForward(existingProfile),
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

  if (!hasProfile) {
    return (
      <div className="card form-card">
        <h1>Athlete profile</h1>
        {error && <div className="alert-error">{error}</div>}
        <p>You haven&apos;t completed onboarding yet, so there&apos;s no profile to edit.</p>
        <button type="button" onClick={() => navigate('/onboarding')}>
          Start onboarding
        </button>
      </div>
    )
  }

  return (
    <div className="card form-card">
      <h1>Athlete profile</h1>
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label>
          Age
          <input type="number" min="10" max="100" value={form.age} onChange={handleChange('age')} required />
        </label>

        <label>
          Gender
          <select value={form.gender} onChange={handleChange('gender')}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label>
          Height (cm)
          <input
            type="number"
            step="0.1"
            min="50"
            max="260"
            value={form.height}
            onChange={handleChange('height')}
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
            value={form.weight}
            onChange={handleChange('weight')}
            required
          />
        </label>

        {existingProfile?.sports?.length > 0 && (
          <div className="profile-sports-readonly">
            <span>Sports</span>
            <ul>
              {existingProfile.sports.map((s) => (
                <li key={s.id ?? s.sport}>
                  {s.sport}
                  {s.discipline ? ` · ${s.discipline}` : ''}
                  {s.experienceLevel ? ` · ${s.experienceLevel}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

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
