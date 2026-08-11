import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import AccountBar from '../components/AccountBar.jsx'
import CopyrightFooter from '../components/CopyrightFooter.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function Dashboard() {
  const { t } = useLanguage()
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
          setError(t('Could not load your nutrition plan.'))
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
        setError(err.response?.data?.message || t('Could not generate a plan.'))
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="page-center">{t('Loading...')}</div>
  }

  return (
    <div className="card">
      <AccountBar />
      <h1>{t('Your nutrition dashboard')}</h1>
      {error && <div className="alert-error">{error}</div>}
      {needsProfile && (() => {
        // The link's position in the sentence differs by language ("Please
        // <link> first" vs "Veuillez d'abord <link>"), so split the
        // translated template on the {link} placeholder instead of
        // hardcoding word order.
        const [before, after] = t('Please {link} first.').split('{link}')
        return (
          <div className="alert-error">
            {before}
            <Link to="/profile">{t('complete your athlete profile')}</Link>
            {after}
          </div>
        )
      })()}

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? t('Generating...') : plan ? t('Regenerate plan') : t('Generate my plan')}
      </button>

      {plan && (
        <div className="plan-grid">
          <div className="stat-box">
            <span className="stat-label">{t('BMR')}</span>
            <span className="stat-value">{plan.bmr} kcal</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('TDEE')}</span>
            <span className="stat-value">{plan.tdee} kcal</span>
          </div>
          <div className="stat-box highlight">
            <span className="stat-label">{t('Target calories')}</span>
            <span className="stat-value">{plan.targetCalories} kcal</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('Protein')}</span>
            <span className="stat-value">{plan.proteinGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('Carbs')}</span>
            <span className="stat-value">{plan.carbsGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('Fat')}</span>
            <span className="stat-value">{plan.fatGrams} g</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('Goal')}</span>
            <span className="stat-value">{plan.goal}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">{t('Activity level')}</span>
            <span className="stat-value">{plan.activityLevel}</span>
          </div>
        </div>
      )}

      {!plan && !needsProfile && (
        <p>{t("You don't have a nutrition plan yet. Generate one to get your personalized macro targets.")}</p>
      )}

      <CopyrightFooter />
    </div>
  )
}
