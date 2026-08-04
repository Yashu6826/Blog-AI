import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderGit2, House, LogIn, LogOut, MoonStar, PenSquare, SunMedium, UserCircle2, Workflow } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const { user, canWrite, theme, toggleTheme, logout, renderGoogleButton } = useAppContext()
  const navigate = useNavigate()
  const googleButtonRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (user || canWrite) return
    renderGoogleButton(googleButtonRef.current, { width: 96 })
  }, [canWrite, renderGoogleButton, user])

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false)
    }

    document.addEventListener('mousedown', closeProfileMenu)
    return () => document.removeEventListener('mousedown', closeProfileMenu)
  }, [])

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className='sticky top-0 z-50 w-full overflow-x-clip border-b border-[var(--border-soft)] bg-[var(--nav-bg)] backdrop-blur'>
      <div className='mx-auto flex min-h-[72px] w-full max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8'>
        <Link to='/' className='flex min-w-0 shrink-0 items-center gap-3 text-base font-bold tracking-tight text-[var(--text-strong)] sm:text-lg'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--bg-elevated)] font-mono text-sm text-[var(--accent)]'>~</span>
          <span className='truncate'>QuickBlog<span className='text-[var(--accent)]'>/log</span></span>
        </Link>

        <nav className='ml-auto flex min-w-0 items-center justify-end gap-2 overflow-visible font-mono text-xs text-[var(--text-faint)] sm:gap-4 sm:text-sm lg:gap-6'>
          <a href='#feed' className='flex items-center gap-2 rounded-md bg-[var(--bg-soft)] px-4 py-2 font-semibold text-[var(--accent)]'>
            <House className='h-4 w-4' />
            <span>root</span>
          </a>
          <a href='#archive' className='hidden items-center gap-2 transition hover:text-[var(--text-strong)] sm:flex'>
            <FolderGit2 className='h-4 w-4' />
            <span>commits</span>
          </a>
          <a href='#about' className='hidden items-center gap-2 transition hover:text-[var(--text-strong)] sm:flex'>
            <UserCircle2 className='h-4 w-4' />
            <span>profile</span>
          </a>
          {canWrite && <Link to='/admin/stories' className='hidden items-center gap-2 transition hover:text-[var(--text-strong)] md:flex'><Workflow className='h-4 w-4' /><span>workspace</span></Link>}
          <button onClick={toggleTheme} className='flex items-center gap-2 rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-dim)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]'>
            {theme === 'dark' ? <SunMedium className='h-4 w-4' /> : <MoonStar className='h-4 w-4' />}
            <span>{theme === 'dark' ? 'light' : 'dark'}</span>
          </button>
          <span className='hidden h-8 w-px shrink-0 bg-[var(--border-main)] sm:block' />
          {canWrite && (
            <button onClick={() => navigate('/admin/addBlog')} className='flex shrink-0 items-center gap-2 rounded-md border border-[var(--accent-border)] px-3 py-2 font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft)] sm:px-4'>
              <PenSquare className='h-4 w-4' />
              <span>ship</span>
            </button>
          )}
          {user ? (
            <div ref={profileMenuRef} className='relative shrink-0'>
              <button
                type='button'
                onClick={() => setProfileOpen((current) => !current)}
                className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--accent-border)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--accent)] transition hover:bg-[var(--bg-soft)]'
                aria-label='Open profile menu'
                aria-expanded={profileOpen}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name || 'Profile'} referrerPolicy='no-referrer' className='h-full w-full object-cover' />
                ) : (
                  <span>{userInitial}</span>
                )}
              </button>
              {profileOpen && (
                <div className='absolute right-0 mt-3 w-56 rounded-md border border-[var(--border-main)] bg-[var(--bg-panel)] p-2 shadow-2xl [box-shadow:0_18px_60px_var(--shadow-color)]'>
                  <div className='border-b border-[var(--border-soft)] px-3 py-2'>
                    <p className='truncate text-sm font-semibold text-[var(--text-strong)]'>{user.name}</p>
                    <p className='truncate text-xs text-[var(--text-dim)]'>{user.email}</p>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setProfileOpen(false)
                      logout()
                    }}
                    className='mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[var(--text-link)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--accent)]'
                  >
                    <LogOut className='h-4 w-4' />
                    <span>logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='relative h-10 w-[96px] shrink-0 overflow-hidden rounded-md'>
              <button type='button' tabIndex={-1} className='pointer-events-none flex h-full w-full items-center justify-center gap-2 rounded-md border border-[var(--accent-border)] px-3 font-semibold text-[var(--accent)]'>
                <LogIn className='h-4 w-4' />
                <span>auth</span>
              </button>
              <div ref={googleButtonRef} className='absolute inset-0 opacity-0' />
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
export default Navbar
