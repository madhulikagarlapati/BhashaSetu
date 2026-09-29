import { useState, type FormEvent } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, AlertCircle, ArrowRight, BookOpen, Check, CloudOff, Download, Languages, LoaderCircle, Printer, RefreshCw, Save, ShieldCheck, Volume2, X } from 'lucide-react'
import { useResource } from './useApiResource'
import './WorkspacePages.css'

type LessonRecord = {
  id: string
  grade: number
  subject: string
  title: string
  learningOutcome: string
  targetLanguage: string
  durationMinutes: number
  activities: string[]
}

type FlashcardRecord = {
  id: string
  lessonId: string
  category: string
  numeral: string
  hindiText: string
  targetLanguage: string
  translationAvailable: boolean
  audioAvailable: boolean
  offlineAvailable: boolean
}

type WorksheetQuestion = {
  id: string
  type: string
  prompt: string
  targetPrompt: string | null
  answer: string
  illustration: { kind: string; value: string }
  translationAvailable: boolean
}

type WorksheetRecord = {
  id: string
  grade: number
  subject: string
  lessonTitle: string
  learningOutcome: string
  difficulty: string
  questions: WorksheetQuestion[]
  translationNotice: string
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? 'The request could not be completed.')
  }
  return response.json() as Promise<T>
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div></div>
}

function RequestState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <div className="request-state"><LoaderCircle size={19} className="spin" /> Loading from the API...</div>
  if (error) return <div className="request-state request-error" role="alert"><AlertCircle size={18} /><span>{error}</span><button className="text-button" onClick={retry}>Retry</button></div>
  return null
}

export function LessonsPage({ materials = false }: { materials?: boolean }) {
  const { data, loading, error, retry } = useResource<{ lessons: LessonRecord[] }>('/api/lessons')
  const { data: phraseData } = useResource<{ translations: Array<{ verified: boolean }> }>('/api/demo-translations')
  const [selected, setSelected] = useState<LessonRecord | null>(null)
  const savedPack = readSavedOfflinePack()
  const lessons = data?.lessons ?? savedPack?.lessons ?? []
  const usingOfflinePack = !data && savedPack !== null

  return <>
    <PageHeading eyebrow={materials ? 'RESOURCE LIBRARY' : 'CURRICULUM'} title={materials ? 'Learning materials' : 'Lessons'} description={materials ? 'Browse classroom-ready lesson plans and their teaching context.' : 'Grade 2 foundational learning lessons available in Demo Mode.'} />
    {materials && <nav className="material-tabs" aria-label="Learning material types"><NavLink to="/materials">Lessons</NavLink><NavLink to="/worksheets">Worksheets</NavLink><NavLink to="/flashcards">Flashcards</NavLink></nav>}
    <RequestState loading={loading && lessons.length === 0} error={error && !usingOfflinePack ? error : ''} retry={retry} />
    {usingOfflinePack && <div className="inline-error" role="status">Network unavailable. Showing the lessons saved on this device.</div>}
    {(data || usingOfflinePack) && <>
      {materials && <div className="resource-summary"><span><BookOpen size={18} />{lessons.length} lesson plans</span><span><Languages size={18} />Verified phrases: {phraseData?.translations.filter((item) => item.verified).length ?? '—'}</span><span><CloudOff size={18} />Local storage: device only</span></div>}
      <div className="resource-list">{lessons.map((item) => <article className="resource-row" key={item.id}>
        <span className="resource-index">{item.id.slice(-3)}</span><div className="resource-title"><strong>{item.title}</strong><span>Grade {item.grade} · {item.subject} · {item.durationMinutes} min</span></div><span className="resource-language">Santali · Ol Chiki</span><button className="button button-secondary button-small" onClick={() => setSelected(item)}>Details <ArrowRight size={14} /></button>
      </article>)}</div>
      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" aria-label="Close lesson details" onClick={() => setSelected(null)}><X size={17} /></button><p className="eyebrow">{selected.id} · GRADE {selected.grade}</p><h2 id="resource-modal-title">{selected.title}</h2><p>{selected.learningOutcome}</p><h3>Activities</h3><ul>{selected.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul><p className="resource-caveat">Santali phrase content is not included until verified data is available.</p></section></div>}
    </>}
  </>
}

export function WorksheetPage() {
  const [worksheet, setWorksheet] = useState<WorksheetRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [questionCount, setQuestionCount] = useState(8)

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    const form = new FormData(event.currentTarget)
    try {
      const result = await apiRequest<WorksheetRecord>('/api/worksheets/generate', {
        method: 'POST',
        body: JSON.stringify({
          grade: Number(form.get('grade')),
          subject: String(form.get('subject')),
          lesson: String(form.get('lesson')),
          learningOutcome: String(form.get('learningOutcome')),
          difficulty: String(form.get('difficulty')),
          questionCount: Number(form.get('questionCount')),
          sourceLanguage: 'hi',
          targetLanguage: String(form.get('targetLanguage')),
        }),
      })
      setWorksheet(result)
      setQuestionCount(result.questions.length)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Worksheet generation failed.')
    } finally {
      setBusy(false)
    }
  }

  function saveWorksheet() {
    if (!worksheet) return
    try {
      const savedWorksheets = JSON.parse(localStorage.getItem('bhashasetu.worksheets') ?? '[]') as WorksheetRecord[]
      localStorage.setItem('bhashasetu.worksheets', JSON.stringify([...savedWorksheets.filter((item) => item.id !== worksheet.id), worksheet]))
      setSaved(true)
    } catch {
      setError('This device could not save the worksheet. Check available browser storage.')
    }
  }

  function updatePrompt(questionId: string, prompt: string) {
    setWorksheet((current) => current ? { ...current, questions: current.questions.map((question) => question.id === questionId ? { ...question, prompt } : question) } : current)
  }

  return <>
    <PageHeading eyebrow="TEACHING RESOURCE" title="Worksheets" description="Generate deterministic Hindi practice questions for a lesson." />
    <div className="worksheet-layout">
      <section className="worksheet-settings">
        <div className="section-heading"><p className="eyebrow">AUTHORING</p><h2>Worksheet settings</h2><p>Align practice to the lesson outcome.</p></div>
        <form className="generator-form" onSubmit={generate}>
          <label>Grade<select name="grade" defaultValue="2"><option value="2">Grade 2</option></select></label>
          <label>Subject<input name="subject" defaultValue="FLN" required /></label>
          <label>Lesson<input name="lesson" defaultValue="Numbers 1-10" required /></label>
          <label>Learning outcome<input name="learningOutcome" defaultValue="Recognize numbers from 1 to 10." required /></label>
          <label>Target language<select name="targetLanguage" defaultValue="sat_Olck"><option value="sat_Olck">Santali · Ol Chiki</option></select></label>
          <div className="form-row"><label>Difficulty<select name="difficulty" defaultValue="beginner"><option value="beginner">Beginner</option><option value="developing">Developing</option><option value="secure">Secure</option></select></label><label>Questions<input name="questionCount" type="number" min="1" max="20" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} required /></label></div>
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : <Activity size={16} />}{busy ? 'Generating...' : 'Generate worksheet'}</button>
        </form>
        {error && <div className="request-state request-error" role="alert"><AlertCircle size={17} />{error}</div>}
      </section>
      <section className="worksheet-preview-region">
        <div className="preview-toolbar"><div><p className="eyebrow">LIVE PREVIEW</p><h2>{worksheet?.lessonTitle ?? 'Numbers 1-10'}</h2></div><span className="preview-language">Hindi · Santali / Ol Chiki</span></div>
        {worksheet ? <section className="worksheet-paper">
          <div className="worksheet-head"><div><p className="eyebrow">GRADE {worksheet.grade} · {worksheet.subject}</p><h2>{worksheet.lessonTitle}</h2><p>{worksheet.learningOutcome}</p></div><span className="lesson-tag">{worksheet.questions.length} QUESTIONS</span></div>
          <div className="worksheet-language-notice"><ShieldCheck size={16} />{worksheet.translationNotice}</div>
          <ol className="question-list">{worksheet.questions.map((question) => <li key={question.id}><span className="question-type">{question.type.replaceAll('-', ' ')}</span>{editing ? <input value={question.prompt} onChange={(event) => updatePrompt(question.id, event.target.value)} aria-label={`Edit ${question.id}`} /> : <p>{question.prompt}</p>}<span className="answer-line" aria-hidden="true" /></li>)}</ol>
        </section> : <div className="worksheet-placeholder"><Printer size={24} /><strong>Your worksheet preview will appear here</strong><span>Choose the lesson settings, then generate to preview and print.</span></div>}
        {worksheet && <div className="worksheet-actions no-print"><button className="button button-secondary" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button><button className="button button-secondary" onClick={saveWorksheet}>{saved ? <Check size={16} /> : <Save size={16} />}{saved ? 'Saved on this device' : 'Save offline'}</button><button className="button button-secondary" onClick={() => setEditing(!editing)}>{editing ? 'Finish editing' : 'Edit questions'}</button></div>}
      </section>
    </div>
  </>
}

function readSavedFlashcardIds() {
  try {
    return (JSON.parse(localStorage.getItem('bhashasetu.flashcards') ?? '[]') as FlashcardRecord[]).map((item) => item.id)
  } catch {
    return []
  }
}

export function FlashcardsPage() {
  const { data, loading, error, retry } = useResource<{ flashcards: FlashcardRecord[] }>('/api/flashcards')
  const [index, setIndex] = useState(0)
  const [savedCardIds, setSavedCardIds] = useState(readSavedFlashcardIds)
  const [message, setMessage] = useState('')
  const savedPack = readSavedOfflinePack()
  const cards = data?.flashcards ?? savedPack?.flashcards ?? []
  const usingOfflinePack = !data && savedPack !== null
  const card = cards[index]
  const saved = Boolean(card && savedCardIds.includes(card.id))

  function playHindi() {
    if (!card || !('speechSynthesis' in window)) {
      setMessage('Hindi audio is not available on this device.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(card.hindiText)
    utterance.lang = 'hi-IN'
    window.speechSynthesis.speak(utterance)
    setMessage('Playing Hindi audio using this device.')
  }

  function saveCard() {
    if (!card) return
    try {
      const current = JSON.parse(localStorage.getItem('bhashasetu.flashcards') ?? '[]') as FlashcardRecord[]
      localStorage.setItem('bhashasetu.flashcards', JSON.stringify([...current.filter((item) => item.id !== card.id), card]))
      setSavedCardIds((ids) => ids.includes(card.id) ? ids : [...ids, card.id])
      setMessage('Flashcard saved on this device.')
    } catch {
      setMessage('This device could not save the flashcard.')
    }
  }

  return <>
    <PageHeading eyebrow="STUDY TOOL" title="Flashcards" description="Practice number recognition with the Hindi-side Demo Mode set." />
    <RequestState loading={loading && cards.length === 0} error={error && !usingOfflinePack ? error : ''} retry={retry} />
    {usingOfflinePack && <div className="inline-error" role="status">Network unavailable. Showing the flashcards saved on this device.</div>}
    {(data || usingOfflinePack) && card && <>
      <div className="flashcard-progress"><span>{card.category}</span><span>{index + 1} of {cards.length}</span></div>
      <article className="flashcard-view">
        <span className="flashcard-label">HINDI · NUMBER RECOGNITION</span><strong className="flashcard-number">{card.numeral}</strong><h2 lang="hi">{card.hindiText}</h2><div className="flashcard-target"><span>SANTALI · OL CHIKI</span><strong>No verified translation for this card</strong><small>Verified classroom phrases are available separately in the Language Bridge.</small></div>
      </article>
      <div className="flashcard-controls"><button className="button button-secondary" onClick={() => { setIndex((index - 1 + cards.length) % cards.length); setMessage('') }} disabled={cards.length < 2}>Previous</button><button className="button button-secondary" onClick={playHindi}><Volume2 size={15} /> Play Hindi audio</button><button className="button button-secondary" onClick={saveCard}>{saved ? <Check size={15} /> : <Download size={15} />}{saved ? 'Saved offline' : 'Save offline'}</button><button className="button button-secondary" onClick={() => window.print()}><Printer size={15} /> Print</button><button className="button button-primary" onClick={() => { setIndex((index + 1) % cards.length); setMessage('') }} disabled={cards.length < 2}>Next <ArrowRight size={15} /></button></div>
      {message && <p className="page-feedback" role="status">{message}</p>}
    </>}
  </>
}

type OfflinePackData = { lessons: LessonRecord[]; worksheets: unknown[]; flashcards: FlashcardRecord[]; savedPhrases: unknown[]; audio: unknown[]; notice: string }

function readSavedOfflinePack(): OfflinePackData | null {
  try {
    const parsed = JSON.parse(localStorage.getItem('bhashasetu.offline.pack') ?? 'null') as OfflinePackData | null
    return parsed && Array.isArray(parsed.lessons) && Array.isArray(parsed.flashcards) ? parsed : null
  } catch {
    return null
  }
}

function readStoredRecords<T>(key: string): T[] {
  try {
    const records = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
    return Array.isArray(records) ? records as T[] : []
  } catch {
    return []
  }
}

export function OfflinePackPage() {
  const { data, loading, error, retry } = useResource<OfflinePackData>('/api/offline-pack')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [savedPack, setSavedPack] = useState<OfflinePackData | null>(readSavedOfflinePack)
  const pack = savedPack ?? data
  const cached = savedPack !== null

  async function syncResources() {
    setSyncing(true)
    setSyncMessage('')
    try {
      const result = await apiRequest<{ status: string; pack: OfflinePackData; message: string }>('/api/offline-pack/sync', { method: 'POST', body: JSON.stringify({}) })
      const localWorksheets = readStoredRecords<WorksheetRecord>('bhashasetu.worksheets')
      const localFlashcards = readStoredRecords<FlashcardRecord>('bhashasetu.flashcards')
      const localHistory = readStoredRecords<HistoryItem>('bhashasetu.history')
      const savedPack: OfflinePackData = {
        ...result.pack,
        worksheets: [...new Map([...result.pack.worksheets, ...localWorksheets].map((item) => [(item as { id: string }).id, item])).values()],
        flashcards: [...new Map([...result.pack.flashcards, ...localFlashcards].map((item) => [item.id, { ...item, offlineAvailable: true }])).values()],
        savedPhrases: [...result.pack.savedPhrases, ...localHistory.filter((item) => item.validationStatus === 'accepted' || item.validationStatus === 'edited').map((item) => ({ sourceText: item.sourceText, translatedText: item.targetText, direction: item.direction, validationStatus: item.validationStatus }))],
      }
      localStorage.setItem('bhashasetu.offline.pack', JSON.stringify(savedPack))
      window.dispatchEvent(new Event('bhashasetu:offline-pack'))
      setSavedPack(savedPack)
      setSyncMessage(result.message)
    } catch (requestError) {
      setSyncMessage(requestError instanceof Error ? requestError.message : 'Could not prepare resources for local saving.')
    } finally {
      setSyncing(false)
    }
  }

  return <>
    <PageHeading eyebrow="DEVICE STORAGE" title="Offline pack" description="Save the resources this prototype actually provides to this browser." />
    <RequestState loading={loading && !pack} error={error && !pack ? error : ''} retry={retry} />
    {pack && <>
      {error && savedPack && <div className="inline-error" role="status">Network unavailable. Showing the copy saved on this device.</div>}
      <div className={`offline-banner ${cached ? 'is-cached' : ''}`}><span className="offline-banner-icon">{cached ? <Check size={19} /> : <CloudOff size={19} />}</span><div><strong>{cached ? 'Classroom resources saved on this device' : 'No offline pack saved yet'}</strong><p>{cached ? 'Saved lessons and flashcard metadata can be opened without a network connection.' : 'Prepare the available lesson and card data for this browser.'}</p></div><button className="button button-primary" onClick={syncResources} disabled={syncing}>{syncing ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />}{syncing ? 'Saving...' : cached ? 'Refresh saved pack' : 'Save resources'}</button></div>
      {syncMessage && <p className="page-feedback" role="status">{syncMessage}</p>}
      <div className="offline-resource-grid"><article><BookOpen size={19} /><span>Lesson pack</span><strong>{pack.lessons.length} lessons</strong><small>Metadata and outcomes</small></article><article><Activity size={19} /><span>Worksheets</span><strong>{pack.worksheets.length} saved</strong><small>Generate and save separately</small></article><article><Languages size={19} /><span>Verified phrases</span><strong>{pack.savedPhrases.length}</strong><small>Verified classroom phrase pairs</small></article><article><Volume2 size={19} /><span>Audio</span><strong>{pack.audio.length} files</strong><small>No Santali audio bundled</small></article></div>
      <div className="offline-disclosure"><ShieldCheck size={17} /><p>{pack.notice}</p></div>
    </>}
  </>
}

type HistoryItem = { translationId: string; timestamp: string; direction: string; sourceText: string; targetText: string; mode: string; validationStatus: string }

export function HistoryPage() {
  const { data, loading, error, retry } = useResource<{ history: HistoryItem[] }>('/api/history')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('all')
  const [editingId, setEditingId] = useState('')
  const [editedTarget, setEditedTarget] = useState('')
  const [feedback, setFeedback] = useState('')
  const localHistory = (() => {
    try { return JSON.parse(localStorage.getItem('bhashasetu.history') ?? '[]') as HistoryItem[] } catch { return [] }
  })()
  const history = [...new Map([...localHistory, ...(data?.history ?? [])].map((item) => [item.translationId, item])).values()]
  const visibleHistory = history.filter((item) => (mode === 'all' || item.mode === mode) && `${item.sourceText} ${item.targetText}`.toLowerCase().includes(query.toLowerCase()))

  function replayHindi(item: HistoryItem) {
    if (!('speechSynthesis' in window) || item.direction !== 'hi-to-sat') {
      setFeedback('Hindi audio is not available for this history item on this device.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(item.sourceText)
    utterance.lang = 'hi-IN'
    window.speechSynthesis.speak(utterance)
    setFeedback('Playing the original Hindi phrase.')
  }

  async function saveHistoryEdit(item: HistoryItem) {
    const editedText = editedTarget.trim()
    if (!editedText) return
    const updated = { ...item, targetText: editedText, validationStatus: 'edited' }
    try {
      const existing = JSON.parse(localStorage.getItem('bhashasetu.history') ?? '[]') as HistoryItem[]
      localStorage.setItem('bhashasetu.history', JSON.stringify([...existing.filter((record) => record.translationId !== item.translationId), updated]))
      setFeedback('Teacher edit saved on this device.')
    } catch {
      setFeedback('This device could not save the edit.')
      return
    }
    try {
      const response = await fetch('/api/translation/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ translationId: item.translationId, status: 'edited', reviewedText: editedText }) })
      if (response.ok) setFeedback('Teacher edit saved to the current API session and this device.')
    } catch {
      setFeedback('Teacher edit is saved on this device. The API is unavailable.')
    }
    setEditingId('')
  }

  return <>
    <PageHeading eyebrow="YOUR RECORDS" title="Translation history" description="Successful translations are stored on this device. Nothing is shown as real unless a provider returned it." />
    <RequestState loading={loading && localHistory.length === 0} error={error && localHistory.length === 0 ? error : ''} retry={retry} />
    {(!loading && !error || localHistory.length > 0) && <section className="panel history-panel"><div className="history-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search phrases" aria-label="Search translation history"/><select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Filter history by mode"><option value="all">All modes</option><option value="demo">Demo</option><option value="live">Live</option></select></div>{error && <p className="page-feedback">Showing history saved on this device; API history is unavailable.</p>}{visibleHistory.length ? <div className="history-list">{visibleHistory.map((item) => <article className="history-row" key={item.translationId}><div><strong>{item.sourceText}</strong><span>{item.direction} · {new Date(item.timestamp).toLocaleString()}</span><div className="history-actions"><button className="text-button" onClick={() => replayHindi(item)}>Replay Hindi</button><button className="text-button" onClick={() => { setEditingId(item.translationId); setEditedTarget(item.targetText) }}>Edit</button></div></div><ArrowRight size={16} /><div>{editingId === item.translationId ? <><input className="history-edit" value={editedTarget} onChange={(event) => setEditedTarget(event.target.value)} aria-label="Edit translated text"/><button className="text-button" onClick={() => void saveHistoryEdit(item)}>Save edit</button></> : <><strong>{item.targetText}</strong><span>{item.mode} · {item.validationStatus}</span><button className="text-button" onClick={() => setFeedback(`Translation ${item.translationId} is already stored on this device.`)}>Save</button></>}</div></article>)}</div> : <div className="empty-state history-empty"><span className="empty-icon"><Activity size={20} /></span><strong>No successful translations yet</strong><p>Unsupported phrases are not added to history as translations.</p></div>}{feedback && <p className="page-feedback" role="status">{feedback}</p>}</section>}
  </>
}

export function TeacherProfilePage() {
  const [name, setName] = useState(() => localStorage.getItem('bhashasetu.teacher.name') ?? 'Ananya Kumari')
  const [saved, setSaved] = useState(false)
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    localStorage.setItem('bhashasetu.teacher.name', name.trim())
    window.dispatchEvent(new Event('bhashasetu:profile'))
    setSaved(true)
  }
  return <>
    <PageHeading eyebrow="YOUR ACCOUNT" title="Teacher profile" description="Profile details are stored only in this browser for the prototype." />
    <form className="panel profile-form" onSubmit={saveProfile}><span className="teacher-avatar profile-avatar">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><label>Display name<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false) }} required /></label><label>Role<input value="Primary Teacher" readOnly /></label><label>School<input value="Government Primary School" readOnly /></label><label>Grade<input value="Grade 2" readOnly /></label><button className="button button-primary" type="submit"><Save size={15} />Save profile</button>{saved && <span className="saved-note" role="status"><Check size={15} /> Saved on this device</span>}</form>
  </>
}

export function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('bhashasetu.theme') ?? 'system')
  const [largeText, setLargeText] = useState(() => localStorage.getItem('bhashasetu.accessibility.largeText') === 'true')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('bhashasetu.accessibility.highContrast') === 'true')
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('bhashasetu.accessibility.reducedMotion') === 'true')
  const [saved, setSaved] = useState(false)
  function updateTheme(value: string) {
    setTheme(value)
    localStorage.setItem('bhashasetu.theme', value)
    window.dispatchEvent(new CustomEvent('bhashasetu:theme', { detail: value }))
    setSaved(true)
  }
  function updateAccessibility(key: string, value: boolean, setter: (value: boolean) => void) {
    setter(value)
    localStorage.setItem(key, String(value))
    window.dispatchEvent(new Event('bhashasetu:accessibility'))
    setSaved(true)
  }
  return <>
    <PageHeading eyebrow="PREFERENCES" title="Settings" description="Settings persist locally on this device." />
    <section className="panel settings-panel">
      <div className="settings-group"><div><h2>Appearance</h2><p>Choose how BhashaSetu looks on this device.</p></div><div className="segmented-control" role="group" aria-label="Theme"><button className={theme === 'light' ? 'selected' : ''} onClick={() => updateTheme('light')}>Light</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => updateTheme('dark')}>Dark</button><button className={theme === 'system' ? 'selected' : ''} onClick={() => updateTheme('system')}>System</button></div></div>
      <div className="settings-group"><div><h2>Translation</h2><p>Current language pair and provider status.</p></div><div className="setting-detail"><span>Hindi <ArrowRight size={14} /> Santali · Ol Chiki</span><small>Demo Mode · live service not configured</small></div></div>
      <div className="settings-group"><div><h2>Speech</h2><p>Capabilities depend on this device and browser.</p></div><div className="setting-detail"><span>Hindi speech recognition</span><small>Browser support required</small><span>Santali speech and audio</span><small>Not configured</small></div></div>
      <div className="settings-group"><div><h2>Accessibility</h2><p>Adjust reading comfort.</p></div><div className="setting-toggles"><label><input type="checkbox" checked={largeText} onChange={(event) => updateAccessibility('bhashasetu.accessibility.largeText', event.target.checked, setLargeText)} />Large text</label><label><input type="checkbox" checked={highContrast} onChange={(event) => updateAccessibility('bhashasetu.accessibility.highContrast', event.target.checked, setHighContrast)} />High contrast</label><label><input type="checkbox" checked={reducedMotion} onChange={(event) => updateAccessibility('bhashasetu.accessibility.reducedMotion', event.target.checked, setReducedMotion)} />Reduced motion</label></div></div>
      {saved && <p className="saved-note settings-saved" role="status"><Check size={15} /> Preferences saved</p>}
    </section>
  </>
}

export function AboutPage() {
  const rows = [
    ['Teacher Hindi input', 'Implemented: text input; browser Hindi speech recognition when supported.'],
    ['Lesson context', 'Implemented: grade, subject, topic, and learning outcome in API request contract.'],
    ['Pedagogy layer', 'Planned: context is passed through; no separate pedagogy engine exists yet.'],
    ['Translation engine', 'Demo Mode supports five supplied verified phrase pairs; no live provider is wired.'],
    ['Santali speech and TTS', 'Not configured: no Santali ASR or audio provider is claimed.'],
    ['Offline classroom', 'Partial: lesson/session and pack data can be stored in browser local storage.'],
  ]
  return <>
    <PageHeading eyebrow="PROJECT" title="About BhashaSetu" description="A transparent view of the prototype architecture and implementation status." />
    <section className="panel architecture-panel"><div className="architecture-flow">{['Teacher Hindi input', 'Browser ASR (optional)', 'Hindi text + lesson context', 'Translation provider (not configured)', 'Santali / Ol Chiki (verified data only)', 'Device TTS (Hindi only)'].map((step, index) => <div className="architecture-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 5 && <ArrowRight size={15} />}</div>)}</div><h2>Implemented technologies</h2><div className="technology-list"><span>React 19</span><span>TypeScript</span><span>Vite</span><span>Express 5</span><span>Zod</span><span>Browser localStorage</span></div><div className="offline-disclosure"><ShieldCheck size={17} /><p>This is an early prototype. No live translation, database, Santali speech recognition, or Santali text-to-speech is currently connected.</p></div></section>
    <section className="panel status-list">{rows.map(([title, status]) => <div key={title}><strong>{title}</strong><span>{status}</span></div>)}</section>
  </>
}

export function MaterialsPage() {
  return <LessonsPage materials />
}