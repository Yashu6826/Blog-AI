import React from 'react'
import { FolderGit2, House, UserCircle2 } from 'lucide-react'

const Footer = () => (
  <footer className='border-t border-[var(--border-soft)] bg-[var(--bg-page)] px-5 text-[var(--text-faint)] sm:px-8'>
    <div className='mx-auto flex max-w-[1320px] flex-col gap-6 py-8 font-mono text-sm sm:flex-row sm:items-center sm:justify-between'>
      <p><span className='text-[var(--text-strong)]'>QuickBlog</span><span className='text-[var(--accent)]'>/log</span></p>
      <div className='flex flex-wrap gap-5'>
        <a href='#feed' className='inline-flex items-center gap-2 hover:text-[var(--accent)]'><House className='h-4 w-4' />root</a>
        <a href='#archive' className='inline-flex items-center gap-2 hover:text-[var(--accent)]'><FolderGit2 className='h-4 w-4' />commits</a>
        <a href='#about' className='inline-flex items-center gap-2 hover:text-[var(--accent)]'><UserCircle2 className='h-4 w-4' />profile</a>
      </div>
      <p>(c) {new Date().getFullYear()} QuickBlog. All rights reserved.</p>
    </div>
  </footer>
)

export default Footer
