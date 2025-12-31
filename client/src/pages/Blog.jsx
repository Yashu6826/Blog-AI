import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import Moment from 'moment'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

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
      if (data.success) {
        setRelatedPosts(data.posts.slice(0, 3))
      }
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

  const addComment = async (e) => {
    e.preventDefault()
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

  const sharePost = (platform) => {
    const url = window.location.href
    const title = data?.title || 'Check out this blog post!'
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        break
    }
    
    window.open(shareUrl, '_blank')
  }

  useEffect(() => {
    fetchBlogData()
    fetchComments()
  }, [id])

  return isLoading ? <Loader /> : data ? (
    <div className="relative min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Image */}
      <div className="relative w-full h-[70vh] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16">
          <div className="inline-flex items-center gap-2 text-white/90 mb-4">
            <span className="text-sm font-medium tracking-wide uppercase">{data.category || 'Article'}</span>
            <span className="text-white/60">•</span>
            <span className="text-sm">{Moment(data.createdAt).format('MMM DD, YYYY')}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {data.title}
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            {data.subTitle}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                YG
              </div>
              <div>
                <p className="text-white font-medium">Yashraj Gupta</p>
                <p className="text-white/70 text-sm">Content Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div 
          className="prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">Share this article</p>
            <div className="flex gap-3">
              <button 
                onClick={() => sharePost('twitter')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => sharePost('facebook')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => sharePost('linkedin')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>
          
          {/* Add Comment Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a comment</h3>
            <form onSubmit={addComment} className="space-y-4">
              <div>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <textarea
                  onChange={(e) => setContent(e.target.value)}
                  value={content}
                  placeholder="Write your comment..."
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCommentLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCommentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {isCommentLoading && comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((item, index) => (
                <div 
                  key={index} 
                  className="flex gap-4 pb-8 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        {Moment(item.createdAt).fromNow()}
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <a 
                  key={post._id} 
                  href={`/blog/${post._id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative overflow-hidden aspect-video">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {post.subTitle}
                      </p>
                      <span className="text-blue-600 font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        Read more
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .prose {
          color: #374151;
          line-height: 1.75;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #111827;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 1em;
          line-height: 1.3;
        }
        
        .prose h2 {
          font-size: 1.875rem;
        }
        
        .prose h3 {
          font-size: 1.5rem;
        }
        
        .prose p {
          margin-bottom: 1.5em;
        }
        
        .prose a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        
        .prose a:hover {
          color: #1d4ed8;
        }
        
        .prose ul, .prose ol {
          margin-top: 1.5em;
          margin-bottom: 1.5em;
          padding-left: 1.5em;
        }
        
        .prose li {
          margin-bottom: 0.5em;
        }
        
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5em;
          margin: 2em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose img {
          border-radius: 0.5rem;
          margin: 2em 0;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.25em 0.5em;
          border-radius: 0.375rem;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
        }
        
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.5em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2em 0;
        }
        
        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-xl">Blog post not found</p>
      </div>
    </div>
  )
}

export default Blog