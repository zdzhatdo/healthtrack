# HealthTrack

A full-stack personal health tracking application for logging and analyzing symptoms over time.

**Live demo:** https://healthtrack-liard.vercel.app

---

## Features

- **Symptom logging** — log multiple symptoms per entry with severity ratings (1–10) and optional notes
- **Dashboard** — visualize symptom severity over time with a line chart, average severity by symptom type with a bar chart, and a 7-day heatmap
- **AI insights** — generate personalized health pattern observations powered by Google Gemini
- **History** — view, edit, and delete past logs with date range filtering and CSV export
- **Streak tracking** — track consecutive days of logging
- **Secure authentication** — JWT access tokens with httpOnly cookie refresh tokens for seamless session management
- **Mobile responsive** — fully usable on mobile with a hamburger navigation menu

---

## Tech stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Recharts
- Axios
- React Router

**Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- JWT authentication with refresh tokens
- Google Gemini API

**Deployment**
- Frontend: Vercel
- Backend + Database: Railway

---

## Architecture

The app is split into two separate services:

- **Frontend** — a React SPA that communicates with the backend via a REST API. Protected routes redirect unauthenticated users to login. Axios interceptors handle automatic token refresh silently when access tokens expire.
- **Backend** — a FastAPI server with 9 REST endpoints covering auth, health log CRUD, and AI insights. Uses SQLAlchemy ORM with PostgreSQL. Passwords are hashed with bcrypt. Authentication uses short-lived JWT access tokens (30 min) paired with long-lived httpOnly cookie refresh tokens (7 days) to balance security and user experience.

---

## Security notes

- Passwords are hashed with bcrypt before storage — plaintext passwords are never stored
- JWT tokens are signed with a secret key and include a `type` field to prevent access tokens from being used as refresh tokens
- Refresh tokens are stored in httpOnly cookies, making them inaccessible to JavaScript and resistant to XSS attacks
- CORS is configured to only allow requests from known frontend origins
- All log routes verify the requesting user owns the resource before returning or modifying data

---

## Running locally

**Backend**
```bash
cd backend
source venv/Scripts/activate  # or source venv/bin/activate on Mac/Linux
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm run dev
```

Requires a `.env` file in `/backend` with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/healthtrack
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
```
---

## Future improvements

- Refresh token rotation for enhanced security
- Email reminders for consistent logging & streak alerts
- Doctor visit export report (PDF)
- Symptom correlation analysis
- Email verification
- Role-based users
- Ratelimiting/Security (API protections, input validation)
