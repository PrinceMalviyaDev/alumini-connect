# Alumni Mentorship & Career Connect Platform
### HACK-A-SPRINT 2026 · WD-01 · 9-Hour Build Plan

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh tokens) |
| Real-time | Socket.io |
| File Upload | Multer + Cloudinary |
| State Mgmt | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Seed Data | Faker.js (40+ realistic alumni profiles) |

---

## Project Structure

```
alumini-connect/
├── client/                  # React + TS frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # Shared TypeScript types
│   │   └── lib/             # Axios instance, utils
├── server/                  # Express + TS backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── seed/            # Faker seed script
└── shared/                  # Shared types (optional)
```

---

## Database Schema (ERD)

### User
```ts
{
  _id, email, passwordHash, role: 'student' | 'alumni' | 'admin',
  name, avatar, bio, college, graduationYear,
  linkedIn, github, portfolio,
  skills: string[],
  isVerified, createdAt
}
```

### AlumniProfile
```ts
{
  userId (ref: User),
  company, jobTitle, industry,
  mentorshipAreas: string[],      // e.g. "Resume Review", "Interview Prep"
  availability: AvailabilitySlot[], // { day, startTime, endTime }
  isAcceptingRequests: boolean,
  totalSessions, rating, reviewCount,
  yearsOfExperience, location
}
```

### StudentProfile
```ts
{
  userId (ref: User),
  major, currentYear,
  interests: string[],
  careerGoals: string,
  resumeUrl
}
```

### MentorshipRequest
```ts
{
  studentId (ref: User),
  alumniId (ref: User),
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled',
  message,                         // specific ask from student
  topic,                           // mentorship area
  proposedSlots: Date[],           // 3 proposed times
  scheduledAt: Date,               // confirmed time
  sessionLink: string,             // auto-generated Google Meet / Jitsi link
  sessionNotes: string,            // alumni fills post-session
  createdAt
}
```

### Feedback
```ts
{
  requestId (ref: MentorshipRequest),
  fromUser (ref: User),
  toUser (ref: User),
  rating: 1-5,
  comment,
  type: 'student-to-alumni' | 'alumni-to-student',
  createdAt
}
```

### Notification
```ts
{
  userId (ref: User),
  type: 'request_received' | 'request_accepted' | 'request_declined' |
        'session_reminder' | 'feedback_received' | 'new_message',
  message, link, isRead, createdAt
}
```

### Message (for in-app chat)
```ts
{
  conversationId,
  senderId (ref: User),
  receiverId (ref: User),
  content, isRead, createdAt
}
```

---

## Feature List

### Phase 1 — Auth & Onboarding (Hour 1–1.5)
- [ ] Register / Login with JWT
- [ ] Role selection during signup: Student or Alumni
- [ ] Separate onboarding flows:
  - **Alumni**: company, role, skills, mentorship areas, availability slots
  - **Student**: major, year, interests, career goals, resume upload
- [ ] Protected routes per role
- [ ] Profile avatar upload (Cloudinary)

### Phase 2 — Alumni Directory & Search (Hour 1.5–2.5)
- [ ] Searchable alumni directory (paginated)
- [ ] Filters:
  - Industry (Tech, Finance, Healthcare, etc.)
  - Skills / Tech stack
  - Mentorship area (Resume, Interview, Career Switch, etc.)
  - Graduation year range
  - Availability (accepting requests toggle)
  - Rating (4★ and above)
- [ ] Alumni profile cards with: avatar, company, role, skills chips, rating, session count
- [ ] Full alumni profile page with availability calendar view
- [ ] "Accepting Requests" badge

### Phase 3 — Mentorship Request Flow (Hour 2.5–4)
- [ ] Student sends request with:
  - Topic / specific ask (textarea)
  - 3 proposed time slots (datetime picker)
  - Message to alumni
- [ ] Alumni dashboard: pending requests queue
- [ ] Accept with slot selection → auto-generates session link (Jitsi Meet URL)
- [ ] Decline with optional reason
- [ ] Status tracking: Pending → Accepted → Completed
- [ ] Student can cancel pending requests
- [ ] Email-style notification on accept/decline

### Phase 4 — Session Management (Hour 4–5)
- [ ] Upcoming sessions dashboard (both roles)
- [ ] Session cards with: time, join link, counterpart profile
- [ ] 24-hour reminder notification (via Socket.io)
- [ ] Mark session as completed
- [ ] Alumni can add post-session notes/resources
- [ ] Session history with status tags

### Phase 5 — Feedback System (Hour 5–6)
- [ ] After session completion, both parties prompted to leave feedback
- [ ] Star rating (1–5) + written comment
- [ ] Reviews visible on alumni profile
- [ ] Aggregate rating auto-updated on AlumniProfile
- [ ] Student feedback visible to admin only (privacy)

### Phase 6 — Real-time Features (Hour 6–6.5)
- [ ] Bell icon notifications (Socket.io) — real-time push
- [ ] Notification center (mark all read, individual read)
- [ ] In-app direct messaging between matched mentor/mentee pairs
- [ ] Online/offline presence indicator on alumni cards
- [ ] Unread message badge

### Phase 7 — Leaderboard & Discovery (Hour 6.5–7)
- [ ] Active Mentor Leaderboard:
  - Ranked by: sessions completed, average rating, response rate
  - Filterable by industry
  - Top 10 + paginated
- [ ] "Featured Mentors" section on homepage (top 3 by rating)
- [ ] Trending mentorship areas (tag cloud)
- [ ] Recently joined alumni (last 7 days)

### Phase 8 — Admin Dashboard (Hour 7–7.5)
- [ ] Admin-only route `/admin`
- [ ] Engagement metrics:
  - Total users (students / alumni)
  - Total requests (pending / accepted / completed)
  - Sessions this week
  - Top 5 most active mentors
  - Average session rating
- [ ] User management table (view, deactivate)
- [ ] Pending alumni verifications
- [ ] Charts: requests over time (recharts)

### Phase 9 — Polish & Seed Data (Hour 7.5–8.5)
- [ ] Seed script: 40 realistic alumni + 10 students with Faker.js
  - 10 industries × 4 alumni each
  - 8 graduation years (2015–2023)
  - Varied skills, availability, session counts
- [ ] Responsive design (mobile-friendly)
- [ ] Loading skeletons for directory and dashboard
- [ ] Empty states with helpful CTAs
- [ ] Toast notifications (success/error)
- [ ] Dark mode toggle

### Phase 10 — GitHub & Demo Prep (Hour 8.5–9)
- [ ] README with:
  - System architecture diagram (ASCII or Mermaid)
  - ERD diagram
  - Setup instructions + env variables
  - Screenshots
- [ ] `.env.example` file
- [ ] Demo walkthrough prep (Judge's Tip flow)

---

## Page Map

### Public
- `/` — Landing page (hero, features, leaderboard preview, CTA)
- `/login` — Login
- `/register` — Register + role selection

### Student
- `/onboarding` — Student profile setup
- `/directory` — Alumni search + filter
- `/alumni/:id` — Alumni public profile
- `/requests` — My sent requests (status tracker)
- `/sessions` — Upcoming & past sessions
- `/messages` — Inbox
- `/notifications` — All notifications
- `/profile` — Edit my profile

### Alumni
- `/onboarding` — Alumni profile setup
- `/dashboard` — Pending requests + upcoming sessions
- `/requests` — Request management (accept/decline)
- `/sessions` — Session history + notes
- `/leaderboard` — Mentor leaderboard
- `/messages` — Inbox
- `/profile` — Edit my profile

### Admin
- `/admin` — Dashboard with metrics + user management

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Users / Profiles
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/alumni              ?search&industry&skills&area&year&rating&page
GET    /api/alumni/:id
PUT    /api/alumni/profile      (alumni only)
PUT    /api/student/profile     (student only)
POST   /api/upload/avatar
```

### Requests
```
POST   /api/requests                    (student)
GET    /api/requests/sent               (student)
GET    /api/requests/received           (alumni)
PUT    /api/requests/:id/accept         (alumni)
PUT    /api/requests/:id/decline        (alumni)
PUT    /api/requests/:id/complete       (alumni)
DELETE /api/requests/:id                (student, cancel)
```

### Feedback
```
POST   /api/feedback/:requestId
GET    /api/feedback/alumni/:alumniId   (public reviews)
```

### Leaderboard
```
GET    /api/leaderboard?industry&limit
```

### Messages
```
GET    /api/messages/conversations
GET    /api/messages/:userId
POST   /api/messages/:userId
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/read-all
PUT    /api/notifications/:id/read
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/users/:id/deactivate
```

---

## Socket.io Events

```ts
// Server → Client
'notification:new'       // real-time bell notification
'message:new'            // new chat message
'session:reminder'       // 24h before session
'request:status-change'  // accepted / declined

// Client → Server
'join:room'              // join user-specific room on login
'message:send'
'typing:start'
'typing:stop'
```

---

## Time Breakdown (9 Hours)

| Hour | Task |
|------|------|
| 0:00–0:30 | Project setup (Vite + Express + TS + Mongo + Tailwind) |
| 0:30–1:30 | Auth (register/login/JWT/protected routes) + onboarding flows |
| 1:30–2:30 | Alumni directory with search + filters |
| 2:30–3:30 | Mentorship request send + alumni request management UI |
| 3:30–4:30 | Accept/decline flow + session scheduling + session link generation |
| 4:30–5:30 | Session dashboard + feedback system |
| 5:30–6:30 | Socket.io notifications + in-app messaging |
| 6:30–7:00 | Leaderboard page + admin dashboard |
| 7:00–7:30 | Seed script (Faker.js — 40 alumni, 10 students) |
| 7:30–8:30 | UI polish: responsive, skeletons, dark mode, toasts |
| 8:30–9:00 | README, ERD diagram, screenshots, final demo prep |

---

## Demo Flow (Judge's Tip)

1. **Login as Student** → Browse directory → Filter by "Interview Prep" + "Tech"
2. **Click Alumni profile** → View availability + reviews
3. **Send mentorship request** → Specific ask + 3 proposed slots
4. **Switch to Alumni account** → See pending request in dashboard
5. **Accept request** → Pick a slot → Session link auto-generated
6. **Back to Student** → See upcoming session with join link
7. **Mark session complete** → Both sides leave feedback
8. **Show leaderboard** → Alumni appears with updated stats
9. **Show Admin dashboard** → Metrics updated live

---

## Environment Variables

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumniconnect
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:5173

# Client
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Key UI Components

- `AlumniCard` — avatar, name, company, role, skills chips, rating stars, "Request" CTA
- `FilterSidebar` — multi-select dropdowns, range sliders, toggle switches
- `RequestModal` — topic selector, datetime pickers (3 slots), message textarea
- `SessionCard` — countdown timer, join button, counterpart info
- `FeedbackModal` — star picker + comment, submitted state
- `NotificationBell` — badge count, dropdown list
- `LeaderboardTable` — rank, avatar, name, company, sessions, rating
- `AdminStatCard` — metric, icon, trend indicator
- `OnlineIndicator` — green dot for active alumni

---

## Bonus (If Time Permits)

- [ ] AI-powered mentor match suggestion (based on student's career goals vs alumni skills — simple keyword overlap score)
- [ ] Export session history as PDF
- [ ] Alumni can post "Tips & Resources" (mini blog posts visible to all students)
- [ ] Google Calendar deep link for accepted sessions (`/calendar/event?...`)
- [ ] Student can follow alumni (get notified when they become available)
