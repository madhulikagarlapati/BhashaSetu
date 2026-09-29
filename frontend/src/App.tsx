import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  CloudOff,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Library,
  Menu,
  Mic,
  Moon,
  MoreHorizontal,
  Play,
  Settings,
  ShieldCheck,
  Sun,
  Volume2,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react'
import { AboutPage, FlashcardsPage, HistoryPage, MaterialsPage, OfflinePackPage, TeacherProfilePage, WorksheetPage, LessonsPage, SettingsPage } from './WorkspacePages'
import { useResource } from './useApiResource'
import './bhashasetu.css'
import './redesign.css'

type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
}

type VerifiedDemoPhrase = {
  id: string
  category: string
  hindiText: string
  santaliText: string
  script: string
  verified: boolean
}

const navigation: NavigationItem[] = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Classroom', path: '/classroom', icon: GraduationCap },
  { label: 'Language bridge', path: '/bridge', icon: Languages },
  { label: 'Learning materials', path: '/materials', icon: Library },
  { label: 'Worksheets', path: '/worksheets', icon: ClipboardList },
  { label: 'Flashcards', path: '/flashcards', icon: Boxes },
  { label: 'Lessons', path: '/lessons', icon: BookOpen },
  { label: 'Offline pack', path: '/offline', icon: CloudOff },
  { label: 'Translation history', path: '/history', icon: Activity },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'About & architecture', path: '/about', icon: ShieldCheck },
]

const navigationGroups = [
  { label: 'CLASSROOM', items: navigation.slice(0, 3) },
  { label: 'LEARNING RESOURCES', items: navigation.slice(3, 7) },
  { label: 'MY CLASSROOM', items: navigation.slice(7, 9) },
]

const pageContext: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Overview', description: 'A clear view of today’s classroom.' },
  '/classroom': { title: 'Classroom', description: 'Prepare and lead a lesson.' },
  '/bridge': { title: 'Live Language Bridge', description: 'Help teacher and learner understand one another.' },
  '/materials': { title: 'Learning Materials', description: 'Lesson-aligned resources for your class.' },
  '/lessons': { title: 'Lessons', description: 'Browse your Grade 2 lesson library.' },
  '/worksheets': { title: 'Worksheets', description: 'Create printable practice for a lesson.' },
  '/flashcards': { title: 'Flashcards', description: 'Practice key concepts together.' },
  '/offline': { title: 'Offline Pack', description: 'Resources saved on this device.' },
  '/history': { title: 'Translation History', description: 'Review classroom phrases and decisions.' },
  '/settings': { title: 'Settings', description: 'Preferences for this device.' },
  '/about': { title: 'About BhashaSetu', description: 'How the prototype works today.' },
  '/profile': { title: 'Teacher Profile', description: 'Your classroom details.' },
}

const lesson = {
  id: 'LESSON-FLN-001',
  grade: 2,
  subject: 'Foundational Literacy & Numeracy',
  title: 'Numbers 1-10',
  learningOutcome: 'Students identify and recognize numbers from 1 to 10.',
  targetLanguage: 'Santali / Ol Chiki',
  duration: '35 min',
  activities: ['Number recognition', 'Count classroom objects', 'Match quantity to numeral'],
}

const inputOnlySamplePhrases = [
  'आज हम संख्या सीखेंगे।',
  'सब बच्चे ध्यान से सुनें।',
  'एक से दस तक गिनो।',
  'अब इन वस्तुओं को गिनें।',
  'अपने साथी के साथ अभ्यास करें।',
]

function App() {
  return (
    <BrowserRouter>
      <ApplicationShell />
    </BrowserRouter>
  )
}

function ApplicationShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('bhashasetu.theme') ?? 'system')
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [hasOfflinePack, setHasOfflinePack] = useState(() => localStorage.getItem('bhashasetu.offline.pack') !== null)
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('bhashasetu.teacher.name') ?? 'Ananya Kumari')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  const page = pageContext[location.pathname] ?? pageContext['/dashboard']

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => setSystemDark(media.matches)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onThemeChange = (event: Event) => setTheme((event as CustomEvent<string>).detail)
    const onOfflinePackChange = () => setHasOfflinePack(localStorage.getItem('bhashasetu.offline.pack') !== null)
    const onProfileChange = () => setTeacherName(localStorage.getItem('bhashasetu.teacher.name') ?? 'Ananya Kumari')
    const applyAccessibility = () => {
      document.documentElement.classList.toggle('large-text', localStorage.getItem('bhashasetu.accessibility.largeText') === 'true')
      document.documentElement.classList.toggle('high-contrast', localStorage.getItem('bhashasetu.accessibility.highContrast') === 'true')
      document.documentElement.classList.toggle('reduced-motion', localStorage.getItem('bhashasetu.accessibility.reducedMotion') === 'true')
    }
    applyAccessibility()
    media.addEventListener('change', updateSystemTheme)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('bhashasetu:theme', onThemeChange)
    window.addEventListener('bhashasetu:offline-pack', onOfflinePackChange)
    window.addEventListener('bhashasetu:profile', onProfileChange)
    window.addEventListener('bhashasetu:accessibility', applyAccessibility)
    return () => {
      media.removeEventListener('change', updateSystemTheme)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('bhashasetu:theme', onThemeChange)
      window.removeEventListener('bhashasetu:offline-pack', onOfflinePackChange)
      window.removeEventListener('bhashasetu:profile', onProfileChange)
      window.removeEventListener('bhashasetu:accessibility', applyAccessibility)
    }
  }, [])

  function toggleTheme() {
    const nextTheme = dark ? 'light' : 'dark'
    localStorage.setItem('bhashasetu.theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <div className={dark ? 'app-shell theme-dark' : 'app-shell'}>
      <aside className={mobileMenuOpen ? 'sidebar mobile-open' : 'sidebar'}>
        <div className="sidebar-brand-row">
          <NavLink className="brand" to="/dashboard" aria-label="BhashaSetu overview" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-mark"><Languages size={19} /></span>
            <span><strong>BhashaSetu</strong><small>Mother-Tongue Classroom Assistant</small></span>
          </NavLink>
          <button className="mobile-menu-close" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="school-switcher">
          <span className="school-avatar">GP</span>
          <span className="school-copy"><strong>Government Primary School</strong><small>Grade 2 · Foundational Learning</small></span>
          <ChevronDown size={15} />
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigationGroups.map((group) => <div className="nav-group" key={group.label}>
            <p className="nav-caption">{group.label}</p>
            {group.items.map(({ label, path, icon: Icon }) => <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} key={path} to={path} onClick={() => setMobileMenuOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label === 'Language bridge' ? 'Live Language Bridge' : label}</span></NavLink>)}
          </div>)}
          <div className="nav-group nav-group-secondary">
            <p className="nav-caption">PREFERENCES</p>
            {navigation.slice(9).map(({ label, path, icon: Icon }) => <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} key={path} to={path} onClick={() => setMobileMenuOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label === 'About & architecture' ? 'About' : label}</span></NavLink>)}
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="offline-note"><span className={online ? 'status-dot online' : 'status-dot offline'} />
            <span><strong>{online ? 'Classroom ready' : hasOfflinePack ? 'Offline ready' : 'Offline'}</strong><small>{online ? 'Demo mode · verified data only' : hasOfflinePack ? 'Saved resources available' : 'No resources saved yet'}</small></span>
          </div>
          <NavLink className="teacher-mini" to="/profile"><span className="teacher-avatar">{teacherName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{teacherName}</strong><small>Primary Teacher</small></span><MoreHorizontal size={18} /></NavLink>
        </div>
      </aside>
      {mobileMenuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
          <div className="page-context"><h1>{page.title}</h1><p>{page.description}</p></div>
          <div className="topbar-actions">
            <span className={`connection-badge ${online ? 'is-online' : 'is-offline'}`}>{online ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{online ? 'Connected' : hasOfflinePack ? 'Offline ready' : 'Offline'}</span></span>
            <span className="mode-chip"><span className="mode-dot" /> DEMO MODE</span>
            <button className="icon-button" type="button" title={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink className="teacher-avatar top-avatar" to="/profile" aria-label="Open teacher profile">{teacherName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</NavLink>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/bridge" element={<LanguageBridge />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/worksheets" element={<WorksheetPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/offline" element={<OfflinePackPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<TeacherProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

type DashboardSummary = {
  teacher: { name: string; role: string; school: string; grade: number; subject: string }
  class: { enrolled: number; present: number }
  currentLesson: typeof lesson
  counts: { worksheets: number; flashcards: number; savedOffline: number }
  mode: 'demo' | 'live'
}

function Dashboard() {
  const navigate = useNavigate()
  const { data: summary, error, retry } = useResource<DashboardSummary>('/api/dashboard')
  const { data: historyData } = useResource<{ history: Array<{ timestamp: string }> }>('/api/history')
  const localHistory = readLocalRecords<{ timestamp: string }>('bhashasetu.history')
  const localWorksheets = readLocalRecords<unknown>('bhashasetu.worksheets')
  const localPack = readLocalOfflinePack()
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const translationsToday = [...(historyData?.history ?? []), ...localHistory].filter((entry) => entry.timestamp.slice(0, 10) === today).length
  const offlineResourceCount = (localPack?.lessons?.length ?? 0) + (localPack?.flashcards?.length ?? 0) + (localPack?.worksheets?.length ?? 0)
  const savedLessonCount = localStorage.getItem('bhashasetu.lesson.saved') ? 1 : 0

  return (
    <>
      <section className="dashboard-hero">
        <div className="hero-copy"><p className="eyebrow">MOTHER-TONGUE CLASSROOM ASSISTANT</p><h2>BhashaSetu</h2><p className="hero-tagline">Bridging Languages. Enabling Learning.</p><p className="hero-description">A practical teaching companion for Hindi-speaking teachers and Santali-speaking learners.</p></div>
        <div className="hero-actions"><button className="button button-primary" onClick={() => navigate('/classroom')}><GraduationCap size={17} /> Enter Classroom</button><button className="button button-quiet" onClick={() => navigate('/about')}>See how it works <ArrowRight size={16} /></button></div>
        <div className="hero-language-mark" aria-hidden="true"><span>अ</span><i /><span>ᱚ</span></div>
      </section>
      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="text-button" onClick={retry}>Retry</button></div>}
      <section className="current-lesson-row" aria-labelledby="current-lesson-title">
        <div className="current-lesson-copy"><span className="section-kicker"><span className="status-dot online" /> CURRENT LESSON</span><h2 id="current-lesson-title">{summary?.currentLesson.title ?? lesson.title}</h2><p>Grade {summary?.teacher.grade ?? lesson.grade} <span>·</span> FLN Mathematics <span>·</span> Santali / Ol Chiki</p></div>
        <button className="button button-secondary" onClick={() => navigate('/classroom')}>Continue lesson <ArrowRight size={16} /></button>
      </section>
      <section className="metric-grid" aria-label="Classroom summary">
        <Metric icon={Languages} label="Translations today" value={String(translationsToday)} detail="Successful translations" tone="navy" />
        <Metric icon={ClipboardList} label="Worksheets" value={String(localWorksheets.length)} detail="Saved on this device" tone="saffron" />
        <Metric icon={CloudOff} label="Offline resources" value={String(offlineResourceCount)} detail={offlineResourceCount ? 'Available on this device' : 'None saved yet'} tone="green" />
        <Metric icon={BookOpenCheck} label="Saved lessons" value={String(savedLessonCount)} detail="Ready for class" tone="slate" />
      </section>
      <section className="dashboard-support">
        <div className="support-heading"><div><p className="eyebrow">TEACHING TOOLS</p><h2>Keep the lesson moving</h2></div><button className="text-button" onClick={() => navigate('/materials')}>Browse materials <ArrowRight size={15} /></button></div>
        <div className="support-links"><QuickLink icon={Languages} label="Live Language Bridge" onClick={() => navigate('/bridge')} /><QuickLink icon={Library} label="Learning Materials" onClick={() => navigate('/materials')} /><QuickLink icon={CloudOff} label="Offline Pack" onClick={() => navigate('/offline')} /></div>
      </section>
    </>
  )
}

function readLocalRecords<T>(key: string): T[] {
  try {
    const records = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
    return Array.isArray(records) ? records as T[] : []
  } catch {
    return []
  }
}

function readLocalOfflinePack() {
  try {
    return JSON.parse(localStorage.getItem('bhashasetu.offline.pack') ?? 'null') as { lessons?: unknown[]; flashcards?: unknown[]; worksheets?: unknown[] } | null
  } catch {
    return null
  }
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: LucideIcon; label: string; value: string; detail: string; tone: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={18} /></span><div className="metric-copy"><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span></div></article>
}

function QuickLink({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button className="quick-link" type="button" onClick={onClick}><span><Icon size={18} /></span>{label}<ArrowRight size={15} /></button>
}

function Classroom() {
  const navigate = useNavigate()
  const [availableLessons, setAvailableLessons] = useState<Array<typeof lesson>>([])
  const [selectedLesson, setSelectedLesson] = useState<typeof lesson>(() => {
    try { return JSON.parse(localStorage.getItem('bhashasetu.currentLesson') ?? 'null') as typeof lesson ?? lesson } catch { return lesson }
  })
  const [lessonLoadError, setLessonLoadError] = useState('')
  const [saved, setSaved] = useState(localStorage.getItem('bhashasetu.lesson.saved') === lesson.id)
  const [preview, setPreview] = useState(false)
  const [started, setStarted] = useState(false)

  function updateSelectedLesson(next: typeof lesson) {
    setSelectedLesson(next)
    setSaved(localStorage.getItem('bhashasetu.lesson.saved') === next.id)
    localStorage.setItem('bhashasetu.currentLesson', JSON.stringify(next))
    localStorage.setItem('bhashasetu.currentLessonId', next.id)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/lessons', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Lessons could not be loaded.')
        const payload: { lessons: Array<{ id: string; grade: number; subject: string; title: string; learningOutcome: string; targetLanguage: string; durationMinutes: number; activities: string[] }> } = await response.json()
        const available = payload.lessons.map((item) => ({ ...item, duration: `${item.durationMinutes} min` }))
        setAvailableLessons(available)
        const savedLessonId = localStorage.getItem('bhashasetu.currentLessonId')
        const matchingLesson = available.find((item) => item.id === savedLessonId)
        if (matchingLesson) setSelectedLesson(matchingLesson)
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') return
        try {
          const pack = JSON.parse(localStorage.getItem('bhashasetu.offline.pack') ?? 'null') as { lessons?: Array<{ id: string; grade: number; subject: string; title: string; learningOutcome: string; targetLanguage: string; durationMinutes: number; activities: string[] }> } | null
          const savedLessons = (pack?.lessons ?? []).map((item) => ({ ...item, duration: `${item.durationMinutes} min` }))
          if (savedLessons.length) {
            setAvailableLessons(savedLessons)
            const matchingLesson = savedLessons.find((item) => item.id === localStorage.getItem('bhashasetu.currentLessonId'))
            if (matchingLesson) setSelectedLesson(matchingLesson)
            return
          }
        } catch { /* Invalid local cache falls through to the request error. */ }
        setLessonLoadError(loadError instanceof Error ? loadError.message : 'Lessons could not be loaded.')
      })
    return () => controller.abort()
  }, [])

  function saveLesson() {
    localStorage.setItem('bhashasetu.lesson.saved', selectedLesson.id)
    localStorage.setItem('bhashasetu.currentLesson', JSON.stringify(selectedLesson))
    localStorage.setItem('bhashasetu.currentLessonId', selectedLesson.id)
    setSaved(true)
  }

  function startClass() {
    const session = { lessonId: selectedLesson.id, startedAt: new Date().toISOString(), status: 'active' }
    localStorage.setItem('bhashasetu.classroom.session', JSON.stringify(session))
    setStarted(true)
  }

  return (
    <>
      <div className="classroom-toolbar"><span className="classroom-toolbar-label">Grade {selectedLesson.grade} · {selectedLesson.subject}</span><button className="button button-primary" onClick={startClass}><Play size={16} fill="currentColor" /> {started ? 'Class in progress' : 'Start classroom'}</button></div>
      {started && <div className="inline-confirm"><Check size={17} /> Classroom session started and saved on this device.</div>}
      {lessonLoadError && <div className="inline-error" role="alert">{lessonLoadError} Showing the built-in Numbers 1-10 lesson.</div>}
      <section className="panel setup-panel">
        <div className="section-title"><span className="step-number">01</span><div><h2>Lesson setup</h2><p>Choose the class context for your session.</p></div></div>
        <div className="selector-grid">
          <label>GRADE<select value={selectedLesson.grade} onChange={(event) => { const next = availableLessons.find((item) => item.grade === Number(event.target.value)); if (next) updateSelectedLesson(next) }}>{[...new Set(availableLessons.map((item) => item.grade))].map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label>
          <label>SUBJECT<select value={selectedLesson.subject} onChange={(event) => { const next = availableLessons.find((item) => item.subject === event.target.value); if (next) updateSelectedLesson(next) }}>{[...new Set(availableLessons.map((item) => item.subject))].map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
          <label>LESSON<select value={selectedLesson.id} onChange={(event) => { const next = availableLessons.find((item) => item.id === event.target.value); if (next) updateSelectedLesson(next) }}>{(availableLessons.length ? availableLessons : [lesson]).filter((item) => item.grade === selectedLesson.grade && item.subject === selectedLesson.subject).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>TARGET LANGUAGE<select defaultValue={selectedLesson.targetLanguage}><option value="sat_Olck">Santali · Ol Chiki</option></select></label>
        </div>
      </section>
      <section className="panel lesson-detail-panel">
        <div className="lesson-detail-head"><div><span className="lesson-tag">{selectedLesson.id}</span><h2>{selectedLesson.title}</h2><p>{selectedLesson.subject} <span>·</span> Grade {selectedLesson.grade}</p></div><span className="duration-pill">{selectedLesson.duration}</span></div>
        <div className="outcome-box"><strong>Learning outcome</strong><p>{selectedLesson.learningOutcome}</p></div>
        <div className="lesson-columns"><div><h3>Lesson overview</h3><p>{selectedLesson.activities[0]}. Invite students to practice together and connect each activity to familiar classroom examples.</p></div><div><h3>Activities</h3><ul>{selectedLesson.activities.map((activity) => <li key={activity}><Check size={15} />{activity}</li>)}</ul></div></div>
        <div className="lesson-actions"><button className="button button-secondary" onClick={() => setPreview(!preview)}><BookOpen size={16} /> {preview ? 'Close preview' : 'Preview lesson'}</button><button className="button button-secondary" onClick={saveLesson}>{saved ? <Check size={16} /> : <CloudOff size={16} />}{saved ? 'Saved offline' : 'Save offline'}</button><button className="button button-primary" onClick={() => navigate('/bridge')}>Continue to language bridge <ArrowRight size={16} /></button></div>
        {preview && <div className="preview-content"><p className="eyebrow">TEACHER INSTRUCTIONS</p><p>{selectedLesson.learningOutcome} Use the language bridge for phrases only when a verified translation or live provider is available.</p></div>}
      </section>
    </>
  )
}

function LanguageBridge() {
  const { data: phraseData, loading: phrasesLoading, error: phrasesError } = useResource<{ translations: VerifiedDemoPhrase[] }>('/api/demo-translations')
  const [activeLesson] = useState<typeof lesson>(() => {
    try { return JSON.parse(localStorage.getItem('bhashasetu.currentLesson') ?? 'null') as typeof lesson ?? lesson } catch { return lesson }
  })
  const [sourceText, setSourceText] = useState('')
  const [speechStatus, setSpeechStatus] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [samplesOpen, setSamplesOpen] = useState(false)
  const [result, setResult] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [reverseText, setReverseText] = useState('')
  const [reverseResult, setReverseResult] = useState('')
  const [reverseNotice, setReverseNotice] = useState('')
  const [reverseBusy, setReverseBusy] = useState(false)
  const [translationId, setTranslationId] = useState('')
  const [validationStatus, setValidationStatus] = useState('unreviewed')
  const [editing, setEditing] = useState(false)
  const [editedResult, setEditedResult] = useState('')
  const [validationBusy, setValidationBusy] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const samplePhrases = [
    ...(phraseData?.translations.filter((phrase) => phrase.verified).map((phrase) => ({ id: phrase.id, text: phrase.hindiText, verified: true })) ?? []),
    ...inputOnlySamplePhrases.map((text, index) => ({ id: `input-${index + 1}`, text, verified: false })),
  ]

  useEffect(() => () => recognitionRef.current?.abort(), [])

  function recordSuccessfulTranslation(entry: { translationId: string; direction: string; sourceText: string; targetText: string; mode: string }) {
    try {
      const saved = JSON.parse(localStorage.getItem('bhashasetu.history') ?? '[]') as Array<typeof entry & { timestamp: string; validationStatus: string }>
      localStorage.setItem('bhashasetu.history', JSON.stringify([...saved, { ...entry, timestamp: new Date().toISOString(), validationStatus: 'unreviewed' }]))
    } catch {
      setNotice('Translation completed, but this device could not save it to history.')
    }
  }

  async function translate() {
    if (!sourceText.trim()) {
      setNotice('Enter or dictate a Hindi phrase to continue.')
      return
    }
    setBusy(true)
    setResult('')
    setTranslationId('')
    setValidationStatus('unreviewed')
    setEditing(false)
    setNotice('')
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText.trim(),
          direction: 'hi-to-sat',
          context: { grade: activeLesson.grade, subject: activeLesson.subject, topic: activeLesson.title, learningOutcome: activeLesson.learningOutcome },
        }),
      })
      if (!response.ok) throw new Error('Translation API unavailable')
      const payload: { translationAvailable: boolean; translatedText?: string; message?: string; translationId?: string; mode?: string } = await response.json()
      if (payload.translationAvailable && payload.translatedText) {
        setResult(payload.translatedText)
        const id = payload.translationId ?? `local-${Date.now()}`
        setTranslationId(id)
        setEditedResult(payload.translatedText)
        setValidationStatus('unreviewed')
        recordSuccessfulTranslation({ translationId: id, direction: 'hi-to-sat', sourceText: sourceText.trim(), targetText: payload.translatedText, mode: payload.mode ?? 'demo' })
      }
      else setNotice(payload.message ?? 'Live translation service required for this phrase.')
    } catch {
      setNotice('Live translation is temporarily unavailable. Your Hindi text is still here; try again when connected.')
    } finally {
      setBusy(false)
    }
  }

  async function translateReverse() {
    if (!reverseText.trim()) {
      setReverseNotice('Type Santali instead — speech recognition is not configured.')
      return
    }
    setReverseBusy(true)
    setReverseResult('')
    setReverseNotice('')
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: reverseText.trim(),
          direction: 'sat-to-hi',
          context: { grade: activeLesson.grade, subject: activeLesson.subject, topic: activeLesson.title, learningOutcome: activeLesson.learningOutcome },
        }),
      })
      if (!response.ok) throw new Error('Translation API unavailable')
      const payload: { translationAvailable: boolean; translatedText?: string; message?: string; translationId?: string; mode?: string } = await response.json()
      if (payload.translationAvailable && payload.translatedText) {
        setReverseResult(payload.translatedText)
        recordSuccessfulTranslation({ translationId: payload.translationId ?? `local-${Date.now()}`, direction: 'sat-to-hi', sourceText: reverseText.trim(), targetText: payload.translatedText, mode: payload.mode ?? 'demo' })
      } else setReverseNotice(payload.message ?? 'Live translation service required for this phrase.')
    } catch {
      setReverseNotice('Live translation is temporarily unavailable. Try again when connected.')
    } finally {
      setReverseBusy(false)
    }
  }

  async function validateTranslation(status: 'accepted' | 'edited') {
    if (!translationId) return
    const reviewedText = status === 'edited' ? editedResult.trim() : undefined
    if (status === 'edited' && !reviewedText) {
      setNotice('Enter the teacher-reviewed translation before saving the edit.')
      return
    }
    setValidationBusy(true)
    try {
      const response = await fetch('/api/translation/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translationId, status, ...(reviewedText ? { reviewedText } : {}) }),
      })
      if (!response.ok) throw new Error('Teacher validation could not be saved.')
      const updated: { targetText: string; validationStatus: string } = await response.json()
      setResult(updated.targetText)
      setEditedResult(updated.targetText)
      setValidationStatus(updated.validationStatus)
      setEditing(false)
      setNotice('Teacher validation saved.')
      const saved = JSON.parse(localStorage.getItem('bhashasetu.history') ?? '[]') as Array<{ translationId: string; targetText: string; validationStatus: string }>
      localStorage.setItem('bhashasetu.history', JSON.stringify(saved.map((item) => item.translationId === translationId ? { ...item, targetText: updated.targetText, validationStatus: updated.validationStatus } : item)))
    } catch (validationError) {
      setNotice(validationError instanceof Error ? validationError.message : 'Teacher validation could not be saved.')
    } finally {
      setValidationBusy(false)
    }
  }

  function selectSamplePhrase(phrase: string) {
    setSourceText(phrase)
    setSamplesOpen(false)
    setResult('')
    setNotice('')
    setTranslationId('')
    setValidationStatus('unreviewed')
    setEditing(false)
  }

  function dictate() {
    if (isListening) {
      recognitionRef.current?.stop()
      setSpeechStatus('Finishing speech recognition…')
      return
    }
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechStatus('Hindi speech recognition is not supported in this browser. Type your phrase instead.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => {
      setIsListening(true)
      setSpeechStatus('Listening in Hindi… Speak now, or tap to stop.')
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) {
        setSourceText(transcript)
        setNotice('')
        setSpeechStatus('Speech captured. Review the Hindi text, then translate.')
      } else {
        setSpeechStatus('No words were recognized. Try again or type your phrase.')
      }
    }
    recognition.onerror = (event) => {
      setIsListening(false)
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access was denied. Allow microphone access for this site, then try again.',
        'service-not-allowed': 'The browser speech service is blocked here. Type your Hindi phrase instead.',
        'audio-capture': 'No microphone was detected. Check your device, or type your Hindi phrase instead.',
        'no-speech': 'No speech was detected. Move closer to the microphone and try again.',
        network: 'Hindi speech recognition needs a network connection. Type your phrase or reconnect and retry.',
        aborted: 'Speech recognition was cancelled. Tap the microphone to try again.',
      }
      setSpeechStatus(messages[event.error ?? ''] ?? `Speech recognition failed${event.error ? ` (${event.error})` : ''}. Type your Hindi phrase instead.`)
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      setSpeechStatus((status) => status.startsWith('Listening in Hindi') ? 'Speech stopped. Type a phrase or try the microphone again.' : status)
    }
    recognitionRef.current = recognition
    setSpeechStatus('Requesting microphone access…')
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setIsListening(false)
      setSpeechStatus('Could not start speech recognition. Check site microphone permission or type instead.')
    }
  }

  function playHindi() {
    if (!sourceText.trim() || !('speechSynthesis' in window)) {
      setNotice('Hindi audio is not available for this text on this device.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(sourceText)
    utterance.lang = 'hi-IN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      <div className="page-heading bridge-heading"><div><p className="eyebrow">CLASSROOM TOOL · GRADE {activeLesson.grade} FLN</p><h1>Language bridge</h1><p className="muted">Hindi to Santali · lesson context applied</p></div><span className="live-badge"><span className="status-dot online" /> DEMO MODE</span></div>
      <div className="context-bar"><BookOpen size={17} /><span><strong>{activeLesson.title}</strong><small>Grade {activeLesson.grade} · {activeLesson.subject}</small></span><span className="context-language">Hindi <ArrowRight size={14} /> Santali · Ol Chiki</span></div>
      <div className="bridge-grid">
        <section className="panel language-panel source-panel">
          <div className="language-heading"><div className="language-avatar hindi-avatar">अ</div><div><p className="eyebrow">TEACHER</p><h2>Hindi</h2></div><span className="language-tag">SOURCE</span></div>
          <button className={isListening ? 'mic-action is-listening' : 'mic-action'} type="button" aria-pressed={isListening} aria-label={isListening ? 'Stop Hindi speech recognition' : speechStatus ? 'Retry Hindi speech recognition' : 'Speak in Hindi'} onClick={dictate}><span className="mic-action-icon"><Mic size={24} /></span><span><strong>{isListening ? 'Listening in Hindi…' : speechStatus && !speechStatus.startsWith('Speech captured') ? 'Try microphone again' : speechStatus ? 'Speak again' : 'Speak in Hindi'}</strong><small aria-live="polite">{speechStatus || 'Use your microphone, or type below'}</small></span></button>
          <label className="input-label" htmlFor="hindi-input">Recognized Hindi · text fallback</label>
          <textarea id="hindi-input" value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="आज हम संख्या सीखेंगे।" rows={4} />
          <div className="sample-phrase-picker">
            <button className="sample-phrase-toggle" type="button" aria-expanded={samplesOpen} onClick={() => setSamplesOpen((open) => !open)}>Sample Hindi phrases <span>{phrasesLoading ? '…' : samplePhrases.length}</span><ChevronDown size={15} /></button>
            {samplesOpen && <div className="sample-phrase-list">{phrasesError && !phraseData && <p className="sample-phrase-feedback">Verified samples could not load; input-only examples remain available.</p>}{samplePhrases.map((phrase) => <button className="sample-phrase" key={phrase.id} type="button" disabled={busy} onClick={() => selectSamplePhrase(phrase.text)}><span>{phrase.text}</span><small className={phrase.verified ? 'sample-phrase-status is-verified' : 'sample-phrase-status'}>{phrase.verified ? 'Verified Demo' : 'Input sample'}</small></button>)}</div>}
          </div>
          <div className="input-foot"><span>Hindi browser speech needs microphone permission and internet.</span><button className="text-button" onClick={playHindi}><Volume2 size={15} /> Play Hindi</button></div>
          <button className="button button-primary translate-button" onClick={translate} disabled={busy}>{busy ? 'Checking providers...' : 'Translate with lesson context'}<ArrowRight size={16} /></button>
        </section>
        <section className="bridge-flow" aria-label="Translation direction">
          <p className="eyebrow">BHASHASETU LANGUAGE BRIDGE</p>
          <div className="flow-lesson"><BookOpen size={16} /><span><strong>{activeLesson.title}</strong><small>Grade {activeLesson.grade} · lesson context</small></span></div>
          <div className="flow-route"><span>Hindi</span><div className="flow-connector"><i /><span><Languages size={19} /></span><i /><small>BhashaSetu</small></div><span>Ol Chiki</span></div>
          <p className="flow-provider"><span className={phraseData?.translations.length ? 'status-dot online' : 'status-dot offline'} />{phraseData?.translations.length ? `${phraseData.translations.length} verified Demo phrases · live provider not configured` : 'Live translation provider not configured'}</p>
        </section>
        <section className="panel language-panel target-panel">
          <div className="language-heading"><div className="language-avatar santali-avatar">ᱚ</div><div><p className="eyebrow">STUDENT</p><h2>Santali</h2></div><span className="language-tag">OL CHIKI</span></div>
          <div className="translation-result" aria-live="polite"><span className="result-label">SANTALI / OL CHIKI</span><div className={`translation-output ${result ? 'has-result' : 'has-empty-state'}`}>{editing ? <textarea className="translation-edit" value={editedResult} onChange={(event) => setEditedResult(event.target.value)} aria-label="Edit Santali translation" /> : result || <div className={notice ? 'output-empty-state has-notice' : 'output-empty-state'}><span className="output-empty-icon">{notice ? <ShieldCheck size={19} /> : <Languages size={19} />}</span><strong>{notice || (sourceText.trim() ? 'Phrase ready to check' : 'Santali output appears here')}</strong><small>{notice ? 'No verified local phrase or live translation provider is available for this request.' : sourceText.trim() ? 'Choose Translate with lesson context to check for a verified phrase.' : 'Enter or select a Hindi phrase to begin.'}</small></div>}</div></div>
          <details className="original-disclosure"><summary><span>Original Hindi</span><ChevronDown size={15} /></summary><p lang="hi">{sourceText || 'No Hindi phrase entered yet.'}</p></details>
          {notice && <div className="bridge-error-actions"><button className="text-button" onClick={() => void translate()} disabled={busy}>Retry</button><NavLink className="text-button" to="/offline">Continue with saved offline content</NavLink></div>}
          <div className="output-actions"><button className="button button-secondary bridge-action" disabled={!result} title="Santali audio provider is not configured"><Volume2 size={16} /> Play audio</button>{result && translationId ? <><button className="button button-primary bridge-action" onClick={() => editing ? void validateTranslation('edited') : void validateTranslation('accepted')} disabled={validationBusy}>{validationBusy ? 'Saving...' : editing ? 'Save edit' : 'Accept'}</button><button className="button button-secondary bridge-action" onClick={() => { setEditing(!editing); setEditedResult(result) }} disabled={validationBusy}>{editing ? 'Cancel edit' : 'Edit'}</button><button className="text-button" onClick={() => void translate()} disabled={busy}>Retry</button></> : <span className="validation-label">{result ? validationStatus : 'Awaiting verified translation'}</span>}</div>
        </section>
      </div>
      <section className="panel reverse-panel"><div className="reverse-intro"><span className="reverse-icon"><ArrowDownLeft size={19} /></span><div><h2>Student to teacher</h2><p>Reverse translation is text-only until a Santali speech provider is configured.</p></div></div><div className="reverse-entry"><input value={reverseText} onChange={(event) => setReverseText(event.target.value)} placeholder="Type Santali text in Ol Chiki" aria-label="Santali text input"/><button className="button button-secondary" onClick={translateReverse} disabled={reverseBusy}>{reverseBusy ? 'Checking...' : 'Convert to Hindi'} <ArrowRight size={15} /></button>{reverseResult && <p className="reverse-feedback" aria-live="polite">{reverseResult}</p>}{reverseNotice && <div className="reverse-feedback" aria-live="polite"><span>{reverseNotice}</span><button className="text-button" onClick={() => void translateReverse()} disabled={reverseBusy}>Retry</button></div>}</div></section>
    </>
  )
}

function ComingSoon() {
  const current = navigation.find((item) => item.path === window.location.pathname)
  const title = current?.label ?? (window.location.pathname === '/settings' ? 'Settings' : 'Workspace')
  return <div className="coming-page"><span className="coming-icon"><BookOpen size={24} /></span><p className="eyebrow">BHASHASETU WORKSPACE</p><h1>{title}</h1><p className="muted">This workspace area is being prepared. The current prototype keeps translations and classroom records honest: no unverified Santali content is shown.</p><div className="coming-status"><Wifi size={17} /><span>Demo mode is active</span><span className="coming-divider" /><span>Five verified phrase pairs available</span></div></div>
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
  interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    onstart: (() => void) | null
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start(): void
    stop(): void
    abort(): void
  }
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList
  }
}

export default App
