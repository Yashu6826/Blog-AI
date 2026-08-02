import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {

    const {axios, setToken, setUser, user, navigate, theme, toggleTheme} = useAppContext()

    const logout = ()=>{
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = null;
        setToken(null)
        setUser(null)
        navigate('/')
    }

  return (
    <>
      <div className='flex h-[70px] items-center justify-between border-b border-[var(--border-soft)] bg-[var(--bg-page)] px-4 text-[var(--text-main)] sm:px-8'>
        <button type='button' className='flex items-center gap-3 text-left' onClick={()=> navigate('/')}>
          <span className='flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--bg-elevated)] font-mono text-sm text-[var(--accent)]'>~</span>
          <span className='text-lg font-bold tracking-tight text-[var(--text-strong)]'>QuickBlog<span className='text-[var(--accent)]'>/log</span></span>
        </button>
        <div className='flex items-center gap-4'>
          <span className='hidden font-mono text-sm text-[var(--text-faint)] sm:inline'>writing as {user?.name || 'Administrator'}</span>
          <button onClick={toggleTheme} className='rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 py-2 font-mono text-sm text-[var(--text-link)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]'>{theme === 'dark' ? 'light' : 'dark'}</button>
          <button onClick={logout} className='rounded-md border border-[var(--border-main)] px-4 py-2 font-mono text-sm text-[var(--text-link)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]'>logout</button>
        </div>
      </div>
      <div className='flex h-[calc(100vh-70px)] bg-[var(--bg-page)]'>
            <Outlet />
      </div>
    </>
  )
}

export default Layout
