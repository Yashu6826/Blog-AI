import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const HomeLead = () => {
  const { blogs } = useAppContext()
  const navigate = useNavigate()
  const featured = blogs[0]
  const supporting = blogs.slice(1, 3)

  if (!featured) return null

  return <section className='border-b border-stone-200 bg-[#fcfcfa]'><div className='mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16'>
    <div className='mb-8 flex items-center justify-between'><p className='text-xs font-bold uppercase tracking-[.2em] text-primary'>Editor’s selection</p><p className='hidden text-sm text-stone-500 sm:block'>Read slowly. Think deeply.</p></div>
    <div className='grid gap-6 lg:grid-cols-[1.55fr_.8fr]'>
      <article onClick={() => navigate(`/blog/${featured._id}`)} className='group cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white lg:grid lg:grid-cols-2'>
        <div className='min-h-70 overflow-hidden'><img src={featured.image} alt={featured.title} className='h-full w-full object-cover transition duration-700 group-hover:scale-105' /></div>
        <div className='flex flex-col justify-center p-7 sm:p-10'><p className='text-xs font-bold uppercase tracking-[.16em] text-primary'>{featured.category}</p><h2 className='editorial-title mt-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl'>{featured.title}</h2><p className='mt-4 line-clamp-3 text-sm leading-6 text-stone-600'>{featured.subTitle || 'A fresh perspective for curious minds.'}</p><div className='mt-7 flex items-center justify-between text-sm'><span className='font-semibold text-stone-700'>By {featured.author?.name || 'QuickBlog Team'}</span><span className='font-semibold text-primary'>Read story →</span></div></div>
      </article>
      <aside className='rounded-2xl bg-[#173d34] p-7 text-white sm:p-8'><p className='text-xs font-bold uppercase tracking-[.18em] text-[#a9d4c0]'>Why QuickBlog</p><h2 className='editorial-title mt-4 text-3xl font-bold leading-tight'>A calmer place for big ideas.</h2><p className='mt-4 text-sm leading-6 text-white/70'>We make room for useful thinking—not just the loudest takes. Read ideas from people building, learning, and paying attention.</p><div className='mt-8 space-y-4 border-t border-white/15 pt-6'>{supporting.map((blog, index) => <button key={blog._id} onClick={() => navigate(`/blog/${blog._id}`)} className='block w-full text-left'><p className='text-[11px] font-bold uppercase tracking-wider text-[#a9d4c0]'>0{index + 1} · {blog.category}</p><p className='mt-1 line-clamp-2 font-semibold leading-snug'>{blog.title}</p></button>)}</div></aside>
    </div>
  </div></section>
}

export default HomeLead
