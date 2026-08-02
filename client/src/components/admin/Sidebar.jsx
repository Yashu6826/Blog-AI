import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const links = [
    ['01', '/admin/stories', 'My stories', true],
    ['02', '/admin/addBlog', 'New story'],
    ['03', '/admin/listBlog', 'Blog lists'],
    ['04', '/admin/comments', 'Comments'],
  ]

  return (
    <nav className='flex min-h-full flex-col border-r border-[var(--border-soft)] bg-[var(--bg-page)] pt-5'>
      {links.map(([number, to, label, end]) => (
        <NavLink key={to} end={end} to={to} className={({isActive})=> `flex items-center gap-3 px-3 py-3.5 font-mono text-sm transition md:min-w-64 md:px-8 ${isActive ? 'border-r-2 border-[var(--accent)] bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-strong)]'}`}>
          <span className='min-w-5 text-xs'>{number}</span>
          <p className='hidden md:inline-block'>{label}</p>
        </NavLink>
      ))}
    </nav>
  )
}

export default Sidebar
