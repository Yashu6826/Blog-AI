import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowUpRight, EyeOff, FileText, Plus, Rocket, Trash2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const filters = [
  { id: 'all', label: 'all logs' },
  { id: 'draft', label: 'drafts' },
  { id: 'published', label: 'published' },
]

const StorySkeleton = () => (
  <div className='animate-pulse rounded-lg border border-[var(--border-main)] bg-[var(--bg-panel)] p-4'>
    <div className='flex items-start justify-between gap-4'>
      <div className='space-y-3'>
        <div className='h-4 w-20 rounded bg-[var(--bg-soft)]' />
        <div className='h-7 w-64 rounded bg-[var(--bg-soft)]' />
        <div className='h-4 w-48 rounded bg-[var(--bg-soft)]' />
      </div>
      <div className='h-8 w-24 rounded bg-[var(--bg-soft)]' />
    </div>
    <div className='mt-5 flex gap-2'>
      <div className='h-9 w-28 rounded bg-[var(--bg-soft)]' />
      <div className='h-9 w-28 rounded bg-[var(--bg-soft)]' />
      <div className='h-9 w-28 rounded bg-[var(--bg-soft)]' />
    </div>
  </div>
)

const MyStories = () => {
  const { axios, user, fetchBlogs, navigate } = useAppContext()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [busyId, setBusyId] = useState('')

  const loadMine = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/mine`)
      if (data.success) setBlogs(data.blogs || [])
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not load your stories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMine()
  }, [])

  const counts = useMemo(() => ({
    all: blogs.length,
    draft: blogs.filter((blog) => !blog.isPublished).length,
    published: blogs.filter((blog) => blog.isPublished).length,
  }), [blogs])

  const visibleBlogs = useMemo(() => {
    if (activeFilter === 'draft') return blogs.filter((blog) => !blog.isPublished)
    if (activeFilter === 'published') return blogs.filter((blog) => blog.isPublished)
    return blogs
  }, [activeFilter, blogs])

  const togglePublish = async (blog) => {
    setBusyId(blog._id)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/toggle-publish`, { id: blog._id })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message)
      await Promise.all([loadMine(), fetchBlogs()])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not change publish state.')
    } finally {
      setBusyId('')
    }
  }

  const deleteBlog = async (blog) => {
    const confirmed = window.confirm(`Delete "${blog.title}"?`)
    if (!confirmed) return
    setBusyId(blog._id)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/delete`, { id: blog._id })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message)
      await Promise.all([loadMine(), fetchBlogs()])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not delete that story.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <main className='flex-1 overflow-auto bg-[var(--bg-page)] text-[var(--text-main)]'>
      <div className='mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 border-b border-[var(--border-main)] pb-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='font-mono text-xs uppercase tracking-[0.38em] text-[var(--text-dim)]'>// author workspace</p>
            <h1 className='mt-3 text-3xl font-bold tracking-tight text-[var(--text-strong)] sm:text-4xl'>Saved drafts and live logs</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]'>
              Manage everything under {user?.email || 'your byline'}: open drafts, push them live, move published posts back to drafts, or delete anything you no longer want to keep around.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs text-[var(--text-dim)]'>
              {counts.draft} drafts * {counts.published} live
            </div>
            <Link to='/admin/addBlog' className='inline-flex items-center gap-2 rounded-md border border-[var(--accent-border)] px-4 py-2 font-mono text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft)]'>
              <Plus className='h-4 w-4' />
              <span>new log</span>
            </Link>
          </div>
        </div>

        <div className='mt-5 flex flex-wrap gap-2 font-mono text-sm'>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type='button'
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-md px-3 py-2 transition ${activeFilter === filter.id ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}
            >
              {filter.label} <span className='opacity-60'>{counts[filter.id]}</span>
            </button>
          ))}
        </div>

        <div className='mt-6 space-y-4'>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <StorySkeleton key={index} />)
          ) : visibleBlogs.length ? (
            visibleBlogs.map((blog, index) => {
              const isBusy = busyId === blog._id
              return (
                <article key={blog._id} className='rounded-lg border border-[var(--border-main)] bg-[var(--bg-panel)] p-4 sm:p-5'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]'>
                        <span className='text-[var(--accent)]'>{String(index + 1).padStart(2, '0')}</span>
                        <span>{blog.category || 'General'}</span>
                        <span>*</span>
                        <span>{blog.readTimeLabel || `${blog.readTime || 0} min read`}</span>
                        <span>*</span>
                        <span>{blog.isPublished ? 'live' : 'draft'}</span>
                      </div>
                      <h2 className='mt-3 text-xl font-bold leading-tight text-[var(--text-strong)] sm:text-2xl'>{blog.title}</h2>
                      <p className='mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]'>{blog.excerpt || blog.subTitle || 'No summary yet.'}</p>
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {(blog.tags || []).slice(0, 5).map((tag) => (
                          <span key={tag} className='rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-xs text-[var(--text-dim)]'>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className='rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs text-[var(--text-dim)]'>
                      {blog.isPublished ? 'published' : 'saved locally as draft'}
                    </div>
                  </div>

                  <div className='mt-5 flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={() => navigate(`/blog/${blog._id}`)}
                      className='inline-flex items-center gap-2 rounded-md border border-[var(--border-main)] px-3 py-2 font-mono text-xs text-[var(--text-link)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]'
                    >
                      <ArrowUpRight className='h-4 w-4' />
                      <span>open log</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => togglePublish(blog)}
                      disabled={isBusy}
                      className='inline-flex items-center gap-2 rounded-md border border-[var(--accent-border)] px-3 py-2 font-mono text-xs text-[var(--accent)] transition hover:bg-[var(--bg-soft)] disabled:opacity-60'
                    >
                      {blog.isPublished ? <EyeOff className='h-4 w-4' /> : <Rocket className='h-4 w-4' />}
                      <span>{isBusy ? 'syncing...' : blog.isPublished ? 'move to draft' : 'publish now'}</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => deleteBlog(blog)}
                      disabled={isBusy}
                      className='inline-flex items-center gap-2 rounded-md border border-[var(--border-main)] px-3 py-2 font-mono text-xs text-[var(--text-link)] transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-60'
                    >
                      <Trash2 className='h-4 w-4' />
                      <span>delete</span>
                    </button>
                  </div>
                </article>
              )
            })
          ) : (
            <div className='rounded-lg border border-[var(--border-main)] bg-[var(--bg-panel)] px-6 py-12 text-center'>
              <FileText className='mx-auto h-10 w-10 text-[var(--text-placeholder)]' />
              <h2 className='mt-4 text-xl font-bold text-[var(--text-strong)]'>No stories in this lane yet</h2>
              <p className='mt-2 text-sm text-[var(--text-muted)]'>Start a fresh draft or switch filters to check the rest of your writing queue.</p>
              <Link to='/admin/addBlog' className='mt-5 inline-flex items-center gap-2 rounded-md border border-[var(--accent-border)] px-4 py-2 font-mono text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft)]'>
                <Plus className='h-4 w-4' />
                <span>write new log</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default MyStories
