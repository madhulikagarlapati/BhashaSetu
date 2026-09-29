# BhashaSetu

**Bridging Languages. Enabling Learning.**

BhashaSetu is an early-stage classroom assistant concept for Hindi-speaking primary teachers supporting Santali-speaking learners. The prototype focuses on a Grade 2 Foundational Literacy and Numeracy lesson and is explicit about which language services are not configured.

## Current Prototype

- Responsive teacher workspace with Dashboard, Classroom, and Language Bridge routes.
- Typed React/Vite frontend and a separate Express REST API.
- Lesson metadata and deterministic worksheet generation in Demo Mode.
- Browser Hindi speech recognition and native/browser Hindi speech output when supported by the device.
- Local lesson/session save for the classroom demonstration.
- Demo translation provider returns the five supplied verified Hindi–Santali phrase pairs in both directions and refuses unsupported phrases; no other Santali translations or audio are fabricated.
- API endpoints return explicit provider and offline-pack availability.

Several navigation destinations are placeholders while the prototype is built in phases. A persistent database, live Bhashini/IndicTrans integration, verified Santali phrase corpus, Santali ASR/TTS, and full offline synchronization are not implemented yet.

## Architecture

```text
frontend/  React 19, TypeScript, Vite, React Router, Lucide
    |      Vite development proxy (/api -> localhost:4174)
backend/   Express 5, TypeScript, Zod validation, Helmet, CORS
    |      In-memory structured Demo Mode data
data       Five verified classroom phrase pairs supplied for Demo Mode
```

The frontend never receives provider credentials. The API uses strict request schemas and reports Demo Mode until a real provider is implemented and configured.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Run Locally

From the repository root:

```powershell
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173`; the API listens at `http://localhost:4174`. The Vite proxy forwards `/api` requests to the API. No API key is required for Demo Mode.

Optional backend configuration: copy `.env.example` to `backend/.env`. Never commit `.env` files. The provider variables are placeholders and do not activate a live service in this prototype.

## Commands

```powershell
npm run build
npm test
npm run lint
```

`npm test` runs API tests for health, lessons, translation refusal, validation, worksheet generation, flashcards, and offline-pack disclosure.

## API

| Method | Route | Current behavior |
| --- | --- | --- |
| GET | `/api/health` | API status and Demo Mode provider availability |
| GET | `/api/dashboard` | Teacher/class summary and current lesson |
| GET | `/api/lessons` | Structured lesson list |
| GET | `/api/lessons/:id` | Lesson details |
| GET | `/api/materials` | Available lesson and material counts |
| GET | `/api/worksheets` | Saved worksheet list (currently empty) |
| POST | `/api/worksheets/generate` | Deterministic Hindi-side worksheet; target prompts remain unavailable until verified |
| GET | `/api/flashcards` | Hindi-side number cards with Santali/audio availability flags |
| GET | `/api/flashcards/:id` | One flashcard |
| GET | `/api/demo-translations` | The five verified Demo Mode phrase pairs |
| POST | `/api/translate` | Exact verified local lookup in either direction, otherwise the required live-service message |
| POST | `/api/translation/validate` | Reports when there is no translation record to validate |
| GET | `/api/history` | Translation history (currently empty) |
| GET | `/api/offline-pack` | Available lesson/card data and explicit missing-resource notices |
| POST | `/api/offline-pack/sync` | Returns resources ready for local saving; does not claim background sync |
| GET | `/api/settings` | Current provider and language capability flags |

Malformed API requests return a structured `400` response; missing resources return `404`.

## Modes and Limitations

- **Demo Mode:** Uses local lesson metadata, deterministic Hindi-side worksheet/card content, and five supplied verified Santali phrase pairs. Other Santali translations remain unavailable unless a live provider is configured.
- **Live Mode:** Not available yet. `TRANSLATION_API_URL`, `BHASHINI_API_URL`, and `BHASHINI_API_KEY` are placeholders only; no external requests are made.
- **Offline:** The classroom can save its selected lesson and active session in browser local storage. This is not an offline AI translation model, complete resource sync, or durable cross-device storage.
- **Speech:** Hindi recognition uses browser support when present. Santali recognition and Santali TTS are not configured. Hindi audio uses the device's speech synthesis where available.
- **Persistence:** API demo records are in memory; the API does not use a database. Browser-local classroom state remains on that device.

## GitHub Safety

Secrets and environment files are ignored by Git. Review the staged diff before publishing, especially if adding credentials or real classroom data. Do not upload student-identifiable data or unverified translations.