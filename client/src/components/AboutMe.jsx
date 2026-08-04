import React from 'react'
import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import { RiGlobalLine } from 'react-icons/ri'

const profileLinks = [
  { label: 'GitHub', href: 'https://github.com/Yashu6826', icon: FaGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yashraj-gupta-803282251/', icon: FaLinkedinIn },
  { label: 'LeetCode', href: 'https://leetcode.com/u/yashrajgupta6826/', icon: SiLeetcode },
  { label: 'Blog', href: 'https://portfolio-website-nine-theta-99.vercel.app/', icon: RiGlobalLine },
  { label: 'Email', href: 'mailto:yashrajgupta6826@gmail.com', icon: Mail },
]

const AboutMe = () => {
  return (
    <article id='about' className='relative col-span-full overflow-hidden border-b border-[var(--border-main)] bg-[var(--bg-panel)] px-4 py-5 text-center sm:px-6 lg:px-8'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:54px_54px]' />
      <div className='relative mx-auto flex max-w-3xl flex-col items-center'>
        <div className='rounded-full border border-[var(--accent-border)] bg-[var(--bg-elevated)] p-1 shadow-[0_0_24px_var(--shadow-color)]'>
          <img
            src='/yashraj_pic_img.jpg'
            alt='Yashraj Gupta'
            className='h-14 w-14 rounded-full object-cover object-[50%_28%] sm:h-16 sm:w-16'
          />
        </div>

        <p className='mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]'>// maintainer</p>
        <h2 className='mt-1.5 max-w-3xl text-base font-bold leading-snug tracking-tight text-[var(--text-strong)] sm:text-lg'>
          Yashraj Gupta, writing about full-stack engineering, AI Agents, production systems, and the work behind shipping better software.
        </h2>
        <p className='mt-1.5 font-mono text-[11px] text-[var(--text-faint)]'>12 posts</p>

        <p className='mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]'>
          Hey there, I am a developer who likes turning messy product problems into clear systems. This blog is where I collect practical notes from building web apps, debugging backend behavior, experimenting with AI workflows, and learning what actually survives production.
        </p>

        <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
          {profileLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target='_blank'
              rel='noreferrer'
              aria-label={link.label}
              className='grid h-7 min-w-7 place-items-center rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2 font-mono text-[10px] font-semibold text-[var(--text-dim)] transition hover:border-[var(--accent-border)] hover:bg-[var(--bg-soft)] hover:text-[var(--accent)]'
            >
              <link.icon className='h-3.5 w-3.5' />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

export default AboutMe
