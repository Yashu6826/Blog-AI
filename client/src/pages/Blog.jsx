import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Moment from 'moment'
import toast from 'react-hot-toast'
import { ArrowLeft, CalendarDays, Clock3, Link2, MessageSquareText, UserRound } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'

const estimateReadTime = (html = '') => {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(3, Math.ceil(words / 180))} min read`
}

const Blog = () => {
  const { id } = useParams()
  const { axios } = useAppContext()
  const [data, setData] = useState(null)
  const [comments, setComments] = useState([])
  const [relatedPosts, setRelatedPosts] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)

  const fetchBlogData = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/${id}`)
      if (data.success) {
        setData(data.blog)
        fetchRelatedPosts(data.blog.category)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to load blog post')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedPosts = async (category) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/related?category=${category}&exclude=${id}`)
      if (data.success) setRelatedPosts(data.posts.slice(0, 3))
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setIsCommentLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/comments`, { blogId: id })
      if (data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setIsCommentLoading(false)
    }
  }

  const addComment = async (event) => {
    event.preventDefault()
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return
    }
    if (content.trim().length < 10) {
      toast.error('Comment must be at least 10 characters long')
      return
    }
    try {
      setIsCommentLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/add-comment`, { blog: id, name, content })
      if (data.success) {
        toast.success('Comment added successfully')
        setName('')
        setContent('')
        fetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsCommentLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogData()
    fetchComments()
  }, [id])

  if (isLoading) return <Loader />

  if (!data) {
    return (
      <div className='min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]'>
        <Navbar />
        <div className='mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center'>
          <p className='font-mono text-sm uppercase tracking-[0.38em] text-[var(--accent)]'>404</p>
          <h1 className='mt-4 text-4xl font-bold text-[var(--text-strong)]'>Log not found</h1>
          <Link to='/' className='mt-7 inline-flex items-center gap-2 font-mono text-sm text-[var(--text-link)] hover:text-[var(--accent)]'><ArrowLeft className='h-4 w-4' />back to index</Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]'>
      <Navbar />

      <article className='mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20'>
        <Link to='/' className='inline-flex items-center gap-2 font-mono text-sm text-[var(--text-link)] hover:text-[var(--accent)]'><ArrowLeft className='h-4 w-4' />index</Link>

        <header className='mt-10 border-b border-[var(--border-main)] pb-10'>
          <div className='flex flex-wrap items-center gap-3 font-mono text-sm text-[var(--text-dim)]'>
            <span>{data.category || 'Article'}</span>
            <span className='text-white/15'>*</span>
            <span className='inline-flex items-center gap-1.5'><CalendarDays className='h-4 w-4' />{Moment(data.createdAt).format('MMM DD, YYYY')}</span>
            <span className='text-white/15'>*</span>
            <span className='inline-flex items-center gap-1.5'><Clock3 className='h-4 w-4' />{estimateReadTime(data.description)}</span>
          </div>
          <h1 className='mt-6 text-4xl font-bold leading-tight tracking-tight text-[var(--text-strong)] sm:text-6xl'>{data.title}</h1>
          {data.subTitle && <p className='mt-6 text-xl leading-8 text-[var(--text-muted)]'>{data.subTitle}</p>}
          <div className='mt-8 flex items-center gap-3 font-mono text-sm text-[var(--text-dim)]'>
            <span className='flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] font-bold text-[var(--accent)]'><UserRound className='h-5 w-5' /></span>
            <div>
              <p className='font-sans font-semibold text-[var(--text-strong)]'>{data.author?.name || 'QuickBlog Team'}</p>
              <p>author ref * {data.category}</p>
            </div>
          </div>
        </header>

        <div className='rich-text rich-text-dark mt-12' dangerouslySetInnerHTML={{ __html: data.description }} />
      </article>

      <section className='border-y border-[var(--border-soft)] bg-[var(--bg-panel)] px-5 py-14 sm:px-8'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='flex items-center gap-2 font-mono text-sm uppercase tracking-[0.38em] text-[var(--text-dim)]'><MessageSquareText className='h-4 w-4 text-[var(--accent)]' />// feedback queue {comments.length > 0 && `(${comments.length})`}</h2>

          <form onSubmit={addComment} className='mt-7 space-y-4 rounded-lg border border-[var(--border-main)] bg-[var(--bg-elevated)] p-5'>
            <input onChange={(event) => setName(event.target.value)} value={name} type='text' placeholder='your name' required className='h-11 w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-page)] px-4 text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)]' />
            <textarea onChange={(event) => setContent(event.target.value)} value={content} placeholder='drop a note...' required rows='4' className='w-full resize-none rounded-md border border-[var(--border-main)] bg-[var(--bg-page)] px-4 py-3 text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)]' />
            <button type='submit' disabled={isCommentLoading} className='rounded-md border border-[var(--accent-border)] px-5 py-2.5 font-mono text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft)] disabled:opacity-60'>
              {isCommentLoading ? 'pushing...' : 'push note'}
            </button>
          </form>

          <div className='mt-9 space-y-6'>
            {comments.map((item) => (
              <div key={item._id || item.createdAt} className='border-b border-[var(--border-soft)] pb-6 last:border-b-0'>
                <div className='flex items-baseline gap-3'>
                  <p className='font-semibold text-[var(--text-strong)]'>{item.name}</p>
                  <p className='font-mono text-xs text-[var(--text-faint)]'>{Moment(item.createdAt).fromNow()}</p>
                </div>
                <p className='mt-2 leading-7 text-[var(--text-muted)]'>{item.content}</p>
              </div>
            ))}
            {!comments.length && !isCommentLoading && <p className='font-mono text-sm text-[var(--text-dim)]'>Feedback queue is empty.</p>}
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className='px-5 py-14 sm:px-8'>
          <div className='mx-auto max-w-4xl'>
            <h2 className='flex items-center gap-2 font-mono text-sm uppercase tracking-[0.38em] text-[var(--text-dim)]'><Link2 className='h-4 w-4 text-[var(--accent)]' />// linked logs</h2>
            <div className='mt-6 divide-y divide-[var(--border-soft)] border-y border-[var(--border-soft)]'>
              {relatedPosts.map((post) => (
                <Link key={post._id} to={`/blog/${post._id}`} className='block py-5 transition hover:bg-[var(--bg-elevated)]'>
                  <p className='font-mono text-xs text-[var(--accent)]'>{post.category || 'Article'}</p>
                  <h3 className='mt-2 text-xl font-bold text-[var(--text-strong)]'>{post.title}</h3>
                  {post.subTitle && <p className='mt-2 text-sm leading-6 text-[var(--text-muted)]'>{post.subTitle}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default Blog
