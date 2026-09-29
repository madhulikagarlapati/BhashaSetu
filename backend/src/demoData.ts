export type Lesson = {
  id: string
  grade: number
  subject: string
  title: string
  learningOutcome: string
  targetLanguage: string
  durationMinutes: number
  activities: string[]
}

export const lessons: Lesson[] = [
  { id: 'LESSON-FLN-001', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Numbers 1-10', learningOutcome: 'Students identify and recognize numbers from 1 to 10.', targetLanguage: 'sat_Olck', durationMinutes: 35, activities: ['Number recognition', 'Count classroom objects', 'Match quantity to numeral'] },
  { id: 'LESSON-FLN-002', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Alphabet Recognition', learningOutcome: 'Students identify selected letters and connect them to familiar words.', targetLanguage: 'sat_Olck', durationMinutes: 35, activities: ['Letter hunt', 'Sound and symbol match', 'Trace selected letters'] },
  { id: 'LESSON-FLN-003', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Counting Objects', learningOutcome: 'Students count up to ten objects using one-to-one correspondence.', targetLanguage: 'sat_Olck', durationMinutes: 30, activities: ['Count classroom objects', 'Group objects', 'Compare two groups'] },
  { id: 'LESSON-FLN-004', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Colors Around Us', learningOutcome: 'Students identify and sort familiar objects by color.', targetLanguage: 'sat_Olck', durationMinutes: 30, activities: ['Find a color', 'Sort objects', 'Describe an object'] },
  { id: 'LESSON-FLN-005', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Basic Shapes', learningOutcome: 'Students recognize circles, squares, triangles, and rectangles in their surroundings.', targetLanguage: 'sat_Olck', durationMinutes: 35, activities: ['Shape walk', 'Sort shape cards', 'Build a picture'] },
  { id: 'LESSON-FLN-006', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Classroom Instructions', learningOutcome: 'Students follow and respond to common classroom instructions.', targetLanguage: 'sat_Olck', durationMinutes: 25, activities: ['Listen and act', 'Sequence instructions', 'Pair practice'] },
  { id: 'LESSON-FLN-007', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Greetings', learningOutcome: 'Students recognize appropriate greetings for common classroom situations.', targetLanguage: 'sat_Olck', durationMinutes: 25, activities: ['Greeting circle', 'Situation matching', 'Pair practice'] },
  { id: 'LESSON-FLN-008', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Animals Around Us', learningOutcome: 'Students identify familiar animals and group them by observable features.', targetLanguage: 'sat_Olck', durationMinutes: 35, activities: ['Picture observation', 'Sort animal groups', 'Describe an animal'] },
  { id: 'LESSON-FLN-009', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Body Parts', learningOutcome: 'Students identify common body parts and describe simple functions.', targetLanguage: 'sat_Olck', durationMinutes: 30, activities: ['Point and name', 'Match part to action', 'Draw and label'] },
  { id: 'LESSON-FLN-010', grade: 2, subject: 'Foundational Literacy & Numeracy', title: 'Simple Addition', learningOutcome: 'Students combine two small groups and represent the total with numerals.', targetLanguage: 'sat_Olck', durationMinutes: 35, activities: ['Combine counters', 'Draw two groups', 'Complete addition sentences'] },
]

const numberWordsHindi = ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस']

export const flashcards = Array.from({ length: 10 }, (_, index) => ({
  id: `CARD-NUM-${String(index + 1).padStart(2, '0')}`,
  lessonId: 'LESSON-FLN-001',
  category: 'Numbers 1-10',
  numeral: String(index + 1),
  hindiText: numberWordsHindi[index + 1],
  targetLanguage: 'sat_Olck',
  translationAvailable: false,
  audioAvailable: false,
  offlineAvailable: false,
}))

export type DemoTranslation = {
  id: string
  category: string
  hindiText: string
  santaliText: string
  script: 'Ol Chiki'
  verified: true
}

export const demoTranslations: DemoTranslation[] = [
  { id: 'demo-001', category: 'Introduction', hindiText: 'आपका नाम क्या है?', santaliText: 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?', script: 'Ol Chiki', verified: true },
  { id: 'demo-002', category: 'Classroom', hindiText: 'आप किस कक्षा में पढ़ते हैं?', santaliText: 'ᱟᱢ ᱫᱚ ᱚᱠᱟ ᱪᱟᱱᱚᱪ ᱨᱮᱢ ᱚᱞᱚᱜ ᱠᱟᱱᱟ?', script: 'Ol Chiki', verified: true },
  { id: 'demo-003', category: 'Classroom', hindiText: 'मैं कक्षा 6 में पढ़ता हूँ।', santaliText: 'ᱤᱧ ᱫᱚ ᱛᱩᱨᱩᱭ ᱪᱟᱱᱚᱪ ᱨᱤᱧ ᱚᱞᱚᱜ ᱠᱟᱱᱟ ᱾', script: 'Ol Chiki', verified: true },
  { id: 'demo-004', category: 'Student Information', hindiText: 'आप कहाँ रहते हैं?', santaliText: 'ᱟᱢ ᱫᱚ ᱚᱠᱟᱨᱮᱢ ᱛᱟᱦᱮᱱᱟ?', script: 'Ol Chiki', verified: true },
  { id: 'demo-005', category: 'Classroom Communication', hindiText: 'मुझे समझ नहीं आया।', santaliText: 'ᱤᱧ ᱫᱚ ᱵᱩᱡᱷᱤ ᱵᱟᱭ ᱾', script: 'Ol Chiki', verified: true },
]

export const verifiedDemoTranslations: Array<{
  sourceText: string
  translatedText: string
  direction: 'hi-to-sat' | 'sat-to-hi'
  sourceReference: string
}> = demoTranslations.flatMap((item) => [
  { sourceText: item.hindiText, translatedText: item.santaliText, direction: 'hi-to-sat' as const, sourceReference: item.id },
  { sourceText: item.santaliText, translatedText: item.hindiText, direction: 'sat-to-hi' as const, sourceReference: item.id },
])