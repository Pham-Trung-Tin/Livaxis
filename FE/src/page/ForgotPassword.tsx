import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/authApi'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [devToken, setDevToken] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setDevToken('')

    try {
      const response = await forgotPassword({ email })
      setMessage(response.message || 'If your email exists, reset instructions were generated.')
      if (response?.data?.resetToken) {
        setDevToken(response.data.resetToken)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Cannot process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
        <p className="mb-6 text-sm text-neutral-500">Enter your account email to generate reset token.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
            placeholder="you@example.com"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          {devToken ? <p className="text-xs text-neutral-600">Dev reset token: {devToken}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Generate reset token'}
          </button>
        </form>

        <button
          onClick={() => navigate('/sign-in')}
          className="mt-4 text-sm text-neutral-600 underline underline-offset-2"
        >
          Back to sign in
        </button>
      </div>
    </div>
  )
}
