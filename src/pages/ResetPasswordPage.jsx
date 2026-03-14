import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { FaLock, FaCheck } from 'react-icons/fa'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if we have a valid recovery token
    const token = searchParams.get('token')
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        navigate('/auth')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rc-page-container">
      <div className="rc-auth-card">
        <h2 className="rc-page-title">Reset Password</h2>
        <p className="rc-page-subtitle">Enter your new password below</p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FaCheck style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', color: '#065f46' }}>Password reset successful!</p>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rc-form">
            {error && (
              <div className="rc-error-message" style={{ 
                padding: '0.75rem', 
                background: '#fee2e2', 
                color: '#dc2626', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <label className="rc-field-label">
              <FaLock style={{ marginRight: '0.5rem', display: 'inline' }} />
              New Password
              <input
                className="rc-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
                minLength={6}
              />
            </label>

            <label className="rc-field-label">
              <FaLock style={{ marginRight: '0.5rem', display: 'inline' }} />
              Confirm Password
              <input
                className="rc-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                minLength={6}
              />
            </label>

            <button type="submit" className="rc-primary-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="rc-spinner" style={{ marginRight: '0.5rem' }}></span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  color: '#1d4ed8', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

