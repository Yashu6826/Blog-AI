import React from 'react'

const Newsletter = () => (
  <section className='mx-5 my-16 rounded-2xl bg-[#173d34] px-6 py-14 text-center text-white sm:mx-8 sm:py-18'>
    <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#a9d4c0]'>The Sunday edit</p>
    <h2 className='editorial-title mt-3 text-3xl font-bold sm:text-4xl'>A better reading habit.</h2>
    <p className='mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70'>A thoughtful roundup of fresh articles, delivered when there is something worth reading.</p>
    <form className='mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row'>
      <input className='h-12 flex-1 rounded-md border border-white/20 bg-white px-4 text-stone-900 outline-none' type='email' placeholder='you@example.com' required />
      <button type='submit' className='h-12 rounded-md bg-[#bce3cf] px-6 font-semibold text-[#173d34] transition hover:bg-white'>Subscribe</button>
    </form>
  </section>
)

export default Newsletter
