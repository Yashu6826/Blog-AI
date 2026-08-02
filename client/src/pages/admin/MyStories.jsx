import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const MyStories = () => {
  const { axios, user } = useAppContext(); const [blogs, setBlogs] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/mine`).then(({data}) => setBlogs(data.blogs || [])).finally(() => setLoading(false)) }, [])
  return <main className='flex-1 overflow-auto bg-[#f7f8f5] p-6 sm:p-10'><p className='text-xs font-bold uppercase tracking-[.18em] text-primary'>Author studio</p><div className='mt-2 flex items-end justify-between gap-4'><div><h1 className='editorial-title text-4xl font-bold text-stone-900'>Your stories</h1><p className='mt-2 text-sm text-stone-500'>Everything published under {user?.name || 'your'} byline.</p></div><Link to='/admin/addBlog' className='rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white'>New story</Link></div>
    <div className='mt-8 overflow-hidden rounded-xl border border-stone-200 bg-white'>{loading ? <p className='p-8 text-stone-500'>Loading your writing…</p> : blogs.length ? blogs.map(blog => <div key={blog._id} className='flex items-center gap-4 border-b border-stone-100 p-4 last:border-0'><img src={blog.image} alt='' className='h-14 w-18 rounded-md object-cover'/><div className='min-w-0 flex-1'><p className='font-semibold text-stone-900'>{blog.title}</p><p className='mt-1 text-xs text-stone-500'>{blog.category} · {blog.isPublished ? 'Published' : 'Draft'}</p></div><Link to={`/blog/${blog._id}`} className='text-sm font-semibold text-primary'>View</Link></div>) : <div className='p-10 text-center'><p className='text-stone-600'>Your first story is waiting.</p><Link to='/admin/addBlog' className='mt-4 inline-block text-sm font-semibold text-primary'>Start writing →</Link></div>}</div>
  </main>
}
export default MyStories
