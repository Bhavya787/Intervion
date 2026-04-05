# Intervion

Intervion is an AI-powered interview and hiring platform built for two audiences:

- Students can practice interviews, solve coding questions, upload resumes, and collaborate in study rooms.
- Companies can create job openings, define interview rounds, review applications, and track hiring progress.

The project combines interview practice, hiring workflows, and real-time collaboration in one full-stack application.

## Core Features

- AI-powered practice interviews with follow-up responses and result summaries
- Resume text extraction and resume formatting support
- Student job discovery and application tracking
- Company job creation with round-based hiring workflows
- Protected, role-based student and company dashboards
- Study rooms with live chat, whiteboard collaboration, and collaborative coding
- Coding practice and MCQ generation for interview preparation
- Light and dark theme support

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router, React Query
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB with Mongoose
- AI: Multi-provider AI service with OpenRouter, Groq, and Gemini fallback support
- File handling: Firebase Storage, PDF parsing
- Realtime collaboration: Socket.IO, Monaco Editor, tldraw

## Project Structure

```text
Intervion/
|- client/   # React + Vite frontend
|- server/   # Express API + Socket.IO backend
|- docs/     # Supporting project documentation
```

## Available Product Areas

### Student experience

- Authentication and profile management
- Practice interviews and interview result history
- Resume upload and resume text updates
- Job browsing and application tracking
- Study rooms with:
  - real-time chat
  - shared whiteboard
  - collaborative code editor
- MCQ and coding practice pages

### Company experience

- Company dashboard
- Job creation and job management
- Candidate application review
- Multi-round interview workflow handling
- Interview scheduling and application status updates

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string
- At least one AI provider key:
  - OpenRouter free router
  - Groq
  - Gemini
- Firebase project credentials for storage features

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Intervion
```

### 2. Configure the server

Create `server/.env` from `server/.env.example`.

```bash
cd server
npm install
npm run dev
```

Required server environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_PROVIDER=auto
AI_PROVIDER_ORDER=openrouter,groq,gemini
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
OPENROUTER_SITE_URL=http://localhost:8080
OPENROUTER_APP_NAME=Intervion
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

The backend runs on `http://localhost:5000` by default.

AI provider notes:

- `AI_PROVIDER=auto` tries providers in `AI_PROVIDER_ORDER`
- For free-tier usage, the easiest starting option is usually `OPENROUTER_API_KEY` with `OPENROUTER_MODEL=openrouter/free`
- If no AI provider is available, several features now return local fallbacks instead of failing hard

### 3. Configure the client

Create `client/.env` from `client/.env.example`.

```bash
cd client
npm install
npm run dev
```

Client environment variable:

```env
VITE_API_URL=http://localhost:5000/api
```

Important:

- If `VITE_API_URL` is not set, the frontend falls back to the deployed Render backend URL found in the codebase.
- For local development, set `VITE_API_URL` explicitly so the client talks to your local server.

## Scripts

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm run seed
```

`npm run seed` seeds sample coding questions into MongoDB.

## API Overview

Main backend route groups:

- `/api/auth` - register, login, current user
- `/api/interview` - start/respond/conclude interviews, scheduling, interview history
- `/api/jobs` - job creation, listing, details, applications
- `/api/applications` - student applications and round updates
- `/api/company` - company dashboard data
- `/api/resume` - resume text update and formatting
- `/api/rooms` - study rooms, membership, messages, room state, MCQ generation
- `/api/coding` - coding questions, generation, code run, code submission

## Realtime Collaboration

Study rooms use Socket.IO for:

- room presence and join events
- member invitations
- whiteboard sync
- collaborative code editing
- cursor and session updates

When running locally:

- start the server before opening a study room
- keep the client pointed at your local backend
- open the same room in two browser tabs or two accounts to test live sync

## Notes

- The repository currently has no root-level automated test script.
- The client has build and lint scripts; the server currently exposes development and seed scripts.
- MongoDB connection setup forces public DNS servers in `server/src/config/db.js` to avoid local DNS or proxy resolution issues.

## Documentation

- [Comparison study](./docs/comparison-study.md)

## Summary

Intervion is a full-stack platform for AI-assisted interview preparation, collaborative learning, and structured hiring workflows. The repository contains both the student preparation experience and the company recruitment flow in a single project.
