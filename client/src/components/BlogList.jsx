import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { blogCategories } from '../assets/assets'

const BlogCard = ({ blog, index }) => {
  const { title, description, category, image, _id } = blog
  const navigate = useNavigate()
  const isFeatured = index === 0 || index === 2
  
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/blog/${_id}`)}
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden ${isFeatured ? 'h-80 md:h-full' : 'h-56'}`}>
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full shadow-lg uppercase tracking-wider">
            {category}
          </span>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300 ${
            isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}>
            {title}
          </h3>
          
          {isFeatured && description && (
            <div 
              className="text-sm text-gray-200 line-clamp-2 mb-3"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.article>
  )
}

const BlogList = () => {
  const [menu, setMenu] = useState("All")
  const { blogs, input } = useAppContext()

  const filteredBlogs = () => {
    if (!blogs || blogs.length === 0) {
      return []
    }

    let filtered = blogs
    
    // Filter by search input
    if (input && input.trim() !== '') {
      filtered = filtered.filter((blog) => 
        blog.title.toLowerCase().includes(input.toLowerCase()) || 
        blog.category.toLowerCase().includes(input.toLowerCase()) ||
        (blog.description && blog.description.toLowerCase().includes(input.toLowerCase()))
      )
    }
    
    // Filter by category
    if (menu !== "All") {
      filtered = filtered.filter((blog) => blog.category === menu)
    }
    
    return filtered
  }

  const displayBlogs = filteredBlogs()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30'>
      {/* Header Section */}
      <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8'>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-12'
        >
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4'>
            Discover Stories
          </h1>
          <p className='text-gray-600 text-base sm:text-lg max-w-2xl mx-auto'>
            Explore our curated collection of articles across various topics
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='flex flex-wrap justify-center gap-2 sm:gap-3 mb-8'
        >
          {blogCategories && blogCategories.map((item) => (
            <button 
              key={item}
              onClick={() => setMenu(item)}
              className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm overflow-hidden ${
                menu === item 
                  ? 'text-white shadow-lg scale-105' 
                  : 'text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md hover:scale-105'
              }`}
            >
              {menu === item && (
                <motion.div 
                  layoutId='category-bg' 
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
                />
              )}
              <span className='relative z-10'>{item}</span>
            </button>
          ))}
        </motion.div>

        {/* Search Results Info */}
        {input && input.trim() !== '' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center mb-6'
          >
            <p className='text-sm text-gray-600'>
              Found <span className='font-bold text-gray-900 text-lg'>{displayBlogs.length}</span> {displayBlogs.length === 1 ? 'result' : 'results'} for 
              <span className='font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text'> "{input}"</span>
              {menu !== "All" && <span> in <span className='font-semibold text-gray-900'>{menu}</span></span>}
            </p>
          </motion.div>
        )}
      </div>

      {/* Blog Grid */}
      <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16'>
        <AnimatePresence mode="wait">
          {displayBlogs && displayBlogs.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'
          >
            {displayBlogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='text-center py-20'
            >
              <div className='w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center'>
                <svg className='w-10 sm:w-12 h-10 sm:h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>No articles found</h3>
              <p className='text-gray-600 mb-6 text-sm sm:text-base'>Try adjusting your search or filter to find what you're looking for.</p>
              <button 
                onClick={() => setMenu("All")}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base'
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BlogList
