# InterviewPilot AI

An AI-powered interview preparation platform that acts as a personalized technical interview mentor. It researches latest trends, generates custom roadmaps, and simulates real recruiter/technical interviews using AI agents.

## Architecture

```
interview-agent/
├── backend/          # FastAPI + LangChain AI agents
│   ├── app/
│   │   ├── agents/       # AI agents (interviewer, researcher, roadmap)
│   │   ├── api/          # REST endpoints
│   │   ├── core/         # Config, DB, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   └── requirements.txt
├── frontend/         # Next.js 16 + shadcn/ui
│   ├── src/
│   │   ├── app/          # Pages (landing, dashboard, interview)
│   │   ├── components/   # UI components
│   │   └── lib/          # Utilities
│   └── package.json
└── PRD.md            # Product requirements
```

## Tech Stack

**Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Base UI), Framer Motion, TanStack Query

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, LangChain, LangGraph, Redis

**AI:** OpenAI GPT-4o, Tavily Search, Pinecone vector DB

## Getting Started

### Prerequisites

- Node.js >= 20
- Python >= 3.11
- PostgreSQL (running locally)
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `TAVILY_API_KEY` | Tavily search API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |

Run the server:

```bash
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Features

- **AI Mock Interviewer** — Realistic technical/behavioral interviews with follow-up questions and feedback
- **Smart Roadmap Generator** — Personalized 2-week preparation plans based on role and tech stack
- **Real-time Research** — Scrapes latest interview trends from GitHub, Reddit, Stack Overflow, and blogs
- **Adaptive Questioning** — Questions adjust difficulty based on your answers
- **Progress Tracking** — Visual dashboard with readiness scores and weak area detection
- **Dark Theme UI** — Premium glass morphism design with smooth animations

## AI Agents

| Agent | Role |
|---|---|
| `MockInterviewer` | Simulates a senior interviewer, asks questions, evaluates answers |
| `ResearchAgent` | Searches the web for latest interview trends and patterns |
| `RoadmapGenerator` | Structures research into a daily preparation plan |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/roadmaps` | Generate preparation roadmap |
| GET | `/api/v1/roadmaps` | Get user roadmaps |
| POST | `/api/v1/interviews` | Start a mock interview |
| GET | `/api/v1/interviews` | Get interview history |

## License

MIT
