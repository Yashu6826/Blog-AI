import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { parse } from 'marked'
import toast from 'react-hot-toast'
import { Bot, CheckCheck, ChevronLeft, FileInput, FolderTree, PencilLine, Sparkles, Tags, Type, WandSparkles } from 'lucide-react'
import { blogCategories } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const AddBlog = () => {
  const { axios, navigate } = useAppContext()
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const descriptionRef = useRef(null)
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Systems')
  const [published, setPublished] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [descriptionLoading, setDescriptionLoading] = useState('')
  const [aiDescription, setAiDescription] = useState('')
  const [aiDescriptionTitle, setAiDescriptionTitle] = useState('')
  const [ideas, setIdeas] = useState([])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [words, setWords] = useState(0)

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start with the thing you learned, the bug you chased, or the idea you cannot stop thinking about...',
      })
      quill.on('text-change', () => {
        setWords(quill.getText().trim().split(/\s+/).filter(Boolean).length)
      })
      quillRef.current = quill
    }
  }, [])

  const generateContent = async () => {
    if (!title.trim()) return toast.error('Add a title first so AI has a direction.')
    setGenerating(true)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/generate`, { prompt: `${title}. ${subTitle}` })
      if (!data.success) return toast.error(data.message)
      quillRef.current.root.innerHTML = parse(data.content)
      setWords(quillRef.current.getText().trim().split(/\s+/).filter(Boolean).length)
      toast.success('A first draft is ready to edit.')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not generate a draft.')
    } finally {
      setGenerating(false)
    }
  }

  const getIdeas = async () => {
    setIdeasLoading(true)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/give-topics`)
      if (data.success) setIdeas(data.topics || [])
      else toast.error(data.message)
    } catch {
      toast.error('Could not get story ideas.')
    } finally {
      setIdeasLoading(false)
    }
  }

  const useIdea = (idea) => {
    setTitle(idea.title)
    setCategory(idea.category || category)
    setAiDescription('')
    setAiDescriptionTitle('')
    toast.success('Title added to your draft.')
  }

  const applyDescription = (description, descriptionTitle = title) => {
    setTitle(descriptionTitle)
    setSubTitle(description)
    setAiDescription(description)
    setAiDescriptionTitle(descriptionTitle)
  }

  const wrapDescriptionSelection = (marker) => {
    const input = descriptionRef.current
    if (!input) return
    const start = input.selectionStart
    const end = input.selectionEnd
    const selected = subTitle.slice(start, end)
    const fallback = marker === '**' ? 'bold text' : 'italic text'
    const replacement = `${marker}${selected || fallback}${marker}`
    const nextValue = `${subTitle.slice(0, start)}${replacement}${subTitle.slice(end)}`
    setSubTitle(nextValue)
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + marker.length, start + marker.length + (selected || fallback).length)
    })
  }

  const suggestDescription = async (ideaTitle = title) => {
    const nextTitle = (ideaTitle || title).trim()
    if (!nextTitle) return toast.error('Choose or write a title first.')
    setDescriptionLoading(nextTitle)
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/suggest-description`, { title: nextTitle })
      if (!data.success) return toast.error(data.message)
      applyDescription(data.description, data.title || nextTitle)
      toast.success('Description added.')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not suggest a description.')
    } finally {
      setDescriptionLoading('')
    }
  }

  const addTag = (event) => {
    if ((event.key === 'Enter' || event.key === ',') && tagInput.trim()) {
      event.preventDefault()
      const nextTag = tagInput.trim().replace(/^#?/, '#')
      if (tags.length < 5 && !tags.includes(nextTag)) setTags([...tags, nextTag])
      setTagInput('')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !quillRef.current?.getText().trim()) return toast.error('A title and story are required.')
    setIsAdding(true)
    try {
      const payload = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        contentHtml: quillRef.current.root.innerHTML,
        category,
        tags,
        level: words > 1600 ? 'Deep dive' : words > 700 ? 'Intermediate' : 'Notes',
        highlights: [],
        isPublished: published,
      }
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/add`, payload)
      if (!data.success) return toast.error(data.message)
      toast.success(published ? 'Your story is live.' : 'Draft saved.')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not save your story.')
    } finally {
      setIsAdding(false)
    }
  }

  const readTime = words ? Math.max(1, Math.ceil(words / 200)) : 0
  const completion = [
    Boolean(title.trim()),
    Boolean(subTitle.trim()),
    words >= 50,
    Boolean(category),
  ].filter(Boolean).length

  return (
    <form onSubmit={submit} className='flex-1 overflow-auto bg-[var(--bg-page)] text-[var(--text-main)]'>
      <div className='mx-auto max-w-screen-2xl px-3 py-4 sm:px-5 lg:px-6'>
        <div className='mb-4 flex flex-col gap-3 border-b border-[var(--border-main)] pb-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <button type='button' onClick={() => navigate('/')} className='flex items-center gap-2 font-mono text-sm text-[var(--text-link)] hover:text-[var(--accent)]'><ChevronLeft className='h-4 w-4' />root</button>
            <p className='mt-3 font-mono text-xs uppercase tracking-[0.38em] text-[var(--text-dim)]'>// author console</p>
          </div>
          <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
            <span className='flex items-center gap-2 rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2.5 py-2 font-mono text-xs text-[var(--text-dim)] sm:px-3'><CheckCheck className='h-3.5 w-3.5 text-[var(--accent)]' />{completion}/4 checks green</span>
            <button type='button' onClick={() => setPublished(false)} className={`rounded-md px-3 py-2 font-mono text-xs sm:text-sm ${!published ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>draft</button>
            <button type='button' onClick={() => setPublished(true)} className={`rounded-md px-3 py-2 font-mono text-xs sm:text-sm ${published ? 'bg-[var(--bg-soft)] text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]'}`}>prod</button>
            <button disabled={isAdding} className='flex items-center gap-2 rounded-md border border-[var(--accent-border)] px-4 py-2 font-mono text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft)] disabled:opacity-60 sm:px-5 sm:text-sm'>
              <FileInput className='h-4 w-4' />
              <span>{isAdding ? 'persisting...' : published ? 'deploy log' : 'stash draft'}</span>
            </button>
          </div>
        </div>

        <div className='grid overflow-hidden rounded-lg border border-[var(--border-main)] lg:grid-cols-[minmax(0,1fr)_250px] xl:grid-cols-[360px_minmax(0,1fr)_230px] 2xl:grid-cols-[420px_minmax(0,1fr)_250px]'>
          <aside className='order-3 border-t border-[var(--border-main)] bg-[var(--bg-page)] lg:col-span-2 xl:order-1 xl:col-span-1 xl:border-r xl:border-t-0'>
            <section className='relative overflow-hidden p-4 sm:p-5'>
              <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70' />
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]'>// quickblog ai</p>
                  <h2 className='mt-1 flex items-center gap-2 text-base font-bold tracking-tight text-[var(--text-strong)]'><Bot className='h-4 w-4 text-[var(--accent)]' />Copilot runtime</h2>
                </div>
                <span className='rounded-md border border-[var(--accent-border)] bg-[var(--bg-soft)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--accent)]'>Laguna</span>
              </div>
              <p className='mt-3 text-xs leading-5 text-[var(--text-dim)]'>Generate title candidates, shape a fuller preface, then expand it into a draft.</p>
              <div className='mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-faint)]'>
                <span className='border-r border-[var(--border-soft)] px-2 py-1.5 text-center'>titles</span>
                <span className='border-r border-[var(--border-soft)] px-2 py-1.5 text-center'>description</span>
                <span className='px-2 py-1.5 text-center'>draft</span>
              </div>
              <button type='button' onClick={getIdeas} disabled={ideasLoading} className='mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-[var(--border-main)] py-2 font-mono text-xs text-[var(--text-link)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)] disabled:opacity-60'>
                <Sparkles className='h-4 w-4' />
                <span>{ideasLoading ? 'sampling titles...' : 'sample titles'}</span>
              </button>
              <button type='button' onClick={() => suggestDescription()} disabled={Boolean(descriptionLoading) || !title.trim()} className='mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-[var(--border-main)] py-2 font-mono text-xs text-[var(--text-link)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)] disabled:opacity-40'>
                <PencilLine className='h-4 w-4' />
                <span>{descriptionLoading && descriptionLoading === title.trim() ? 'compiling preface...' : 'compile preface from current title'}</span>
              </button>
              <button type='button' onClick={generateContent} disabled={generating} className='mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-[var(--accent-border)] bg-[var(--bg-soft)] py-2 font-mono text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--bg-soft-strong)] disabled:opacity-60'>
                <WandSparkles className='h-4 w-4' />
                <span>{generating ? 'expanding draft...' : 'expand draft'}</span>
              </button>
              {aiDescription && (
                <div className='mt-4 rounded-md border border-[var(--accent-border)] bg-[var(--bg-soft)] p-3'>
                  <p className='font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--accent)]'>compiled preface</p>
                  <p className='mt-2 text-xs leading-5 text-[var(--text-strong)]'>{aiDescription}</p>
                  <div className='mt-3 flex flex-wrap gap-2 font-mono text-[11px]'>
                    <button type='button' onClick={() => applyDescription(aiDescription, aiDescriptionTitle || title)} className='flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 font-semibold text-[var(--bg-page)]'><FileInput className='h-3.5 w-3.5' />inject</button>
                    <button type='button' onClick={() => setAiDescription('')} className='flex items-center gap-1.5 rounded-md border border-[var(--border-main)] px-3 py-1.5 text-[var(--text-link)] hover:text-[var(--accent)]'><ChevronLeft className='h-3.5 w-3.5 rotate-180' />drop</button>
                  </div>
                </div>
              )}
              {ideas.length > 0 && (
                <div className='mt-5 divide-y divide-[var(--border-soft)] border-y border-[var(--border-soft)]'>
                  {ideas.map((idea, index) => (
                    <div key={`${idea.title}-${index}`} className='py-3'>
                      <button type='button' onClick={() => useIdea(idea)} className='block w-full text-left'>
                        <span className='block text-sm font-semibold leading-5 text-[var(--text-strong)]'>{idea.title}</span>
                        <span className='mt-1 block font-mono text-xs text-[var(--accent)]'>{idea.category}</span>
                      </button>
                      <div className='mt-3 flex gap-2 font-mono text-xs'>
                        <button type='button' onClick={() => useIdea(idea)} className='flex items-center gap-1.5 rounded-md border border-[var(--border-main)] px-2.5 py-1.5 text-[var(--text-link)] hover:border-[var(--accent-border)] hover:text-[var(--accent)]'><Type className='h-3.5 w-3.5' />hydrate title</button>
                        <button type='button' onClick={() => { setTitle(idea.title); setCategory(idea.category || category); suggestDescription(idea.title) }} disabled={Boolean(descriptionLoading)} className='rounded-md border border-[var(--border-main)] px-2.5 py-1.5 text-[var(--text-link)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] disabled:opacity-40'>
                          {descriptionLoading === idea.title ? 'compiling...' : 'preface'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>

          <main className='order-1 min-w-0 bg-[var(--bg-panel)] p-4 sm:p-5 lg:p-6 xl:order-2'>
            <div className='flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-dim)]'>
              <span className='text-[var(--accent)]'>01</span>
              <span>{category}</span>
              <span>*</span>
              <span>{words} words</span>
              <span>*</span>
              <span>{readTime} min read</span>
            </div>

            <textarea value={title} onChange={(event) => setTitle(event.target.value)} rows='2' maxLength='140' placeholder='Write the title like a promise to the reader' className='mt-6 w-full resize-none border-0 bg-transparent text-3xl font-bold leading-tight tracking-tight text-[var(--text-strong)] outline-none placeholder:text-[var(--text-placeholder)] sm:text-4xl xl:text-5xl' />
            <div className='mt-4 overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--bg-page)]'>
              <div className='flex items-center gap-1 border-b border-[var(--border-main)] px-2 py-1.5'>
                <button type='button' onClick={() => wrapDescriptionSelection('**')} title='Bold selected description text' className='h-8 w-8 rounded text-sm font-bold text-[var(--text-link)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--accent)]'>B</button>
                <button type='button' onClick={() => wrapDescriptionSelection('*')} title='Italic selected description text' className='h-8 w-8 rounded font-serif text-sm italic text-[var(--text-link)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--accent)]'>I</button>
                <span className='ml-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-placeholder)]'>preface buffer</span>
              </div>
              <textarea
                ref={descriptionRef}
                value={subTitle}
                onChange={(event) => setSubTitle(event.target.value)}
                rows='8'
                maxLength='1500'
                placeholder='Add a fuller setup: the problem, the angle, and what the reader will learn...'
                className='min-h-[220px] w-full resize-y border-0 bg-transparent px-3 py-3 text-base leading-7 text-[var(--text-muted)] outline-none placeholder:text-[var(--text-placeholder)] sm:text-lg'
              />
            </div>

            <div className='my-5 border-t border-[var(--border-main)]' />
            <div ref={editorRef} className='writer-editor writer-editor-dark min-h-[430px]' />
          </main>

          <aside className='order-2 border-t border-[var(--border-main)] bg-[var(--bg-page)] lg:border-l lg:border-t-0 xl:order-3'>
            <section className='border-b border-[var(--border-main)] p-3'>
              <p className='flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]'><FolderTree className='h-3.5 w-3.5 text-[var(--accent)]' />// metadata</p>
              <label className='mt-3.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]'><FolderTree className='h-3.5 w-3.5' />namespace</label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className='mt-2 h-9 w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2 text-xs font-semibold text-[var(--text-strong)] outline-none focus:border-[var(--accent-border)]'>
                {blogCategories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
              </select>

              <label className='mt-3.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]'><Tags className='h-3.5 w-3.5' />labels</label>
              <div className='mt-2 flex min-h-9 flex-wrap gap-1.5 rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] p-1.5'>
                {tags.map((tag) => (
                  <button key={tag} type='button' onClick={() => setTags(tags.filter((item) => item !== tag))} className='rounded border border-[var(--border-main)] bg-[var(--bg-page)] px-1.5 py-1 font-mono text-[10px] text-[var(--text-dim)]'>{tag} x</button>
                ))}
                <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={addTag} className='min-w-16 flex-1 bg-transparent px-1 py-1 font-mono text-[11px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)]' placeholder='append label' />
              </div>
            </section>

            <section className='p-3'>
              <p className='flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]'><CheckCheck className='h-3.5 w-3.5 text-[var(--accent)]' />// preflight</p>
              <div className='mt-4 space-y-2 font-mono text-xs'>
                {[
                  ['title', Boolean(title.trim())],
                  ['preface', Boolean(subTitle.trim())],
                  ['50 words', words >= 50],
                  ['namespace', Boolean(category)],
                ].map(([label, done]) => (
                  <div key={label} className='flex items-center justify-between rounded-md border border-[var(--border-main)] bg-[var(--bg-elevated)] px-2.5 py-2'>
                    <span className={done ? 'text-[var(--text-main)]' : 'text-[var(--text-faint)]'}>{label}</span>
                    <span className={done ? 'text-[var(--accent)]' : 'text-[var(--text-placeholder)]'}>{done ? 'ok' : '--'}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </form>
  )
}

export default AddBlog
