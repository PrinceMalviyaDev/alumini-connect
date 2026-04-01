# AlumniConnect

A full-stack mentorship platform that bridges the gap between alumni and students. Alumni share career experience through scheduled 1-on-1 sessions, and students get personalized guidance from professionals at top companies.

Built with the **MERN stack + TypeScript**, real-time notifications via **Socket.io**, and deployed on **Render**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Students
- Browse a curated **alumni directory** filtered by industry, skills, rating, and availability
- **Request mentorship** with topic, message, and proposed time slots
- **Join sessions** via alumni-provided meeting links (Google Meet, Zoom, etc.)
- **Leave feedback** with star ratings and comments after sessions
- **Session calendar** with highlighted dates and session details on click
- **Regret Engine** — learn from alumni career regrets to make better decisions

### For Alumni
- **Dashboard** with pending requests, upcoming sessions, and performance stats
- **Accept/decline** mentorship requests with a custom meeting link
- **Give suggestions** to students after completed sessions
- **Share career regrets** with title and description for students to learn from
- **Like, dislike, and comment** on other alumni's regrets
- **Toggle availability** to start or stop receiving requests
- **Session calendar** with all scheduled and completed sessions

### For Admins
- **Platform statistics** — user counts, session metrics, top mentors
- **User management** — view all users with profiles, deactivate accounts

### Platform-wide
- **Real-time notifications** via Socket.io (request accepted, feedback received, etc.)
- **JWT authentication** with access token (15 min) + refresh token (7 days) + auto-refresh
- **Dark mode** support across the entire application
- **Leaderboard** ranking alumni by total sessions and average rating
- **Responsive design** — works on desktop, tablet, and mobile
- **Role-based routing** — students, alumni, and admins each see their own views

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling & dark mode |
| Zustand | State management |
| Axios | HTTP client with interceptors |
| Socket.io Client | Real-time notifications |
| React Router v6 | Client-side routing |
| date-fns | Date formatting |
| Lucide React | Icons |
| React Hot Toast | Toast notifications |
| Recharts | Admin dashboard charts |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time WebSocket events |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Faker.js | Seed data generation |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                CLIENT (React + Vite)              │
│  Zustand Stores ── Axios ── Socket.io Client     │
│  Pages ── Components ── Types ── Lib             │
└────────────┬──────────────────┬───────────────────┘
             │  REST API        │  WebSocket
             ▼                  ▼
┌──────────────────────────────────────────────────┐
│              SERVER (Express + TypeScript)        │
│  Routes + Middleware ── Controllers ── Helpers    │
│  Socket.io Server                                │
│                                                  │
│  Mongoose Models:                                │
│  User │ AlumniProfile │ StudentProfile           │
│  MentorshipRequest │ Feedback │ Notification     │
│  Regret                                          │
└────────────────────────┬─────────────────────────┘
                         ▼
                ┌────────────────┐
                │    MongoDB     │
                └────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local or Atlas connection string)
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/alumini-connect.git
cd alumini-connect
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumniconnect
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the database

```bash
npm run seed
```

This creates **66 users** with realistic Indian data:

| Role | Count | Credentials |
|------|-------|-------------|
| Admin | 1 | `admin@alumniconnect.in` / `admin@123` |
| Alumni | 50 | `alumni1@test.com` ... `alumni50@test.com` / `alumni@123` |
| Students | 15 | `student1@test.com` ... `student15@test.com` / `student@123` |

### 4. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm run start
```

### 5. Set up the client

```bash
cd ../client
npm install
```

The client uses Vite's dev proxy — no `.env` changes needed for local development.

### 6. Start the client

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Seed Data

The seed script generates realistic data sourced from:

- **Names**: 50 Indian alumni + 15 student names (diverse male/female)
- **Colleges**: 25 NIRF top-ranked institutions (IIT Madras, IIT Bombay, NIT Trichy, BITS Pilani, IIIT Hyderabad, etc.)
- **Companies**: Real Indian companies per industry (Google India, Flipkart, Razorpay, ISRO, McKinsey India, etc.)
- **Skills**: NASSCOM-aligned (GenAI/LLMs, Cloud, Cybersecurity, Data Engineering, etc.)
- **Graduation years**: 2017–2024 (8 cohorts)
- **Locations**: Indian cities + ~14% international (San Francisco, London, Singapore, etc.)
- **Industries**: Tech, Finance, Healthcare, Education, Manufacturing, Consulting, Media, Retail, Government, Other

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/alumniconnect` |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `CLIENT_URL` | Frontend URL for CORS (comma-separated for multiple) | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

### Client (`client/.env.production`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-backend.onrender.com/api`) |
| `VITE_SERVER_URL` | Backend root URL for Socket.io |

> In development, these are empty — Vite proxies `/api` and `/socket.io` to `localhost:5000`.

---

## Project Structure

```
alumini-connect/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.tsx           # Top navigation with role-based links
│   │   │   ├── SessionCalendar.tsx  # Interactive session calendar
│   │   │   ├── SessionCard.tsx      # Session display card
│   │   │   ├── FeedbackModal.tsx    # Feedback/suggestion modal
│   │   │   ├── AlumniCard.tsx       # Alumni directory card
│   │   │   ├── Avatar.tsx           # User avatar component
│   │   │   ├── StarRating.tsx       # Interactive star rating
│   │   │   ├── FilterSidebar.tsx    # Directory filter panel
│   │   │   ├── RequestModal.tsx     # Mentorship request modal
│   │   │   ├── NotificationBell.tsx # Notification dropdown
│   │   │   └── LoadingSkeleton.tsx  # Loading placeholders
│   │   ├── pages/                   # Route pages
│   │   │   ├── Landing.tsx          # Public landing page
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Register.tsx         # Multi-step registration
│   │   │   ├── Directory.tsx        # Alumni directory (student home)
│   │   │   ├── AlumniProfilePage.tsx# Individual alumni profile
│   │   │   ├── AlumniDashboard.tsx  # Alumni dashboard
│   │   │   ├── AlumniOnboarding.tsx # Alumni onboarding flow
│   │   │   ├── StudentRequests.tsx  # Student's mentorship requests
│   │   │   ├── StudentOnboarding.tsx# Student onboarding flow
│   │   │   ├── Sessions.tsx         # Sessions page (both roles)
│   │   │   ├── RegretEngine.tsx     # Career regrets feed
│   │   │   ├── Leaderboard.tsx      # Alumni rankings
│   │   │   ├── Profile.tsx          # Profile settings
│   │   │   ├── NotificationsPage.tsx# Notification history
│   │   │   ├── AdminDashboard.tsx   # Admin panel
│   │   │   └── NotFound.tsx         # 404 page
│   │   ├── store/                   # Zustand state stores
│   │   │   ├── authStore.ts         # Auth state + token management
│   │   │   └── notificationStore.ts # Notification state
│   │   ├── lib/                     # Utilities
│   │   │   ├── axios.ts             # Axios instance + interceptors
│   │   │   └── socket.ts            # Socket.io client
│   │   ├── types/index.ts           # TypeScript interfaces
│   │   └── App.tsx                  # Router + layout
│   ├── .env.production              # Production env vars
│   └── vite.config.ts               # Vite config with dev proxy
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts              # User (all roles)
│   │   │   ├── AlumniProfile.ts     # Alumni professional profile
│   │   │   ├── StudentProfile.ts    # Student academic profile
│   │   │   ├── MentorshipRequest.ts # Session lifecycle
│   │   │   ├── Feedback.ts          # Ratings + suggestions
│   │   │   ├── Notification.ts      # In-app notifications
│   │   │   └── Regret.ts            # Career regrets + comments
│   │   ├── controllers/             # Route handlers
│   │   ├── routes/                  # Express routers
│   │   ├── middleware/              # Auth + error handlers
│   │   ├── helpers/                 # createNotification utility
│   │   ├── socket/                  # Socket.io setup
│   │   ├── config/db.ts             # MongoDB connection
│   │   ├── seed/seed.ts             # Database seeder
│   │   └── index.ts                 # Server entry point
│   ├── .env                         # Server env vars
│   └── tsconfig.json                # TypeScript config with path aliases
│
├── DESIGN_DOC.md                    # Detailed design document
└── README.md                        # This file
```

---

## API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register (alumni require graduation year <= current year) |
| POST | `/login` | Login, returns access + refresh tokens |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Get authenticated user profile |

### Alumni — `/api/alumni`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Paginated directory with filters |
| GET | `/:id` | Alumni profile + reviews |
| POST | `/profile` | Create/update alumni profile |
| PUT | `/toggle-accepting` | Toggle request acceptance |

### Requests — `/api/requests`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create mentorship request (student) |
| GET | `/sent` | Student's sent requests |
| GET | `/received` | Alumni's received requests |
| PUT | `/:id/accept` | Accept with meeting link (required) |
| PUT | `/:id/decline` | Decline request |
| PUT | `/:id/complete` | Mark session completed |

### Feedback — `/api/feedback`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:requestId` | Submit feedback (student) or suggestion (alumni) |
| GET | `/alumni/:id` | Get alumni reviews |
| GET | `/suggestions/mine` | Get student's received suggestions |

### Regrets — `/api/regrets`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List regrets (sort: latest/popular) |
| POST | `/` | Create regret (alumni only) |
| POST | `/:id/like` | Toggle like (alumni only) |
| POST | `/:id/dislike` | Toggle dislike (alumni only) |
| POST | `/:id/comment` | Add comment (alumni only) |
| DELETE | `/:id` | Delete own regret |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Alumni rankings |
| GET | `/api/notifications` | User notifications |
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/health` | Health check |

---

## Deployment

### Backend (Render — Web Service)

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Environment | Set all server env vars. Set `CLIENT_URL` to your frontend URL. |

### Frontend (Render — Static Site)

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment | `.env.production` is baked in at build time |

---

## Key User Flows

### Student Journey
```
Register → Onboarding (major, interests, goals)
  → Browse Alumni Directory → View Profile → Send Request
  → Request Accepted → Join Session (meeting link)
  → Session Completed → Leave Feedback (1-5 stars)
  → View Mentor's Suggestion
  → Browse Regret Engine
```

### Alumni Journey
```
Register (graduation year <= current year) → Onboarding (company, skills, availability)
  → Dashboard → Accept Request (paste meeting link)
  → Conduct Session → Mark Complete → Give Suggestion
  → View Student Feedback
  → Regret Engine: Share / Like / Comment
```

---

## Screenshots

> Add screenshots of the landing page, alumni directory, dashboard, sessions calendar, regret engine, and dark mode here.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is built for the **HACK-A-SPRINT 2026 (WD-01)** hackathon.

---

<p align="center">
  Built with TypeScript, React, Node.js, and MongoDB
</p>
