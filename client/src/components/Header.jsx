import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Header = () => {

  const {setInput, input} = useAppContext()
  const inputRef = useRef()

  const onSubmitHandler = async (e)=>{
     e.preventDefault();
     setInput(inputRef.current.value)
  }

  const onClear = ()=>{
    setInput('')
    inputRef.current.value = ''
  }

  return (
    <div className='relative overflow-hidden bg-gradient-to-b from-white to-gray-50'>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative'>
        <div className='text-center pt-16 pb-12'>

          {/* Badge */}
          <div className='inline-flex items-center gap-3 px-4 py-2 mb-6 border border-blue-200 bg-blue-50 rounded-full text-sm text-blue-700 font-medium'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
            </span>
            <p>AI-Powered Blogging Platform</p>
          </div>

          {/* Main Heading */}
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight'>
            <span className='text-gray-900'>Your own</span>
            {' '}
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>blogging</span>
            {' '}
            <span className='text-gray-900'>platform</span>
          </h1>

          {/* Subheading */}
          <p className='text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8'>
            Your space to think out loud, share what matters, and write without filters.
          </p>

          {/* Search Bar */}
          <div className='max-w-2xl mx-auto mb-3'>
            <form onSubmit={onSubmitHandler} className='relative group'>
              <div className='relative flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300'>
                <div className='pl-5 text-gray-400'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
                <input 
                  ref={inputRef} 
                  type="text" 
                  placeholder='Search articles, topics, or categories...' 
                  required 
                  className='w-full py-3 px-3 outline-none bg-transparent text-gray-900 placeholder-gray-400'
                />
                <button 
                  type="submit" 
                  className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 m-1 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200'
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Clear Button */}
          {input && (
            <button 
              onClick={onClear} 
              className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
              Clear search
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default Header