/**
 * UPSKILL AI - New User Onboarding (Phase 8)
 *
 * Shown only when the signed-in user's profile is incomplete (no position
 * selected yet). Collects the professional profile with the POSITION as the
 * key field: the selected position is persisted as the user's role_id, which
 * drives the role-specific competency framework, assessment, gap analysis and
 * recommendations. This is not a UI-only choice - everything downstream reads
 * the role from the database.
 */
import React, { useState } from 'react'
import { apiClient } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EmblemOfIndia } from './OfficialEmblems'

// Simple "other" free-text option: the list below covers the seeded positions;
// the backend accepts any framework role by id.
export function Onboarding() {
  const { user, refreshUser } = useAuth()
  const [roles, setRoles] = useState(null)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('')
  const [assignment, setAssignment] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')
  const [training, setTraining] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load positions once from the backend (DB-driven, not hard-coded).
  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const status = await apiClient.getOnboardingStatus()
        if (!mounted) return
        setRoles(status.roles || [])
      } catch {
        if (mounted) setError('Could not load the position list. Please refresh.')
      } finally {
        if (mounted) setLoadingRoles(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (!selectedRoleId) {
      setError('Please select your position / role.')
      return
    }
    if (!designation.trim() || designation.trim().length < 2) {
      setError('Please enter your designation (you can also pick a position below and refine it here).')
      return
    }
    if (!department.trim() || department.trim().length < 2) {
      setError('Please enter your department / office.')
      return
    }

    const selectedRole = roles?.find((r) => r.id === selectedRoleId)
    setSubmitting(true)
    try {
      await apiClient.completeOnboarding({
        role_id: selectedRoleId,
        designation: designation.trim(),
        department: department.trim(),
        assignment: assignment.trim() || null,
        education: education.trim() || null,
        work_experience: experience.trim() || null,
        previous_training: training.trim() || null,
      })
      // Re-fetch the user so the app re-renders with profile_completed=true.
      await refreshUser()
      // If the position changed nothing else is needed; App.jsx routes onward.
      void selectedRole
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="onboarding-viewport">
      <div className="onboarding-scene">
        {/* Top ministry badge, consistent with the login page */}
        <div className="login-top-gov-badge">
          <div className="gov-emblem-seal">
            <EmblemOfIndia width={32} height={52} />
          </div>
          <div className="gov-title-text">
            <span className="gov-dept">Ministry of Statistics</span>
            <span className="gov-dept">and Programme Implementation</span>
            <span className="gov-sub">Government of India</span>
          </div>
        </div>

        <div className="onboarding-glass-card">
          <div className="card-brand-row">
            <div className="card-brand-title">
              <span className="brand-upskill">UPSKILL </span>
              <span className="brand-ai">AI</span>
            </div>
            <span className="badge-sih-pill">SIH26101</span>
          </div>

          <h2 className="onboarding-title">Welcome, {user?.name || 'Officer'} 👋</h2>
          <p className="onboarding-subtitle">
            Complete your professional profile so UPSKILL AI can map your position
            to the right competency framework, assessment and learning plan.
          </p>

          {error && <div className="card-alert error">⚠ {error}</div>}

          {loadingRoles ? (
            <p className="loading-text">Loading positions…</p>
          ) : (
            <form onSubmit={handleSubmit} className="card-form" noValidate>
              {/* ── POSITION: the key field ── */}
              <div className="onboarding-field-block">
                <span className="detail-label">Position / Role *</span>
                <div className="onboarding-roles-grid">
                  {(roles || []).map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`onboarding-role-card ${selectedRoleId === role.id ? 'onboarding-role-selected' : ''}`}
                      onClick={() => setSelectedRoleId(role.id)}
                      aria-pressed={selectedRoleId === role.id}
                      title={role.description || ''}
                    >
                      <span className="onboarding-role-name">{role.name}</span>
                      {role.description && (
                        <span className="onboarding-role-desc">{role.description}</span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="onboarding-hint">
                  Your position determines the competency framework, diagnostic
                  assessment and recommendations you receive.
                </span>
              </div>

              {/* ── Profile fields ── */}
              <div className="onboarding-fields-grid">
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-designation">
                    Designation *
                  </label>
                  <input
                    id="ob-designation"
                    type="text"
                    className="card-input"
                    placeholder="e.g. Statistical Officer (Grade II)"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-department">
                    Department / Office *
                  </label>
                  <input
                    id="ob-department"
                    type="text"
                    className="card-input"
                    placeholder="e.g. Directorate of Economics & Statistics"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-assignment">
                    Current Assignment / Responsibility
                  </label>
                  <input
                    id="ob-assignment"
                    type="text"
                    className="card-input"
                    placeholder="e.g. NSS round data compilation"
                    value={assignment}
                    onChange={(e) => setAssignment(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-education">
                    Education
                  </label>
                  <input
                    id="ob-education"
                    type="text"
                    className="card-input"
                    placeholder="e.g. M.Sc. Statistics"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-experience">
                    Work Experience
                  </label>
                  <input
                    id="ob-experience"
                    type="text"
                    className="card-input"
                    placeholder="e.g. 3 years in survey operations"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="onboarding-field">
                  <label className="detail-label" htmlFor="ob-training">
                    Previous Training (if any)
                  </label>
                  <input
                    id="ob-training"
                    type="text"
                    className="card-input"
                    placeholder="e.g. NSSTA foundation course"
                    value={training}
                    onChange={(e) => setTraining(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="card-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Saving…</span>
                ) : (
                  <>
                    <span>Save Profile & Continue</span>
                    <span className="submit-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="login-bottom-motto">
          ASSESS &nbsp;|&nbsp; MAP &nbsp;|&nbsp; UPSKILL
        </div>
      </div>
    </div>
  )
}

export default Onboarding
