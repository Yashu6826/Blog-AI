import React from 'react'

const Header = () => {
  return (
    <section id='intro' className='relative w-full overflow-hidden border-b border-[var(--border-soft)] bg-[var(--bg-page)]'>
      <div className='absolute inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:70px_70px]' />
      <div className='relative mx-auto w-full max-w-screen-2xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8 lg:pb-32 lg:pt-20'>
        <p className='font-mono text-xs font-semibold uppercase tracking-[0.45em] text-[var(--accent)]'>
          * logging since 2025 * long-form commits
        </p>
        <h1 className='mt-8 max-w-5xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--text-strong)] sm:text-6xl lg:text-7xl'>
          Notes from building products <span className='text-[var(--text-faint)]'>- the decisions, bugs, launches and lessons.</span>
        </h1>
        <p className='mt-8 max-w-3xl text-lg leading-8 text-[var(--text-muted)] sm:text-xl'>
          A quiet log for practical engineering notes, product thinking, AI experiments, and the occasional hard-earned opinion.
        </p>

        <dl className='mt-14 grid max-w-4xl overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] sm:grid-cols-2 lg:grid-cols-4'>
          {[
            ['Stack', ' AI products'],
            ['Runtime', 'AIML Engineer'],
            ['Region', 'Bengaluru, IN'],
            ['Longest trace', '14 min'],
          ].map(([label, value]) => (
            <div key={label} className='border-b border-[var(--border-soft)] p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0'>
              <dt className='font-mono text-[11px] uppercase tracking-[0.45em] text-[var(--text-dim)]'>{label}</dt>
              <dd className='mt-3 text-base font-bold leading-6 text-[var(--text-strong)]'>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
export default Header
