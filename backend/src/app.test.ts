import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from './app.js'

describe('Demo Mode API', () => {
  it('reports health without claiming a live translation provider', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ status: 'ok', mode: 'demo', translationProviderConfigured: false })
  })

  it('returns structured lessons and lesson detail', async () => {
    const response = await request(app).get('/api/lessons')
    expect(response.status).toBe(200)
    expect(response.body.lessons).toHaveLength(10)
    expect(response.body.lessons[0].id).toBe('LESSON-FLN-001')

    const detail = await request(app).get('/api/lessons/LESSON-FLN-001')
    expect(detail.status).toBe(200)
    expect(detail.body.title).toBe('Numbers 1-10')
  })

  it('does not invent a Santali translation for an unsupported phrase', async () => {
    const response = await request(app).post('/api/translate').send({
      text: 'आज हम संख्या सीखेंगे।',
      direction: 'hi-to-sat',
      context: { grade: 2, subject: 'FLN', topic: 'Numbers 1-10', learningOutcome: 'Recognize numbers from 1 to 10.' },
    })
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      translationAvailable: false,
      mode: 'demo',
      message: 'Live translation service required for this phrase.',
    })
    expect(response.body.translatedText).toBeUndefined()
  })

  it('rejects malformed translation requests', async () => {
    const response = await request(app).post('/api/translate').send({ text: '', direction: 'unknown' })
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_TRANSLATION_REQUEST')
  })

  it('rejects incomplete edits and unknown translation validation IDs', async () => {
    const incompleteEdit = await request(app).post('/api/translation/validate').send({ translationId: 'missing-record', status: 'edited' })
    expect(incompleteEdit.status).toBe(400)

    const unknownRecord = await request(app).post('/api/translation/validate').send({ translationId: 'missing-record', status: 'accepted' })
    expect(unknownRecord.status).toBe(404)
    expect(unknownRecord.body.error.code).toBe('TRANSLATION_NOT_FOUND')
  })

  it('generates deterministic Hindi-side worksheet questions', async () => {
    const response = await request(app).post('/api/worksheets/generate').send({
      grade: 2,
      subject: 'FLN',
      lesson: 'Numbers 1-10',
      learningOutcome: 'Recognize numbers from 1 to 10.',
      difficulty: 'beginner',
      questionCount: 5,
      sourceLanguage: 'hi',
      targetLanguage: 'sat_Olck',
    })
    expect(response.status).toBe(201)
    expect(response.body.questions).toHaveLength(5)
    expect(response.body.questions.every((question: { targetPrompt: null; translationAvailable: boolean }) => question.targetPrompt === null && !question.translationAvailable)).toBe(true)
  })

  it('returns flashcards and an empty history without claiming saved records', async () => {
    const cards = await request(app).get('/api/flashcards')
    expect(cards.status).toBe(200)
    expect(cards.body.flashcards).toHaveLength(10)
    expect(cards.body.flashcards[0].translationAvailable).toBe(false)

    const history = await request(app).get('/api/history')
    expect(history.status).toBe(200)
    expect(history.body.history).toEqual([])
  })

  it('returns an offline pack that discloses missing translation and audio assets', async () => {
    const response = await request(app).get('/api/offline-pack')
    expect(response.status).toBe(200)
    expect(response.body.lessons).toHaveLength(10)
    expect(response.body.savedPhrases).toHaveLength(5)
    expect(response.body.languagePack.liveTranslationAvailable).toBe(false)
    expect(response.body.audio).toEqual([])
  })

  it('returns a complete local-save payload without claiming cloud synchronization', async () => {
    const response = await request(app).post('/api/offline-pack/sync').send({})
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ready-to-save')
    expect(response.body.pack.lessons).toHaveLength(10)
    expect(response.body.pack.savedPhrases).toHaveLength(5)
    expect(response.body.pack.audio).toEqual([])
  })

  it('serves verified phrase samples and translates exact pairs in both directions', async () => {
    const samples = await request(app).get('/api/demo-translations')
    expect(samples.status).toBe(200)
    expect(samples.body.translations).toHaveLength(5)
    expect(samples.body.translations.every((item: { verified: boolean; script: string }) => item.verified && item.script === 'Ol Chiki')).toBe(true)

    const sample = samples.body.translations[0] as { hindiText: string; santaliText: string }
    const context = { grade: 2, subject: 'FLN', topic: 'Classroom phrases', learningOutcome: 'Understand common classroom communication.' }
    const forward = await request(app).post('/api/translate').send({ text: sample.hindiText, direction: 'hi-to-sat', context })
    expect(forward.status).toBe(200)
    expect(forward.body).toMatchObject({ translationAvailable: true, translatedText: sample.santaliText, mode: 'demo' })

    const reverse = await request(app).post('/api/translate').send({ text: sample.santaliText, direction: 'sat-to-hi', context })
    expect(reverse.status).toBe(200)
    expect(reverse.body).toMatchObject({ translationAvailable: true, translatedText: sample.hindiText, mode: 'demo' })
  })
})