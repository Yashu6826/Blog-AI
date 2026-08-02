import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import AboutMe from './AboutMe'

const staticPosts = [
  {
    title: 'Cutting p99 latency by 62% without adding a single server',
    excerpt: 'A three-week hunt through slow endpoints, noisy logs and a badly tuned connection pool. What actually moved the needle, what did not, and the numbers at each step.',
    category: 'Systems',
    level: 'Deep dive',
    date: 'Jul 21, 2026',
    readTime: '14 min read',
    reads: '24.1k reads',
    bullets: ['p99 is a queueing problem before it is a code problem', 'Connection pool sizing beat every micro-optimisation we tried'],
    tags: ['#performance', '#go', '#postgres', '#profiling'],
  },
  {
    title: "You probably don't need a state manager (and how to tell)",
    excerpt: 'A decision framework for React state built from five production codebases. Server cache, URL state, form state and truly-global state are four different problems.',
    category: 'Frontend',
    level: 'Intermediate',
    date: 'Jul 4, 2026',
    readTime: '9 min read',
    reads: '18.7k reads',
    bullets: ["Most 'global state' is really server cache with extra steps", 'The URL is a free, shareable, back-button-aware state store'],
    tags: ['#react', '#typescript', '#architecture'],
  },
  {
    title: 'Indexes I stopped adding after Postgres humbled me',
    excerpt: 'How table shape, selectivity, write load and query plans changed the way I think about database performance.',
    category: 'Infra',
    level: 'Notes',
    date: 'Jun 12, 2026',
    readTime: '11 min read',
    reads: '31.4k reads',
    bullets: ['Composite indexes are product decisions in disguise', 'BRIN costs almost nothing on append-only time series'],
    tags: ['#postgres', '#databases', '#performance'],
  },
  {
    title: 'What shipping LLM features taught me about product engineering',
    excerpt: 'Evals before prompts, streaming as a UX primitive, cost as a first-class metric, and why the hardest part of an AI feature is the part with no model in it.',
    category: 'AI',
    level: 'Intermediate',
    date: 'May 30, 2026',
    readTime: '10 min read',
    reads: '27.9k reads',
    bullets: ['Write the eval set before the prompt, always', 'Stream tokens - perceived latency is the whole experience'],
    tags: ['#ai', '#llm', '#product', '#evals'],
  },
  {
    title: 'eBPF for application engineers: seeing what your process really does',
    excerpt: 'You do not need to be a kernel developer to use eBPF. Three practical recipes for tracing syscalls, measuring disk latency, and catching surprise network calls.',
    category: 'Systems',
    level: 'Deep dive',
    date: 'May 9, 2026',
    readTime: '13 min read',
    reads: '15.2k reads',
    bullets: ['bpftrace one-liners answer questions dashboards cannot', 'Syscall tracing finds hidden I/O in third-party libraries'],
    tags: ['#ebpf', '#linux', '#observability'],
  },
  {
    title: 'The career value of writing boring internal docs',
    excerpt: 'Design docs, incident notes and migration plans are leverage. Here is how to write documents that make teams calmer and systems better.',
    category: 'Career',
    level: 'Practical',
    date: 'Apr 18, 2026',
    readTime: '8 min read',
    reads: '12.6k reads',
    bullets: ['A good doc moves future meetings into the present', 'Write for the next tired engineer on call'],
    tags: ['#engineering', '#culture', '#process'],
  },
]

const fallbackCategories = ['all', 'Systems', 'Frontend', 'AI', 'Infra', 'Career']

const BlogList = () => {
  const [sort, setSort] = useState('recent')
  const [category, setCategory] = useState('all')
  const { blogs, input, setInput } = useAppContext()
  const navigate = useNavigate()

  const posts = useMemo(() => {
    if (!blogs.length) {
      return staticPosts.map((post, index) => ({
        ...post,
        sourceId: blogs[index]?._id,
      }))
    }

    return blogs.map((blog) => ({
      title: blog.title,
      excerpt: blog.excerpt || blog.subTitle || 'A fresh entry from the QuickBlog log.',
      category: blog.category || 'General',
      level: blog.level || (blog.readTime > 10 ? 'Deep dive' : 'Notes'),
      date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft',
      readTime: blog.readTimeLabel || `${blog.readTime || 1} min read`,
      reads: blog.readsLabel || `${blog.reads || 0} reads`,
      bullets: blog.highlights?.length ? blog.highlights : ['Open the full log for the implementation details', 'Filed under the current build note'],
      tags: blog.tags?.length ? blog.tags : [`#${(blog.category || 'general').toLowerCase().replace(/\s+/g, '-')}`],
      sourceId: blog._id,
    }))
  }, [blogs])

  const filteredPosts = posts.filter((post) => {
    const query = input.trim().toLowerCase()
    const matchesSearch = !query || [post.title, post.excerpt, post.category, post.level, ...post.tags].join(' ').toLowerCase().includes(query)
    const matchesCategory = category === 'all' || post.category === category
    return matchesSearch && matchesCategory
  })

  const visiblePosts = [...filteredPosts].sort((a, b) => {
    if (sort === 'longest') return parseInt(b.readTime) - parseInt(a.readTime)
    if (sort === 'popular') return parseFloat(b.reads) - parseFloat(a.reads)
    return 0
  })

  const categories = ['all', ...Array.from(new Set(posts.map((post) => post.category))).filter(Boolean)]

  const categoryCounts = (categories.length > 1 ? categories : fallbackCategories).map((item) => ({
    name: item,
    count: item === 'all' ? posts.length : posts.filter((post) => post.category === item).length,
  }))

  const openPost = (post) => {
    if (post.sourceId) navigate(`/blog/${post.sourceId}`)
  }

  const getCardSpan = (post, index, featured) => {
    if (featured) return 'lg:col-span-2'
    const titleLength = post.title.length
    const readMinutes = parseInt(post.readTime) || 1
    if (index <= 3) return ''
    if (post.level === 'Deep dive' || readMinutes >= 4 || titleLength > 76 || (index + titleLength) % 7 === 0) return 'lg:col-span-2'
    return ''
  }

  const PostCard = ({ post, index, featured = false, className = '' }) => (
    <article className={`spark-card group relative flex min-w-0 overflow-hidden border-[var(--border-main)] bg-[var(--bg-panel)] p-5 transition hover:bg-[var(--bg-elevated)] sm:p-6 ${featured ? 'min-h-[520px] lg:p-8' : 'min-h-[360px]'} ${getCardSpan(post, index, featured)} ${className}`}>
      <button onClick={() => openPost(post)} disabled={!post.sourceId} className='flex h-full min-w-0 flex-col text-left'>
        <div className='flex items-start justify-between gap-4 font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]'>
          <span className='text-[var(--accent)]'>{String(index + 1).padStart(2, '0')}</span>
          <span>{post.category}</span>
        </div>

        <div className={`min-w-0 ${featured ? 'mt-16 lg:mt-24' : 'mt-12'}`}>
          <div className='flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--text-faint)]'>
            <span>{post.date}</span>
            <span>*</span>
            <span>{post.readTime}</span>
            <span>*</span>
            <span>{post.reads}</span>
          </div>
          <h2 className={`mt-4 overflow-wrap-anywhere font-bold leading-tight tracking-tight text-[var(--text-strong)] transition group-hover:text-[var(--accent)] ${featured ? 'text-3xl sm:text-5xl lg:text-6xl' : 'text-2xl'}`}>
            {post.title}
          </h2>
          <p className={`mt-5 leading-7 text-[var(--text-muted)] ${featured || getCardSpan(post, index, featured).includes('col-span-2') ? 'text-base sm:text-lg' : 'line-clamp-4 text-base'}`}>
            {post.excerpt}
          </p>
        </div>

        <div className='mt-auto pt-8'>
          {featured && (
            <ul className='mb-7 grid gap-3 text-base text-[var(--text-main)] sm:grid-cols-2'>
              {post.bullets.map((bullet) => (
                <li key={bullet} className='flex gap-3'>
                  <span className='mt-2 text-[var(--accent)]'>*</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex flex-wrap gap-2'>
              {post.tags.slice(0, featured ? 4 : 2).map((tag) => (
                <span key={tag} className='rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-xs text-[var(--text-dim)]'>{tag}</span>
              ))}
            </div>
            <span className='font-mono text-sm text-[var(--text-link)] transition group-hover:text-[var(--accent)]'>open -&gt;</span>
          </div>
        </div>
      </button>
    </article>
  )

  const lead = visiblePosts[0]
  const remainingPosts = visiblePosts.slice(1)

  return (
    <section id='feed' className='w-full overflow-x-clip bg-[var(--bg-page)] px-4 py-16 text-[var(--text-main)] sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-screen-2xl'>
        <div className='flex min-w-0 flex-col gap-6 border-b border-[var(--border-main)] pb-7 xl:flex-row xl:items-end xl:justify-between'>
          <div className='min-w-0'>
            <p className='font-mono text-sm uppercase tracking-[0.38em] text-[var(--text-dim)]'>// all logs * {visiblePosts.length} hits</p>
            <div className='mt-4 flex flex-wrap gap-2 font-mono text-sm'>
              {categoryCounts.map((item) => (
                <button key={item.name} onClick={() => setCategory(item.name)} className={`rounded-md px-3 py-2 transition ${category === item.name ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>
                  {item.name} <span className='opacity-60'>{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto xl:justify-end'>
            <input value={input} onChange={(event) => setInput(event.target.value)} className='h-11 min-w-0 flex-1 rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-4 font-mono text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-border)] sm:basis-72 xl:max-w-sm' placeholder='grep logs...' />
            <div className='flex flex-wrap gap-2 font-mono text-sm'>
              {['recent', 'popular', 'longest'].map((item) => (
                <button key={item} onClick={() => setSort(item)} className={`rounded-md px-3 py-2 ${sort === item ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {lead ? (
          <div id='archive' className='spark-board mt-10 grid w-full grid-cols-1 overflow-hidden rounded-lg border border-white/12 md:grid-cols-2 lg:grid-cols-4'>
            <PostCard post={lead} index={0} featured className='border-b md:border-r' />
            {remainingPosts.map((post, index) => (
              <React.Fragment key={post.title}>
                <PostCard post={post} index={index + 1} className='border-b md:border-r' />
                {index === 3 && <AboutMe />}
              </React.Fragment>
            ))}
            {remainingPosts.length <= 3 && <AboutMe />}
          </div>
        ) : (
          <p className='py-16 text-center font-mono text-[var(--text-dim)]'>No logs matched that query.</p>
        )}
      </div>
    </section>
  )
}

export default BlogList
