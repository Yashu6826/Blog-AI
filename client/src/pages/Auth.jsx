import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const Auth = () => {
  const [params] = useSearchParams()
  const [isRegistering, setIsRegistering] = useState(params.get('mode') !== 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef(null)
  const { axios, setToken, setUser, token, authReady } = useAppContext()
  const navigate = useNavigate()
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const finishAuth = (data, message) => {
    localStorage.setItem('token', data.token)
    axios.defaults.headers.common.Authorization = data.token
    setToken(data.token)
    setUser(data.user)
    toast.success(message)
    navigate('/')
  }

  useEffect(() => {
    if (authReady && token) navigate('/', { replace: true })
  }, [authReady, token, navigate])

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) return toast.error('Google did not return a credential.')
          setLoading(true)
          try {
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/google`, { credential: response.credential })
            if (!data.success) return toast.error(data.message)
            finishAuth(data, `Welcome, ${data.user.name}.`)
          } catch (error) {
            toast.error(error.response?.data?.detail || 'Google sign in failed.')
          } finally {
            setLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: googleButtonRef.current.offsetWidth || 320,
      })
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    document.body.appendChild(script)
  }, [axios, googleClientId])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/${isRegistering ? 'register' : 'login'}`, form)
      if (!data.success) return toast.error(data.message)
      finishAuth(data, isRegistering ? 'Your author account is ready.' : `Welcome back, ${data.user.name}.`)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to continue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen bg-[var(--bg-page)] px-5 py-10 text-[var(--text-main)] sm:py-16'>
      <div className='mx-auto max-w-[1180px] overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--bg-panel)] shadow-2xl [box-shadow:0_24px_80px_var(--shadow-color)] lg:grid lg:min-h-[700px] lg:grid-cols-[0.92fr_1.08fr]'>
        <section className='relative overflow-hidden border-b border-[var(--border-main)] p-8 lg:border-b-0 lg:border-r lg:p-12'>
          <div className='absolute inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:64px_64px]' />
          <div className='relative flex min-h-full flex-col'>
            <Link to='/' className='font-mono text-sm text-[var(--text-link)] hover:text-[var(--accent)]'>&lt;- index</Link>

            <div className='my-auto py-16'>
              <p className='font-mono text-xs font-semibold uppercase tracking-[0.42em] text-[var(--accent)]'>// auth gateway</p>
              <h1 className='mt-7 text-5xl font-bold leading-tight tracking-tight text-[var(--text-strong)] sm:text-6xl'>
                Create your account. <span className='text-[var(--text-faint)]'>Start writing.</span>
              </h1>
              <p className='mt-7 max-w-md text-lg leading-8 text-[var(--text-muted)]'>
                Sign in or create an author account to ship posts, store drafts, and work inside the QuickBlog writing surface.
              </p>
            </div>

            <div className='grid overflow-hidden rounded-lg border border-[var(--border-main)] sm:grid-cols-3'>
              {[
                ['Mode', 'Author'],
                ['Access', 'Open'],
                ['Action', 'Write'],
              ].map(([label, value]) => (
                <div key={label} className='border-b border-[var(--border-soft)] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0'>
                  <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--text-dim)]'>{label}</p>
                  <p className='mt-2 break-words text-sm font-bold text-[var(--text-strong)]'>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='p-8 lg:p-12'>
          <div className='flex gap-2 border-b border-[var(--border-main)] pb-4 font-mono text-sm'>
            <button onClick={() => setIsRegistering(false)} className={`rounded-md px-4 py-2 ${!isRegistering ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>login</button>
            <button onClick={() => setIsRegistering(true)} className={`rounded-md px-4 py-2 ${isRegistering ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>register</button>
          </div>

          <div className='mt-10'>
            <p className='font-mono text-xs uppercase tracking-[0.34em] text-[var(--text-dim)]'>// oauth</p>
            <h2 className='mt-4 text-3xl font-bold tracking-tight text-[var(--text-strong)]'>Enter the writing runtime</h2>
            <p className='mt-3 max-w-lg leading-7 text-[var(--text-muted)]'>Use Google for a quick auth flow, or register with email and password below.</p>

            <div className='mt-7 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-4'>
              {googleClientId ? (
                <div ref={googleButtonRef} className='min-h-11 w-full' />
              ) : (
                <div className='rounded-md border border-dashed border-[var(--accent-border)] bg-[var(--bg-soft)] px-4 py-3 font-mono text-sm text-[var(--accent)]'>
                  Add VITE_GOOGLE_CLIENT_ID to client/.env to enable Google sign in.
                </div>
              )}
            </div>
          </div>

          <div className='my-9 flex items-center gap-4'>
            <span className='h-px flex-1 bg-[var(--border-main)]' />
            <span className='font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-placeholder)]'>manual path</span>
            <span className='h-px flex-1 bg-[var(--border-main)]' />
          </div>

          <form onSubmit={submit} className='space-y-5'>
            {isRegistering && (
              <label className='block text-sm font-semibold text-[var(--text-main)]'>
                Display name
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className='mt-2 h-12 w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 text-[var(--text-strong)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)]' placeholder='How readers will know you' />
              </label>
            )}
            <label className='block text-sm font-semibold text-[var(--text-main)]'>
              Email
              <input required type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className='mt-2 h-12 w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 text-[var(--text-strong)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)]' placeholder='you@example.com' />
            </label>
            <label className='block text-sm font-semibold text-[var(--text-main)]'>
              Password
              <input required minLength='8' type='password' value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className='mt-2 h-12 w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 text-[var(--text-strong)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)]' placeholder='At least 8 characters' />
            </label>
            <button disabled={loading} className='w-full rounded-md border border-[var(--accent-border)] bg-[var(--bg-soft)] py-3 font-mono text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft-strong)] disabled:opacity-60'>
              {loading ? 'authenticating...' : isRegistering ? 'create account' : 'login with password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Auth
