import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client.js'

export default function Dashboard() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [needsProfile, setNeedsProfile] = useState(false)

  const loadLatestPlan = () => {
    setLoading(true)
    setError('')
    apiClient
      .get('/nutrition/latest')
      .then(({ data }) => setPlan(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          // No plan yet — not an error state, just prompts the user to generate one.
          setPlan(null)
        } else {
          setError('Could not load your nutrition plan.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLatestPlan()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    setNeedsProfile(false)
    try {
      const { data } = await apiClient.post('/nutrition/generate')
      setPlan(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setNeedsProfile(true)
      } else {
        setError(err.response?.data?.message || 'Could not generate a plan.')
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="page-center">Loading...</div>
  }

  return (
    <div className="card">
      <h1>Your nutrition dashboard</h1>
      {error && <div className="alert-error">{error}</div>}
      {needsProfile && (
        <div className="alert-error">
          Please <Link to="/profile">complete your athlete profile</Link> first.
        </div>
      )}

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : plan ? 'Regenerate plan' : 'Generate my plan'}
      </button>

      {plan && (
        <div className="plan-grid">
          <div className="stat-box">
            <span className="stat-label">BMR</span>
            <span className="stat-value">{plan.bmr} kcal</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">TDEE</span>
            <span className="stat-value">{plan.tdee} kcal</span>
          </div>
          <div className="stat-box highlight">
            <span className="stat-label">Target calories</span>
            <span className="stat-value">{plan.targetCalories} kcal</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Protein</span>
            <span className="stat-value">{plan.proteinGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Carbs</span>
            <span className="stat-value">{plan.carbsGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Fat</span>
            <span className="stat-value">{plan.fatGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Goal</span>
            <span className="stat-value">{plan.goal}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Activity level</span>
            <span className="stat-value">{plan.activityLevel}</span>
          </div>
        </div>
      )}

      {!plan && !needsProfile && (
        <p>You don't have a nutrition plan yet. Generate one to get your personalized macro targets.</p>
      )}
    </div>
  )
}
