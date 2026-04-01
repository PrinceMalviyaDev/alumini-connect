# AlumniConnect — Design Document

## 1. Project Overview

**AlumniConnect** is a full-stack mentorship platform that connects alumni with students. Alumni share career experience, provide mentorship through scheduled sessions, and post career regrets. Students discover mentors, request mentorship, and learn from alumni insights.

- **Stack:** MERN (MongoDB, Express, React, Node.js) + TypeScript
- **Real-time:** Socket.io for live notifications
- **Auth:** JWT (access + refresh tokens)
- **Styling:** Tailwind CSS with dark mode support
- **Build:** Vite (client), tsc + tsc-alias (server)
- **Deployment:** Render (backend as Web Service, frontend as Static Site)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (React + Vite)          │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Zustand   │ │  Axios   │ │  Socket.io     │  │
│  │  Stores    │ │  + Interceptors │ │  Client  │  │
│  └─────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│        │             │               │            │
│  Pages ─ Components ─ Types ─ Lib                 │
└────────┼─────────────┼───────────────┼────────────┘
         │  REST API   │               │ WebSocket
         ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│                SERVER (Express + TypeScript)      │
│  ┌──────────┐ ┌────────────┐ ┌───────────────┐  │
│  │  Routes   │ │ Controllers│ │  Socket.io    │  │
│  │  + Auth   │ │  + Helpers │ │  Server       │  │
│  │ Middleware│ │            │ │               │  │
│  └─────┬────┘ └─────┬──────┘ └───────┬───────┘  │
│        │            │                │            │
│        ▼            ▼                ▼            │
│  ┌────────────────────────────────────────────┐  │
│  │             Mongoose Models                │  │
│  │  User │ AlumniProfile │ StudentProfile     │  │
│  │  MentorshipRequest │ Feedback │ Notification│  │
│  │  Regret                                    │  │
│  └────────────────────┬───────────────────────┘  │
└───────────────────────┼──────────────────────────┘
                        ▼
               ┌────────────────┐
               │    MongoDB     │
               └────────────────┘
```

---

## 3. Data Models

### 3.1 User

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | required, bcrypt hashed |
| `role` | String | enum: `student`, `alumni`, `admin` |
| `avatar` | String | DiceBear URL auto-generated |
| `bio` | String | optional |
| `college` | String | optional |
| `graduationYear` | Number | optional, required for alumni, must be <= current year |
| `linkedIn` | String | optional |
| `github` | String | optional |
| `portfolio` | String | optional |
| `isOnboarded` | Boolean | default: false |
| `isActive` | Boolean | default: true |

**Pre-save hook:** Hashes password via bcrypt before save if modified.
**Instance method:** `comparePassword(password)` — bcrypt comparison.

### 3.2 AlumniProfile

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId | ref: User, required, unique |
| `company` | String | |
| `jobTitle` | String | |
| `industry` | String | enum: Tech, Finance, Healthcare, Education, Manufacturing, Consulting, Media, Retail, Government, Other |
| `mentorshipAreas` | [String] | array of skill tags |
| `availability` | [{ day, startTime, endTime }] | weekly slots |
| `isAcceptingRequests` | Boolean | default: true |
| `yearsOfExperience` | Number | default: 0 |
| `location` | String | |
| `totalSessions` | Number | default: 0, incremented on completion |
| `averageRating` | Number | default: 0, recalculated on feedback |
| `reviewCount` | Number | default: 0 |

### 3.3 StudentProfile

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId | ref: User, required, unique |
| `major` | String | |
| `currentYear` | Number | 1–6 |
| `interests` | [String] | skill/interest tags |
| `careerGoals` | String | |
| `resumeUrl` | String | optional |

### 3.4 MentorshipRequest

| Field | Type | Constraints |
|-------|------|-------------|
| `studentId` | ObjectId | ref: User |
| `alumniId` | ObjectId | ref: User |
| `status` | String | enum: `pending`, `accepted`, `declined`, `completed`, `cancelled` |
| `topic` | String | required |
| `message` | String | required |
| `proposedSlots` | [Date] | student-proposed times |
| `scheduledAt` | Date | set on accept |
| `sessionLink` | String | meeting link provided by alumni (Google Meet, Zoom, etc.) |
| `sessionNotes` | String | optional |
| `studentFeedbackDone` | Boolean | default: false |
| `alumniFeedbackDone` | Boolean | default: false |

**Lifecycle:** pending → accepted → completed → feedback
  - Student can cancel pending requests
  - Alumni can decline pending requests
  - Alumni marks accepted sessions as completed

### 3.5 Feedback

| Field | Type | Constraints |
|-------|------|-------------|
| `requestId` | ObjectId | ref: MentorshipRequest |
| `fromUserId` | ObjectId | ref: User |
| `toUserId` | ObjectId | ref: User |
| `rating` | Number | 1–5, required for student-to-alumni; null for alumni-to-student |
| `comment` | String | feedback text or suggestion |
| `type` | String | enum: `student-to-alumni`, `alumni-to-student` |

**Student → Alumni:** Rating + comment. Updates alumni's averageRating and reviewCount.
**Alumni → Student:** Text suggestion only (no rating). Shown as "Mentor's Suggestion" card.

### 3.6 Notification

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId | ref: User |
| `type` | String | enum: `request_received`, `request_accepted`, `request_declined`, `session_reminder`, `feedback_received`, `session_completed` |
| `title` | String | |
| `message` | String | |
| `link` | String | optional navigation path |
| `isRead` | Boolean | default: false |

Notifications are persisted to DB and delivered in real-time via Socket.io.

### 3.7 Regret

| Field | Type | Constraints |
|-------|------|-------------|
| `authorId` | ObjectId | ref: User (alumni) |
| `title` | String | required, max 200 chars |
| `description` | String | required, max 2000 chars |
| `likes` | Number | default: 0 |
| `dislikes` | Number | default: 0 |
| `likedBy` | [ObjectId] | tracks who liked |
| `dislikedBy` | [ObjectId] | tracks who disliked |
| `comments` | [{ userId, text, createdAt }] | embedded subdocuments, max 500 chars per comment |

- Only alumni can create regrets, like/dislike, and comment.
- Students can view regrets and counts (read-only).
- Like/dislike toggles: liking again unlikes; liking removes existing dislike and vice versa.

---

## 4. API Endpoints

### 4.1 Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register user. Alumni must provide graduationYear <= current year. |
| POST | `/login` | — | Returns accessToken (15 min) + refreshToken (7 days) |
| POST | `/refresh` | — | Exchange refresh token for new access token |
| POST | `/logout` | — | No-op (tokens managed client-side) |
| GET | `/me` | Bearer | Return authenticated user |

### 4.2 Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/profile` | Bearer | Update profile fields (name, bio, social links, etc.) |

### 4.3 Alumni — `/api/alumni`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Paginated directory with filters (industry, mentorshipAreas, minRating, acceptingOnly, gradYear, search) |
| GET | `/:id` | — | Alumni profile + reviews |
| GET | `/my-profile` | Bearer + alumni | Own profile |
| POST | `/profile` | Bearer + alumni | Upsert alumni profile |
| PUT | `/profile` | Bearer + alumni | Upsert alumni profile |
| PUT | `/toggle-accepting` | Bearer + alumni | Toggle isAcceptingRequests |

### 4.4 Students — `/api/students`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/my-profile` | Bearer + student | Own profile |
| POST | `/profile` | Bearer + student | Upsert student profile |
| PUT | `/profile` | Bearer + student | Upsert student profile |

### 4.5 Requests — `/api/requests`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Bearer + student | Create mentorship request |
| GET | `/sent` | Bearer + student | Student's requests (with alumni profiles + alumni feedback) |
| GET | `/received` | Bearer + alumni | Alumni's requests (with student profiles + student feedback) |
| PUT | `/:id/accept` | Bearer + alumni | Accept request, set schedule + meeting link (required) |
| PUT | `/:id/decline` | Bearer + alumni | Decline request |
| PUT | `/:id/complete` | Bearer + alumni | Mark session completed |
| PUT | `/:id/notes` | Bearer + alumni | Add session notes |
| DELETE | `/:id` | Bearer + student | Cancel pending request |

### 4.6 Feedback — `/api/feedback`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/:requestId` | Bearer | Submit feedback (student: rating + comment; alumni: suggestion text) |
| GET | `/alumni/:alumniId` | — | All student-to-alumni feedback for an alumni |
| GET | `/suggestions/mine` | Bearer | Alumni suggestions received by logged-in student |

### 4.7 Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Bearer | Last 50 notifications |
| GET | `/unread-count` | Bearer | Unread notification count |
| PUT | `/read-all` | Bearer | Mark all as read |
| PUT | `/:id/read` | Bearer | Mark one as read |

### 4.8 Leaderboard — `/api/leaderboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Alumni ranked by totalSessions + averageRating, optional industry filter |

### 4.9 Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats` | Bearer + admin | Platform stats (counts, top mentors, weekly sessions) |
| GET | `/users` | Bearer + admin | Paginated user list with profiles |
| PUT | `/users/:id/deactivate` | Bearer + admin | Deactivate user |

### 4.10 Regrets — `/api/regrets`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Bearer | Paginated regrets (sort: `latest` or `popular`) |
| POST | `/` | Bearer + alumni | Create regret |
| POST | `/:id/like` | Bearer + alumni | Toggle like |
| POST | `/:id/dislike` | Bearer + alumni | Toggle dislike |
| POST | `/:id/comment` | Bearer + alumni | Add comment |
| DELETE | `/:id` | Bearer (author) | Delete own regret |

### 4.11 Health — `/api/health`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{ status: 'ok', timestamp }` |

---

## 5. Authentication & Authorization

### JWT Strategy
- **Access token:** 15-minute TTL, signed with `JWT_SECRET`
- **Refresh token:** 7-day TTL, signed with `JWT_REFRESH_SECRET`
- **Payload:** `{ userId, role }`
- Tokens stored in `localStorage` on the client

### Middleware
- `authenticate` — Extracts Bearer token, verifies JWT, attaches `req.user = { userId, role }`
- `requireRole(...roles)` — Checks `req.user.role` is in allowed list, returns 403 otherwise

### Client-side Token Refresh
- Axios response interceptor catches 401 errors
- Queues concurrent failed requests while refreshing
- Sends refresh token to `/api/auth/refresh`
- Retries queued requests with new access token
- On refresh failure: clears tokens, user must re-login

---

## 6. Real-time Notifications (Socket.io)

### Server Setup
- Socket.io server attached to HTTP server
- CORS configured identically to Express
- User joins room `user:{userId}` on connection

### Event Flow
```
Server: createNotification(io, userId, type, title, message, link)
  → Saves Notification document to DB
  → Emits 'notification:new' to room 'user:{userId}'

Client: socket.on('notification:new', handler)
  → Adds to Zustand notification store
  → Shows toast notification
```

### Notification Triggers
| Event | Recipient | Message |
|-------|-----------|---------|
| Mentorship request created | Alumni | "{student} sent you a request on {topic}" |
| Request accepted | Student | "{alumni} accepted your request on {topic}" |
| Request declined | Student | "{alumni} declined your request on {topic}" |
| Session completed | Student | "Session with {alumni} on {topic} marked completed" |
| Student feedback submitted | Alumni | "{student} left feedback with rating {n}/5" |
| Alumni suggestion submitted | Student | "{alumni} shared a suggestion for you" |

---

## 7. Frontend Architecture

### Routing (React Router v6)

| Path | Component | Access |
|------|-----------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public only (redirects if authenticated) |
| `/register` | Register | Public only |
| `/onboarding/student` | StudentOnboarding | Student (not onboarded) |
| `/onboarding/alumni` | AlumniOnboarding | Alumni (not onboarded) |
| `/directory` | Directory | Authenticated |
| `/alumni/:id` | AlumniProfilePage | Authenticated |
| `/dashboard` | AlumniDashboard | Alumni |
| `/requests` | StudentRequests | Student |
| `/sessions` | Sessions | Authenticated |
| `/regret-engine` | RegretEngine | Student, Alumni |
| `/leaderboard` | Leaderboard | Authenticated |
| `/profile` | Profile | Authenticated |
| `/notifications` | NotificationsPage | Authenticated |
| `/admin` | AdminDashboard | Admin |
| `*` | NotFound | — |

### State Management (Zustand)

**`useAuthStore`** — user session, tokens, initialization from localStorage
**`useNotificationStore`** — notifications array, unread count, fetch/mark-read actions

### Shared Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Top nav with role-based links, dark mode toggle, notification bell, profile dropdown |
| `Avatar` | Renders user avatar with name initial fallback |
| `AlumniCard` | Directory card showing alumni info, skills, rating |
| `SessionCard` | Session card with status, actions (complete, feedback, suggestion) |
| `FeedbackModal` | Modal for student feedback (rating + comment) or alumni suggestion (text only) |
| `RequestModal` | Modal to send mentorship request with topic, message, proposed times |
| `StarRating` | Interactive/display star rating component |
| `FilterSidebar` | Directory filters (industry, mentorship areas, rating, accepting) |
| `SkillBadge` | Styled badge for skills/interests |
| `NotificationBell` | Bell icon with unread count badge and dropdown |
| `LoadingSkeleton` | Skeleton placeholders for loading states |

---

## 8. Key User Flows

### 8.1 Student Journey
```
Register (role: student) → Onboarding (major, interests, goals)
  → Browse Alumni Directory (filter/search)
  → View Alumni Profile → Send Mentorship Request
  → Request Accepted → Join Session (alumni-provided meeting link)
  → Session Completed → Leave Feedback (1-5 stars + comment)
  → View Mentor's Suggestion (if provided)
  → Browse Regret Engine (read-only, learn from alumni regrets)
```

### 8.2 Alumni Journey
```
Register (role: alumni, graduationYear <= now) → Onboarding (company, skills, availability)
  → Dashboard: View Pending Requests → Accept/Decline
  → Session Scheduled → Conduct Session (via meeting link)
  → Mark Session Complete → Give Suggestion to Student
  → View Student's Feedback
  → Regret Engine: Share Regrets, Like/Dislike, Comment
  → Toggle Accepting Requests on/off
```

### 8.3 Admin Journey
```
Login → Admin Dashboard
  → View Platform Stats (user counts, sessions, top mentors)
  → Manage Users (view, deactivate)
```

---

## 9. Session Link

When an alumni accepts a mentorship request, they must provide a meeting link (Google Meet, Zoom, Microsoft Teams, etc.). This link is stored with the session and shown to the student. Both parties use the "Join Session" button to open the link.

---

## 10. Leaderboard Ranking

Alumni are ranked by:
1. **Total sessions completed** (primary sort, descending)
2. **Average rating** (secondary sort, descending)

Optional industry filter narrows the leaderboard to a specific field.

---

## 11. Environment Configuration

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumniconnect
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
CLIENT_URL=http://localhost:5173       # comma-separated for multiple origins
NODE_ENV=development
```

### Client (.env / .env.production)
```
VITE_API_URL=<backend>/api            # empty in dev (Vite proxy handles it)
VITE_SERVER_URL=<backend>             # empty in dev
```

### Vite Dev Proxy
In development, Vite proxies `/api` and `/socket.io` to `http://localhost:5000`.

---

## 12. Seed Data

Run `npm run seed` in the server directory to populate:

| Entity | Count | Credentials |
|--------|-------|-------------|
| Admin | 1 | `admin@alumni.com` / `admin123` |
| Alumni | 40 | `alumni1@test.com` ... `alumni40@test.com` / `alumni123` |
| Students | 10 | `student1@test.com` ... `student10@test.com` / `student123` |

All alumni get randomized profiles (company, industry, mentorship areas, availability, ratings). All students get randomized profiles (major, interests, career goals).

---

## 13. Deployment (Render)

### Backend (Web Service)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Environment:** Set all server env vars including `CLIENT_URL` pointing to frontend URL

### Frontend (Static Site)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment:** `.env.production` baked in at build time with backend URL

### CORS
Server reads `CLIENT_URL` env var and allows those origins for both Express CORS middleware and Socket.io.

---

## 14. API Response Format

All endpoints return consistent JSON:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Error description" }
```

### Pagination Format
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

---

## 15. Security Considerations

- Passwords hashed with **bcrypt** (salt rounds via default)
- JWT tokens with short-lived access (15 min) and longer refresh (7 days)
- Role-based authorization on all sensitive endpoints
- CORS restricted to configured client origins
- Input validation on all mutations (required fields, length limits, enum checks)
- Deactivated users blocked at login (`isActive` check)
- Alumni graduation year validated to prevent future dates
- Users can only modify/delete their own resources
