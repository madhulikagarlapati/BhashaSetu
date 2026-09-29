import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { z } from 'zod'
import { demoTranslations, flashcards, lessons, verifiedDemoTranslations } from './demoData.js'

const app = express()
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
type TranslationRecord = {
  translationId: string
  timestamp: string
  direction: 'hi-to-sat' | 'sat-to-hi'
  sourceText: string
  targetText: string
  mode: 'demo'
  validationStatus: 'unreviewed' | 'accepted' | 'edited' | 'rejected'
  audioAvailable: false
}
const translationHistory: TranslationRecord[] = []
const translationContextSchema = z.object({
  grade: z.number().int().min(1).max(12),
  subject: z.string().trim().min(1).max(100),
  topic: z.string().trim().min(1).max(120),
  learningOutcome: z.string().trim().min(1).max(500),
})

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', mode: 'demo', translationProviderConfigured: false })
})

app.get('/api/demo-translations', (_request, response) => {
  response.json({ translations: demoTranslations })
})

app.get('/api/dashboard', (_request, response) => {
  response.json({
    teacher: { name: 'Ananya Kumari', role: 'Primary Teacher', school: 'Government Primary School', grade: 2, subject: 'Foundational Literacy & Numeracy' },
    class: { enrolled: 24, present: 22 },
    currentLesson: lessons[0],
    counts: { worksheets: 0, flashcards: flashcards.length, savedOffline: 0 },
    mode: 'demo',
  })
})

app.get('/api/lessons', (_request, response) => response.json({ lessons }))

app.get('/api/lessons/:id', (request, response) => {
  const requestedLesson = lessons.find((lesson) => lesson.id === request.params.id)
  if (!requestedLesson) {
    response.status(404).json({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found.' } })
    return
  }
  response.json(requestedLesson)
})

app.get('/api/materials', (_request, response) => {
  response.json({ lessons: lessons.length, worksheets: [], flashcards: flashcards.length, verifiedTranslationPhrases: demoTranslations.length })
})

app.get('/api/worksheets', (_request, response) => response.json({ worksheets: [] }))

app.post('/api/worksheets/generate', (request, response) => {
  const schema = z.object({
    grade: z.number().int().min(1).max(12),
    subject: z.string().trim().min(1).max(100),
    lesson: z.string().trim().min(1).max(120),
    learningOutcome: z.string().trim().min(1).max(500),
    difficulty: z.enum(['beginner', 'developing', 'secure']),
    questionCount: z.number().int().min(1).max(20),
    sourceLanguage: z.literal('hi'),
    targetLanguage: z.literal('sat_Olck'),
  })
  const parsed = schema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: { code: 'INVALID_WORKSHEET_REQUEST', message: 'Check the worksheet fields and try again.', details: parsed.error.issues } })
    return
  }

  const { questionCount, lesson, grade, subject, learningOutcome, difficulty } = parsed.data
  const prompts = [
    (number: number) => `संख्या ${number} पहचानें।`,
    (number: number) => `गिनती पूरी करें: ${number - 1}, __, ${number + 1}।`,
    (number: number) => `अंक ${number} को ${number} वस्तुओं के समूह से मिलाएँ।`,
  ]
  const questions = Array.from({ length: questionCount }, (_, index) => {
    const number = (index % 10) + 1
    return {
      id: `Q-${String(index + 1).padStart(2, '0')}`,
      type: ['number-recognition', 'fill-in-the-blank', 'matching'][index % prompts.length],
      prompt: prompts[index % prompts.length](number),
      targetPrompt: null,
      answer: String(number),
      illustration: { kind: 'numeral', value: String(number) },
      translationAvailable: false,
    }
  })
  response.status(201).json({
    id: `WS-${Date.now()}`,
    mode: 'demo',
    grade,
    subject,
    lessonTitle: lesson,
    learningOutcome,
    difficulty,
    sourceLanguage: 'hi',
    targetLanguage: 'sat_Olck',
    vocabulary: [],
    questions,
    translationNotice: 'Santali prompts require verified phrase data or a configured live translation service.',
  })
})

app.get('/api/flashcards', (_request, response) => response.json({ flashcards }))

app.get('/api/flashcards/:id', (request, response) => {
  const card = flashcards.find((item) => item.id === request.params.id)
  if (!card) {
    response.status(404).json({ error: { code: 'FLASHCARD_NOT_FOUND', message: 'Flashcard not found.' } })
    return
  }
  response.json(card)
})

app.post('/api/translate', (request, response) => {
  const schema = z.object({
    text: z.string().trim().min(1).max(1000),
    direction: z.enum(['hi-to-sat', 'sat-to-hi']),
    context: translationContextSchema,
  })
  const parsed = schema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: { code: 'INVALID_TRANSLATION_REQUEST', message: 'Provide text and a valid lesson context.', details: parsed.error.issues } })
    return
  }
  const phrase = verifiedDemoTranslations.find((item) => item.sourceText === parsed.data.text && item.direction === parsed.data.direction)
  if (phrase) {
    const record: TranslationRecord = {
      translationId: `DEMO-TRANS-${Date.now()}`,
      timestamp: new Date().toISOString(),
      direction: parsed.data.direction,
      sourceText: parsed.data.text,
      targetText: phrase.translatedText,
      mode: 'demo',
      validationStatus: 'unreviewed',
      audioAvailable: false,
    }
    translationHistory.unshift(record)
    if (translationHistory.length > 250) translationHistory.pop()
    response.json({ translationAvailable: true, translatedText: record.targetText, translationId: record.translationId, mode: 'demo', validationStatus: record.validationStatus })
    return
  }
  response.json({
    translationAvailable: false,
    mode: 'demo',
    message: 'Live translation service required for this phrase.',
    providerConfigured: false,
  })
})

app.post('/api/translation/validate', (request, response) => {
  const schema = z.object({ translationId: z.string().trim().min(1).max(100), status: z.enum(['accepted', 'edited', 'rejected']), reviewedText: z.string().trim().max(1000).optional() }).superRefine((value, context) => {
    if (value.status === 'edited' && !value.reviewedText) context.addIssue({ code: 'custom', message: 'Edited text is required when saving an edit.', path: ['reviewedText'] })
  })
  const parsed = schema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: { code: 'INVALID_VALIDATION_REQUEST', message: 'Provide a translation ID and validation status.', details: parsed.error.issues } })
    return
  }
  const record = translationHistory.find((item) => item.translationId === parsed.data.translationId)
  if (!record) {
    response.status(404).json({ error: { code: 'TRANSLATION_NOT_FOUND', message: 'No live or verified translation is available to validate.' } })
    return
  }
  record.validationStatus = parsed.data.status
  if (parsed.data.status === 'edited' && parsed.data.reviewedText) record.targetText = parsed.data.reviewedText
  response.json(record)
})

app.get('/api/history', (_request, response) => response.json({ history: translationHistory }))

app.get('/api/offline-pack', (_request, response) => {
  response.json({
    mode: 'demo',
    generatedAt: new Date().toISOString(),
    languagePack: { source: 'hi', target: 'sat_Olck', liveTranslationAvailable: false },
    lessons,
    worksheets: [],
    flashcards: flashcards.map((card) => ({ ...card, offlineAvailable: true })),
    audio: [],
    savedPhrases: demoTranslations,
    notice: 'The pack contains lesson metadata, Hindi-side flashcards, and five verified classroom phrase pairs. No Santali translation model or audio is bundled.',
  })
})

app.post('/api/offline-pack/sync', (_request, response) => {
  response.json({
    status: 'ready-to-save',
    pack: {
      lessons,
      worksheets: [],
      flashcards: flashcards.map((card) => ({ ...card, offlineAvailable: true })),
      savedPhrases: demoTranslations,
      audio: [],
      notice: 'Saved lesson metadata, Hindi-side flashcards, and five verified classroom phrase pairs. No Santali translation model or audio is bundled.',
    },
    message: 'Resources are ready to save locally.',
  })
})

app.get('/api/settings', (_request, response) => {
  response.json({ mode: 'demo', sourceLanguage: 'hi', targetLanguage: 'sat_Olck', translationProviderConfigured: false, santaliSpeechRecognitionConfigured: false, santaliTextToSpeechConfigured: false })
})

app.use((_request, response) => {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } })
})

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error('API request failed:', error)
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' } })
}
app.use(errorHandler)

export { app }