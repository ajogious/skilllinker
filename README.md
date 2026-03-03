# SkillLinker

**A web-based platform connecting clients with verified skilled tradesmen in Nigeria.**

Built as a final year computer science project. Full-stack Next.js 15 application with role-based access, real-time messaging, job lifecycle management, and an admin panel.

## Live URL

**[https://skilllinker.vercel.app](https://skilllinker.vercel.app)**

Test accounts:
| Role | Email | Password |
|------|-------|----------|
| Client | client@demo.com | demo123 |
| Tradesman | tradesman@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## Features

### For Clients

- Browse and search verified tradesman profiles (filter by skill, location, rating)
- Post jobs with title, description, category, location, and optional budget
- Track job status through 5 stages: Open → Accepted → In Progress → Completed → Cancelled
- Real-time in-app messaging with assigned tradesman
- Submit 5-star reviews after job completion

### For Tradesmen

- 4-step onboarding wizard (bio, skills, experience, preview)
- Receive notifications when matching jobs are posted
- Accept, start, and complete jobs
- Build reputation through client reviews and star ratings
- Verification badge (awarded by admin)

### For Admins

- Dashboard with platform-wide stats (users, jobs, reviews)
- User management table with search and role filter
- Toggle tradesman verification status
- View all jobs and reviews across the platform

### Platform

- Role-based access control (CLIENT / TRADESMAN / ADMIN)
- All API routes protected with server-side session validation
- Input sanitization and validation on every form
- Responsive mobile-first design (Tailwind CSS)
- Real-time notification bell (10s polling) with unread badge
- Cloudinary avatar upload

---

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Framework        | Next.js 15 (App Router)          |
| Database         | PostgreSQL via Neon (serverless) |
| ORM              | Prisma 5                         |
| Auth             | NextAuth v5 (Credentials + JWT)  |
| Styling          | Tailwind CSS 3                   |
| Image hosting    | Cloudinary                       |
| Deployment       | Vercel                           |
| Password hashing | bcryptjs (cost 12)               |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/ajogious/skilllinker.git
cd skilllinker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
AUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_UPLOAD_PRESET="your_unsigned_preset"
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Create Your First Admin Account

1. Register a normal account at `/register`
2. Promote it to ADMIN via Neon's SQL editor or Prisma Studio:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or with Prisma Studio:

```bash
npx prisma studio
```

---

## Deployment to Vercel

1. Push your code to GitHub
2. Import the repository at [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel project settings:
   - `DATABASE_URL` — use Neon's **pooled** connection string for production
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` — set to your Vercel deployment URL
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET`
4. Deploy — Vercel auto-detects Next.js

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login and registration pages
│   ├── (dashboard)/
│   │   ├── admin/       # Admin panel
│   │   ├── client/      # Client dashboard, browse, jobs
│   │   └── tradesman/   # Tradesman dashboard, jobs, onboarding
│   ├── api/             # All API route handlers
│   │   ├── admin/       # Admin user/job/review management
│   │   ├── auth/        # NextAuth handler
│   │   ├── jobs/        # Job CRUD + status transitions
│   │   ├── messages/    # In-app messaging
│   │   ├── notifications/
│   │   ├── register/
│   │   ├── reviews/
│   │   └── tradesman/   # Profile + browse
│   └── page.jsx         # Landing page
├── components/
│   └── shared/
│       ├── ChatBox.js
│       ├── JobTimeline.js
│       ├── Navbar.js
│       ├── NotificationBell.js
│       ├── StarRating.js
│       ├── StatusBadge.js
│       ├── TradesmanCard.js
│       └── UIStates.js
└── lib/
    ├── apiAuth.js       # API route auth guard helper
    ├── prisma.js        # Prisma client singleton
    └── validate.js      # Shared validation & sanitization
prisma/
└── schema.prisma        # Full database schema
```

---

## API Endpoints

All endpoints require authentication unless noted. Role restrictions enforced server-side.

| Method     | Endpoint                       | Role             | Description               |
| ---------- | ------------------------------ | ---------------- | ------------------------- |
| POST       | `/api/register`                | Public           | Create account            |
| GET        | `/api/tradesman/browse`        | Any              | Search tradesman profiles |
| GET/PATCH  | `/api/tradesman/profile`       | TRADESMAN        | Own profile               |
| GET        | `/api/tradesman/[id]`          | Any              | Public profile            |
| POST/GET   | `/api/jobs`                    | CLIENT/TRADESMAN | Create job / list jobs    |
| GET/DELETE | `/api/jobs/[id]`               | Owner            | Job detail / cancel       |
| PATCH      | `/api/jobs/[id]/status`        | Owner            | Status transition         |
| GET/POST   | `/api/messages`                | Owner            | Chat messages             |
| POST       | `/api/reviews`                 | CLIENT           | Submit review             |
| GET/PATCH  | `/api/notifications`           | Any              | Notifications             |
| GET        | `/api/admin/users`             | ADMIN            | All users                 |
| PATCH      | `/api/admin/users/[id]/verify` | ADMIN            | Toggle verification       |
| GET        | `/api/admin/jobs`              | ADMIN            | All jobs                  |
| GET        | `/api/admin/reviews`           | ADMIN            | All reviews               |

---

## Security

- Passwords hashed with bcryptjs (cost factor 12)
- All API routes validate session and role before any operation
- Input sanitization strips HTML tags and dangerous characters
- Prisma parameterised queries prevent SQL injection
- HTTP-only cookie session storage via NextAuth
- Environment secrets never committed to version control (`.env` in `.gitignore`)

---
