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
- **Email verification** — accounts are verified via email (Resend) before login is permitted
- **Role-based access** — admin role with a protected stats endpoint showing aggregate, anonymized data across all users
- **Rate limiting & input validation** — auth routes are rate limited, and all incoming data is validated against strict schema constraints
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
- Resend (email verification)
- slowapi (rate limiting)

**Deployment**
- Frontend: Vercel
- Backend + Database: Railway

---

## Architecture

The app is split into two separate services:

- **Frontend** — a React SPA that communicates with the backend via a REST API. Protected routes redirect unauthenticated users to login, and only render protected content after the backend has actually confirmed the stored token is valid, rather than just checking that something exists in localStorage. Axios interceptors handle automatic token refresh silently when access tokens expire.
- **Backend** — a FastAPI server with REST endpoints covering auth, health log CRUD, admin stats, and AI insights. Uses SQLAlchemy ORM with PostgreSQL. Passwords are hashed with bcrypt. Authentication uses short-lived JWT access tokens (30 min) paired with long-lived httpOnly cookie refresh tokens (7 days) to balance security and user experience.

---

## Security notes

- Passwords are hashed with bcrypt before storage — plaintext passwords are never stored
- JWT tokens are signed with a secret key and include a `type` field to prevent access tokens from being used as refresh tokens
- Refresh tokens are stored in httpOnly cookies with the `secure` flag enabled in production, making them inaccessible to JavaScript and resistant to both XSS and transmission over non-HTTPS connections
- CORS is configured to only allow requests from known frontend origins
- All log routes verify the requesting user owns the resource before returning or modifying data
- Auth routes are rate limited to slow down brute-force attempts
- All user input is validated against strict schema constraints (length, range, and type checks) before reaching the database
- Frontend route protection makes a real authenticated request before rendering protected content, rather than trusting the mere presence of a token in localStorage

---

## Notable bugs found and fixed

A reader of [my dev.to blog](https://dev.to/zdzhatdo) tested the live deployment and flagged a few real issues, which led to a genuinely useful debugging session:

- **Insecure cookie flag** — the refresh token cookie was hardcoded to `secure=False`, which would have allowed it to be sent over non-HTTPS connections. Fixed by making the flag environment-aware (`secure=True` in production, `False` only for local HTTP development).
- **Missing production migration** — the production database was missing the `role`, `is_verified`, and `verification_token` columns added during development, since `create_all()` only creates new tables and never alters existing ones. This caused 422s, 500s, and a broken verification flow in production until the schema was manually rebuilt.
- **A real auth bypass in the frontend** — `PrivateRoute` originally only checked whether *something* existed in localStorage under the `token` key, meaning a forged token set via DevTools would render the protected page shell before any API call had a chance to reject it. Fixed by making `PrivateRoute` perform a real authenticated request first and only render protected content once the backend confirms the token is valid.
- **A refresh-token deadlock** — the `/auth/refresh` endpoint's own request passed through the same axios response interceptor as every other call. When a forged token's refresh attempt also failed with a 401, the interceptor tried to await the very refresh promise it was in the middle of creating, deadlocking forever and leaving the UI stuck on a loading spinner indefinitely. Fixed by excluding the refresh endpoint itself from the retry logic.

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
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=http://localhost:5173
```
`FRONTEND_URL` defaults to `http://localhost:5173` if unset, so it's only required to override in production (set to the deployed frontend URL on Railway).

---

## Future improvements

- Refresh token rotation for enhanced security
- Email reminders for consistent logging & streak alerts
- Doctor visit export report (PDF)
- Symptom correlation analysis