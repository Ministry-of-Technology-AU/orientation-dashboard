# Orientation Hub — Product Requirements Document

**Version:** 1.1  
**Date:** May 2026  
**Status:** Draft  
**Project:** Ashoka University New Student Onboarding Platform

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [User Flows](#2-user-flows)
3. [Database Schema](#3-database-schema)
4. [Modules & Gamification](#4-modules--gamification)
5. [AI Chat & FAQ](#5-ai-chat--faq)
6. [Calendar & Events](#6-calendar--events)
7. [Club Discovery](#7-club-discovery)
8. [Mascot System](#8-mascot-system)
9. [Buddy System](#9-buddy-system)
10. [Admin Panel & Analytics](#10-admin-panel--analytics)
11. [Technical Architecture](#11-technical-architecture)
12. [Accessibility & Dark Mode](#12-accessibility--dark-mode)
13. [Roadmap & Priorities](#13-roadmap--priorities)
14. [Suggested Additions (v2)](#14-suggested-additions-v2)

---

## 1. Overview & Goals

### Problem Statement

New students are overwhelmed during orientation — too much static content to read, no clear sense of progress, no easy discovery of campus life, and no personalised guidance through the process.

### Product Vision

Replace static orientation PDFs and scattered communications with a single interactive, gamified platform that guides students through their orientation journey — tracking module completion, rewarding engagement with points, surfacing relevant clubs and events, and providing always-on AI support.

### Core Goals

- Guide students through mandatory policy modules with progress tracking and per-game point rewards
- Surface personalised club, society, and ministry recommendations based on student interests
- Provide a unified calendar view pulling from Google Calendar, with one-click RSVP (Google Calendar invite)
- Offer 24/7 AI-powered FAQ support grounded in university documentation
- Foster belonging through mascot interactions, buddy assignment, and a Hall of Fame leaderboard
- Give administrators full visibility into engagement and the ability to manage all content

### Success Metrics

| Metric | Target |
|---|---|
| Module completion rate | 90%+ of students complete all mandatory modules within orientation week |
| Game participation | 75%+ of students complete at least one game per module |
| Club discovery | 70%+ of students interact with swipe discovery and like ≥1 club |
| Event RSVP adoption | 60%+ of students RSVP to at least one orientation event |
| AI chat deflection | 50%+ of queries resolved without escalation to staff |

### Brand & Design

| Token | Value | Usage |
|---|---|---|
| Primary Red | `#A61017` | Buttons, badges, progress indicators, active states, CTAs |
| Primary Blue | `#0A3864` | Sidebar, headings, journey tracker, data panels |
| Red mid | `#d44049` | Hover states, secondary badges |
| Blue mid | `#1a5fa0` | Links, secondary headings |
| Red tint | `#f9e8e9` | Alert backgrounds, soft badges |
| Blue tint | `#e6edf5` | Info backgrounds, callout panels |
| Neutral | `#f5f5f3` | Page backgrounds, table row alternates |

---

## 2. User Flows

### 2.1 First-Time Onboarding

```
OAuth Sign-In
    │
    ▼
Interest Selection (3–5 tags, mandatory, cannot skip)
    │
    ▼
Mascot Welcome Animation (points explained, journey previewed)
    │
    ▼
Dashboard (home screen)
    │
    ▼
Buddy notification sent async within 24 hrs (admin-assigned)
```

**Step detail:**

1. **OAuth Sign-In** — Google OAuth (university email) or Microsoft SSO. On success, a JWT access token (15-min expiry) is issued and a refresh token (7-day expiry, rotated on each use) stored in an HTTP-only cookie.
2. **Interest Selection** — A full-screen modal presents categorised interest tags (Arts, Sports, Tech, Social, etc.). Student must select 3–5. Selection powers club recommendations and buddy matching context. Cannot be dismissed without selecting.
3. **Mascot Welcome** — Animated mascot character slides in (spring easing), greets the student by name, explains the points system and the "My Journey" milestone tracker, and presents one CTA: "Go to my first module →".
4. **Dashboard** — Student sees: weekly time-spending bar chart, module progress ring, today's events pulled from GCal, My Journey milestone tracker, Hall of Fame leaderboard preview, and the next recommended module.
5. **Buddy assignment** — Admin manually assigns buddies via the admin panel. Student receives an in-app notification and sees buddy profile on their dashboard/profile page once assigned.

### 2.2 Returning Student Flow

```
Sign-In (JWT refreshed silently)
    │
    ▼
Dashboard — resumes from last state
    │
    ├── Continue last module
    ├── Check today's events
    └── Explore clubs
```

### 2.3 Module Completion Flow

```
Module List → Select Module
    │
    ▼
Module Banner + Description
    │
    ▼
Read Content (scroll-tracked, 80% required to unlock games)
    │
    ▼
Game Selection (1–3 games available per module)
    │
    ▼
Complete Game → Points Awarded (per game, independently)
    │
    ▼
Module marked complete when all required games done
    │
    ▼
Mascot celebration + Journey milestone update (if applicable)
```

### 2.4 Club Discovery Flow

```
Explore Page
    │
    ├── Recommended carousel (interest-matched)
    ├── Liked by You carousel (swiped right)
    └── Explore All (unswiped clubs)
            │
            ▼
        Swipe right = like → added to Liked by You
        Swipe left  = dismiss → removed from stack
            │
            ▼
        Club detail panel/sheet
        (description, type, contact, Instagram)
```

---

## 3. Database Schema

> **Tech:** PostgreSQL with Prisma ORM. UUID primary keys throughout. `pgvector` extension for AI FAQ embeddings. Row Level Security (RLS) to ensure students access only their own data.

### 3.1 `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | Primary key |
| `email` | `varchar UNIQUE` | University email from OAuth |
| `name` | `varchar` | From OAuth profile |
| `avatar_url` | `text` | OAuth profile picture URL |
| `batch_year` | `int` | e.g. 2026 |
| `role` | `enum` | `student \| buddy \| admin` |
| `total_points` | `int DEFAULT 0` | Cached; updated on each game completion |
| `onboarding_done` | `boolean DEFAULT false` | Interests selected? |
| `buddy_id` | `uuid FK → users` | Self-referential, nullable; set by admin |
| `dark_mode` | `boolean DEFAULT false` | User UI preference |
| `created_at` | `timestamptz` | Auto |

### 3.2 `interests`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `label` | `varchar UNIQUE` | e.g. "Photography" |
| `category` | `varchar` | Arts, Sports, Tech, Social, etc. |
| `emoji` | `varchar` | Display emoji for the tag pill |

### 3.3 `user_interests`

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid FK` | Composite PK |
| `interest_id` | `uuid FK` | Composite PK |

### 3.4 `modules`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `title` | `varchar` | e.g. "Academic Integrity Policy" |
| `slug` | `varchar UNIQUE` | URL-safe identifier |
| `description` | `text` | Short description shown on module card |
| `banner_image_url` | `text` | Hero banner shown at top of module page |
| `content_mdx` | `text` | Rich content stored as MDX (or link to CMS) |
| `icon_name` | `varchar` | Icon identifier for module list card |
| `is_mandatory` | `boolean` | Required for journey milestone progression |
| `order_index` | `int` | Display and progression order |
| `journey_milestone` | `varchar` | Maps to a My Journey step label (nullable) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### 3.5 `games`

> Each module can have 1–3 associated games. Each game is independently completable and awards its own points.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `module_id` | `uuid FK → modules` | |
| `title` | `varchar` | e.g. "Quiz Yourself" |
| `type` | `enum` | `quiz \| wordle \| connections` |
| `difficulty` | `enum` | `easy \| moderate \| hard` |
| `points_value` | `int` | Points awarded on completion: e.g. 20, 40, 60 |
| `estimated_mins` | `int` | Shown to student before they start |
| `config` | `jsonb` | Game-specific content: questions array, word list, connection groups, etc. |
| `order_index` | `int` | Display order within module |

**`config` shape by game type:**

```jsonc
// quiz
{ "questions": [{ "q": "...", "options": ["A","B","C","D"], "answer": "B" }] }

// wordle
{ "word": "INTEGRITY", "max_attempts": 6, "hint": "A core academic value" }

// connections
{ "groups": [{ "label": "Academic policies", "items": ["CADI","CASH","AIP","IDP"] }] }
```

### 3.6 `user_module_progress`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | |
| `module_id` | `uuid FK` | |
| `status` | `enum` | `not_started \| in_progress \| completed` |
| `read_percent` | `int 0–100` | Scroll-based, updated every 30 s |
| `time_spent_mins` | `int` | Accumulated across sessions |
| `games_unlocked` | `boolean` | True when read_percent >= 80 |
| `all_games_done` | `boolean` | True when all games for this module are completed |
| `completed_at` | `timestamptz` | Nullable; set when all_games_done flips to true |

### 3.7 `user_game_completions`

> One row per student per game. Allows multiple games per module to be tracked independently.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | |
| `game_id` | `uuid FK → games` | |
| `module_id` | `uuid FK → modules` | Denormalised for easy querying |
| `score` | `int` | Raw score within game (e.g. 7/10 correct) |
| `points_earned` | `int` | Points awarded (= game.points_value on completion) |
| `attempts` | `int DEFAULT 1` | Number of attempts before completion |
| `completed_at` | `timestamptz` | |

### 3.8 `clubs`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `name` | `varchar` | |
| `type` | `enum` | `club \| society \| ministry` |
| `description` | `text` | |
| `cover_image_url` | `text` | Card thumbnail |
| `interest_tags` | `text[]` | Array of interest labels for matching |
| `contact_email` | `varchar` | |
| `instagram_url` | `text` | Nullable |
| `is_active` | `boolean DEFAULT true` | Admin can deactivate without deleting |

### 3.9 `user_club_swipes`

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid FK` | Composite PK |
| `club_id` | `uuid FK` | Composite PK |
| `action` | `enum` | `liked \| dismissed` |
| `swiped_at` | `timestamptz` | |

### 3.10 `faq_documents`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `title` | `varchar` | |
| `category` | `varchar` | Academics, Housing, Finance, Campus Life |
| `content` | `text` | Full text; used for RAG embedding |
| `embedding` | `vector(1536)` | pgvector; generated at ingest time |
| `updated_at` | `timestamptz` | Re-embed if updated |

### 3.11 `chat_sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | |
| `messages` | `jsonb` | Array of `{role, content, timestamp}` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### 3.12 `time_sessions`

> Powers the weekly time-spending bar chart on the dashboard.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `user_id` | `uuid FK` | |
| `date` | `date` | The calendar day |
| `duration_mins` | `int` | Session duration in minutes |
| `module_id` | `uuid FK nullable` | Which module was active, if any |

### 3.13 `mascot_dismissals`

> Tracks which mascot trigger moments the student has already dismissed, to prevent repeat annoyance.

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid FK` | Composite PK |
| `trigger_key` | `varchar` | Composite PK — e.g. `first_login`, `milestone_policy_modules` |
| `dismissed_at` | `timestamptz` | |

### 3.14 Entity Relationship Summary

```
users ──< user_interests >── interests
users ──< user_module_progress >── modules ──< games
users ──< user_game_completions >── games
users ──< user_club_swipes >── clubs
users ──< chat_sessions
users ──< time_sessions >── modules
users ──< mascot_dismissals
users.buddy_id → users (self-referential)
faq_documents (standalone, queried via pgvector similarity)
```

---

## 4. Modules & Gamification

### 4.1 Module List Page

- Status badges per module: **Complete** (green), **In Progress** (amber), **Yet to Start** (grey)
- Filterable by status tab: All · Complete · In Progress · Yet to Start
- Each module card shows: icon, title, short description, status badge
- Clicking a card navigates to the module detail page

### 4.2 Module Detail Page

- **Banner** — full-width hero image at the top of the page (`banner_image_url`). Admin can upload a custom image per module; a default branded banner is shown as fallback
- **Title + description** block below banner
- **"Go to Module →"** CTA button (links to the full content reader)
- **Side panel** shows available games for this module, each with: game title, type icon, difficulty badge, estimated time, points value, and a "Begin" button (locked until 80% read)
- Module status updates in real time as games are completed

### 4.3 Module Content Reader

- MDX content rendered with syntax highlighting, image support, and callout blocks
- Reading progress tracked via `IntersectionObserver` on section headings
- Progress persisted to `user_module_progress.read_percent` every 30 seconds via a debounced API call
- At 80% read, a toast notification and mascot bubble appear to announce games are unlocked
- Time spent is accumulated and saved on page unload / visibility change

### 4.4 Games System

Each module can have **1 to 3 games**. Games are independent — completing one awards its points immediately, regardless of whether other games in the same module are done. A module is marked `completed` only when all its games are done.

**Game types:**

| Type | Mechanic | Difficulty | Points |
|---|---|---|---|
| Quiz | 10 MCQ questions, one attempt per question | Easy | 20 pts |
| Wordle | Guess a policy-related word in 6 tries | Moderate | 40 pts |
| Connections | Group 16 terms into 4 colour-coded categories | Hard | 60 pts |

- Points are **atomic** — awarded in full on successful game completion, not on partial scores
- Unlimited retries; only the **first successful completion** awards points (subsequent replays are for fun)
- Score (e.g. 7/10 correct on quiz) is stored in `user_game_completions.score` for admin analytics
- Admin can configure the points value per game when creating/editing a module in the admin panel

### 4.5 Points & Leaderboard

- `users.total_points` is a cached sum, updated atomically when a `user_game_completions` row is inserted
- Hall of Fame on the dashboard shows top 10 students by total points; refreshes every 5 minutes
- Points breakdown visible on student profile: per-module, per-game

### 4.6 My Journey Milestone Tracker

- 5 milestones displayed as a vertical stepper on the dashboard right panel
- Each milestone maps to one or more mandatory modules via `modules.journey_milestone`
- Milestone states: **Done** (dark blue filled dot), **In Progress** (red filled dot with label), **Not Started** (grey dot)
- Current milestone label shows sub-progress, e.g. "4 out of 7 done"
- **Next Up** card below the stepper always shows the next incomplete mandatory module with a "Resume Module →" CTA

---

## 5. AI Chat & FAQ

### 5.1 Page Layout

Two tabs at the top of the page:
- **Ask Chat** — AI-powered conversational assistant
- **FAQ** — static curated accordion list

### 5.2 AI Chat Architecture

```
Student query
    │
    ▼
Embed query (text-embedding-3-small or Voyage AI)
    │
    ▼
pgvector cosine similarity search on faq_documents
    │
    ▼
Top 3 matching chunks retrieved
    │
    ▼
LLM prompt: system prompt (Ashoka-scoped) + retrieved chunks + user query
    │
    ▼
Claude claude-sonnet-4-20250514 (Anthropic API) generates grounded response
    │
    ▼
Response streamed to student
```

- System prompt constrains answers to Ashoka university topics only
- If confidence is low, AI gracefully suggests contacting the relevant office and provides a pre-populated `mailto:` link
- Chat history persisted in `chat_sessions` per session; displayed in the conversation thread
- **No rate limit** on AI requests — students can ask freely
- Mascot bubble appears in empty state encouraging the first question
- Streaming response with typing indicator

### 5.3 FAQ Tab

- Curated accordion list, admin-managed
- Searchable with live filter
- Organised by category: Academics · Housing · Finance · Campus Life
- Each item: question (accordion trigger) + answer (expanded content with optional links)

---

## 6. Calendar & Events

### 6.1 Google Calendar Integration

- Admins maintain one or more Ashoka Google Calendars (per-event-type or one unified calendar)
- Events are **fetched directly from the Google Calendar API** at page load (and cached for 15 minutes server-side) — no separate events database table is required
- Displayed via Google Calendar embed or a custom calendar UI reading from the API

### 6.2 Calendar Views

- **Month** (default) — full grid matching the design mockup
- **Week** — 7-column day view with time slots
- **List** — chronological list of upcoming events
- **Today** — shortcut to today in month view
- Navigation: `< Today >` with month/year label; Month / Week / List / Today toggle buttons

### 6.3 Event Display

- Events colour-coded by category: red for mandatory/academic, blue for social, grey for sports/misc
- Each event shows: title, time, location
- Clicking an event opens a detail modal with: full description, time, location, and an **"RSVP — Add to Google Calendar"** button

### 6.4 RSVP Flow

- RSVP button opens the Google Calendar event invite link in a new tab, which adds the event to the student's personal Google Calendar and marks them as attending
- No separate RSVP table required in the database — Google Calendar is the source of truth for attendance
- Dashboard "Today's Events" card surfaces the next 2 events for the current day directly from the GCal API

---

## 7. Club Discovery

### 7.1 Explore Page Structure

**Page title:** "Explore in and around Ashoka"

Three horizontal sections:

1. **Recommended** — clubs whose `interest_tags` overlap with the student's selected interests, sorted by overlap score descending. Displayed as a horizontal scrollable carousel.
2. **Liked by You** — clubs the student has swiped right on. Horizontal carousel; clubs can be un-liked (heart button on detail panel).
3. **Explore All** — all clubs not yet swiped, displayed as a scrollable card grid or swipe stack.

**Right panel (desktop) / Bottom sheet (mobile):** club detail shown on card click — name, type badge, cover image, full description, contact email, Instagram link, and dismiss/like buttons.

### 7.2 Swipe Mechanic

- **Mobile:** Draggable card stack using touch events. Drag right = like, drag left = dismiss. Velocity threshold triggers snap.
- **Desktop:** X (dismiss) and heart (like) buttons in the detail panel replace swipe gestures.
- Swiped cards are persisted immediately to `user_club_swipes` and never reappear in the stack.
- Liked clubs can be un-liked from the "Liked by You" section (action updated to `dismissed` in the table).
- Recommendation score is recomputed when student interests are updated via profile settings.

### 7.3 Club Types

Three types, each with a distinct icon in the UI:
- **Club** — student-run activity groups
- **Society** — identity-based or affinity groups
- **Ministry** — student government bodies

---

## 8. Mascot System

### 8.1 Character

- A unique character designed for Ashoka (illustrated assets generated separately)
- Appears as a bottom-right pop-up bubble with spring-eased slide-up animation
- Has a name and a distinct personality (friendly, encouraging, slightly witty)

### 8.2 Trigger Moments

| Trigger key | When it fires | Message tone |
|---|---|---|
| `first_login` | Very first sign-in | Welcome + orientation overview |
| `interest_selection` | During interest selection modal | Encouraging + explains why interests matter |
| `first_module_start` | First time a module is opened | Excited + explains reading + game system |
| `games_unlocked` | read_percent hits 80% on any module | Celebratory + "your games are ready!" |
| `game_complete` | Any game completed | Congratulatory + shows points earned |
| `milestone_unlocked` | Any journey milestone flips to Done | Proud + previews next milestone |
| `zero_rsvp_nudge` | 0 RSVPs with orientation week ≤48 hrs | Gentle nudge + links to calendar |
| `idle_3_days` | No platform activity for 3 days | Friendly check-in + resume CTA |

### 8.3 Behaviour

- Bubble contains a short message (2–3 sentences) and one CTA button
- Dismissable via an X button
- Dismissed state stored in `mascot_dismissals` per trigger key — each trigger fires at most once per student
- Mascot also appears as a static companion icon on the FAQ empty state and during onboarding interest selection

---

## 9. Buddy System

### 9.1 Overview

Buddies are 2nd or 3rd year students who volunteer to support new students during orientation. Assignments are **manual and admin-controlled** — no automated matching algorithm.

### 9.2 Buddy Registration

- Returning students apply via a form (external or within the admin panel) to be a buddy
- Admin creates their account with `role = buddy` in the admin panel
- Each buddy can be assigned to a maximum of **3 new students**

### 9.3 Assignment Flow

```
Admin Panel → Buddies section
    │
    ▼
View list of new students (with interests shown for context)
    │
    ▼
Select a buddy from the available pool for each student
    │
    ▼
Confirm assignment → user.buddy_id updated
    │
    ▼
Student receives in-app notification + sees buddy profile on dashboard
```

### 9.4 Student-Facing Buddy Experience

- Buddy profile shown in a card on the student's dashboard and profile page: name, avatar, batch year, short bio, shared interests (if any)
- Contact options: pre-filled WhatsApp message link (`wa.me/?text=...`) and `mailto:` link
- No in-app messaging in v1

### 9.5 Buddy-Facing Experience

- Buddy logs in with their university credentials (same OAuth flow, `role = buddy`)
- Sees a list of their assigned new students with names, interests, and module progress
- Can view (but not edit) student progress — for check-in conversation starters

---

## 10. Admin Panel & Analytics

### 10.1 Access

- Admin users have `role = admin` in the `users` table
- Admin panel accessible at `/admin` (protected route, redirects non-admins)
- Separate sidebar section in the main nav, or a standalone admin subdomain

### 10.2 Content Management

**Modules:**
- Create, edit, delete modules
- Upload or change the module banner image
- Edit title, description, content (MDX editor or CMS link)
- Add, edit, remove games per module (1–3 games); configure type, difficulty, points value, and game content (questions / word / connection groups) via the `config` jsonb field
- Toggle `is_mandatory` and update `order_index` (drag-to-reorder)
- Set `journey_milestone` mapping

**Clubs:**
- Create, edit, deactivate clubs
- Manage cover images, interest tags, type, contact info
- Preview the student-facing explore card

**FAQ Documents:**
- Create, edit, delete FAQ entries
- Re-trigger embedding on update (calls the embedding API and updates `faq_documents.embedding`)
- Categorise entries

**Interests:**
- Add or remove interest tags
- Assign emoji and category

### 10.3 Buddy Management

- View all buddy volunteers and their capacity (assigned count / 3)
- Assign a buddy to a student: select student → select buddy from available pool → confirm
- Reassign or remove buddy assignments
- View buddy's assigned student list

### 10.4 Analytics Dashboard

All metrics are real-time (or near-real-time with a 5-minute cache).

**Engagement Overview:**
- Total students registered vs. total expected (batch size)
- % who have completed onboarding (interests selected)
- Daily active users (DAU) — line chart over the orientation period
- Average time spent per day per student — bar chart

**Module Analytics:**
- Completion rate per module — bar chart, sorted by completion % ascending (highlights problem modules)
- Average read time per module
- Drop-off point — which % of scroll depth students abandon (requires aggregating `read_percent` distribution)
- Game completion rate per game type (quiz vs. wordle vs. connections)
- Average score per game
- Points distribution — histogram of `total_points` across all students

**Club Analytics:**
- Total swipes (likes + dismissals) per club
- Like rate per club (likes / total swipes shown)
- Top 10 most-liked clubs

**Events:**
- RSVP counts are managed within Google Calendar — admin views GCal event attendee list directly (no separate analytics in-app for events in v1)

**AI Chat Analytics:**
- Total chat sessions and messages sent
- Most common unmatched queries (queries where top similarity score < threshold) — highlights FAQ content gaps
- Admin can view aggregated (non-PII) query themes

**Export:**
- All analytics tables exportable as CSV

---

## 11. Technical Architecture

### 11.1 Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 latest (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Database | MySQL |
| ORM | Prisma |
| Auth | Google OAuth 2.0 via NextAuth.js; JWT access tokens + HTTP-only refresh cookies |
| AI Chat | We have an internal chatbot endpoint to which we just need to send a HTTP request with the prompt and session (will provide the api signature later) |
| Calendar | Google Calendar API (server-side, service account) |
| File Storage | For now lets keep it on server only |
| Hosting | Vercel (Next.js) with MySQL server from AWS |
| Background Jobs | Vercel Cron or a lightweight queue (calendar cache refresh, analytics aggregation) |

### 11.2 Project Structure (Next.js App Router)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (student)/
│   │   ├── dashboard/
│   │   ├── modules/
│   │   │   └── [slug]/
│   │   │       └── games/
│   │   │           └── [gameId]/
│   │   ├── chat/
│   │   ├── calendar/
│   │   ├── explore/
│   │   └── profile/
│   ├── (admin)/
│   │   └── admin/
│   │       ├── modules/
│   │       ├── clubs/
│   │       ├── buddies/
│   │       ├── faq/
│   │       └── analytics/
│   └── api/
│       ├── auth/
│       ├── modules/
│       ├── games/
│       ├── clubs/
│       ├── chat/
│       ├── calendar/
│       └── admin/
├── components/
│   ├── ui/          # shadcn primitives
│   ├── modules/
│   ├── games/
│   ├── clubs/
│   ├── mascot/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── anthropic.ts
│   ├── gcal.ts
│   └── embeddings.ts
└── prisma/
    └── schema.prisma
```

### 11.3 Sidebar & Responsive Design

- Sidebar is collapsible:
  - **Desktop:** icon-only (64px wide) by default; expands to 220px with text labels on hover or toggle click
  - **Mobile (< 768px):** sidebar collapses into a bottom tab bar with 5 primary icon tabs
- Sidebar collapse state persisted in `localStorage`
- Sidebar nav items: Dashboard · Modules · Chat · Calendar · Explore · Profile (and Admin for admins)

### 11.4 Authentication & Security

- JWT access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry, rotated on each use, stored in HTTP-only `SameSite=Strict` cookie
- All API routes protected by middleware checking JWT validity
- Role-based route guards: `student`, `buddy`, `admin`
- Students can only access their own data (enforced at both API and DB/RLS level)
- Admin routes require `role = admin`; buddy routes require `role = buddy` or `admin`

---

## 12. Accessibility & Dark Mode

### 12.1 Dark Mode

- Toggle available in the sidebar / profile settings
- Preference stored in `users.dark_mode` (synced to server) and mirrored in `localStorage` for instant application on load
- Implemented via Tailwind's `dark:` variant and CSS variables — all colour tokens have a dark counterpart
- No pure-black backgrounds; use dark navy (`#0a0f1c`) as the dark base to stay on-brand
- shadcn/ui components support dark mode natively

### 12.2 Accessibility (WCAG 2.1 AA)

**Colour contrast:**
- All text on coloured backgrounds meets a minimum 4.5:1 contrast ratio
- Interactive elements (buttons, links) meet 3:1 minimum against adjacent colours
- Don't rely on colour alone to convey meaning (badges always have a text label, not just colour)

**Keyboard navigation:**
- All interactive elements reachable via Tab in logical order
- Focus indicators clearly visible (2px ring, brand blue colour)
- All game types (quiz, wordle, connections) fully playable via keyboard
- Modal dialogs trap focus and restore on close (shadcn Dialog handles this)
- Sidebar expandable via keyboard

**Screen reader support:**
- All images have meaningful `alt` text
- Progress rings and bar charts have `aria-label` descriptions with the actual values (e.g. "68% of modules completed")
- Status badges use `role="status"` and include text labels, not just colour
- Live regions (`aria-live="polite"`) on the mascot bubble and toast notifications
- Game state changes announced to screen readers

**Other:**
- All form inputs have associated visible labels (not just placeholder text)
- Error states have descriptive messages, not just red borders
- Reduced motion: all animations respect `prefers-reduced-motion` (mascot spring animation skips to end state, transitions disabled)
- Font size minimum 16px for body text; never below 12px for any UI element

---

## 13. Roadmap & Priorities

### P0 — Launch Critical

| Feature | Description |
|---|---|
| OAuth + NextAuth | Sign-in, JWT/refresh flow, session management |
| Interest selection | Onboarding modal, 3–5 tag requirement, data persistence |
| Module list + reader | Status badges, scroll tracking, read_percent persistence |
| Module banner | Hero image per module, fallback branded banner |
| Games system (Quiz) | MCQ game, points award, completion tracking |
| Dashboard | Time chart, progress ring, journey tracker, today's events |
| My Journey tracker | 5-step milestone stepper, Next Up card |
| Hall of Fame | Top 10 leaderboard, 5-min refresh |

### P1 — Orientation Week Must-Haves

| Feature | Description |
|---|---|
| Wordle + Connections games | Two additional game types with configurable content |
| Multiple games per module | Admin can add 1–3 games; scoring per game |
| AI Chat (RAG) | Claude integration, pgvector search, streaming response |
| FAQ tab | Accordion list, search, category filter |
| Calendar (GCal) | Month/Week/List views, event detail modal, RSVP link |
| Club Discovery + Swipe | Recommendations, swipe mechanic, liked list |
| Mascot system | Trigger logic, contextual bubbles, spring animation |
| Dark mode | Tailwind dark: variants, preference persistence |
| Accessibility | WCAG 2.1 AA compliance across all P0 + P1 features |

### P2 — Post-Launch

| Feature | Description |
|---|---|
| Admin panel (content) | Module CRUD, game config editor, club management, FAQ management |
| Admin analytics | Engagement overview, module analytics, club analytics, CSV export |
| Buddy management (admin) | Assignment UI, capacity tracking, student list per buddy |
| Buddy student view | Buddy profile card, WhatsApp/email contact links |
| Profile page | Points breakdown, interests editor, dark mode toggle |
| Push notifications | Event reminders, buddy assignment notification |

---

## 14. Suggested Additions (v2)

- **Check-in QR codes** — physical event attendance scanned via mobile camera; awards bonus points and feeds event analytics without relying on Google Calendar attendee data
- **Daily streak** — consecutive days of platform activity award a points multiplier (Duolingo-style); drives return visits after the initial orientation rush
- **Group / cohort challenges** — batch-wide challenges ("Complete 5 modules as a batch this week") with a shared progress bar; builds collective momentum
- **Offline support (PWA)** — service worker caches module content for reading without connectivity; common need given campus WiFi gaps
- **Multi-language** — English + Hindi toggle given the student demographic; store preference in user profile
- **In-app buddy chat** — lightweight thread between student and their buddy; reduces WhatsApp dependency
- **Custom game builder** — admin UI to build quiz questions, wordle words, and connection groups with a live preview, replacing direct `config` JSON editing
- **Student profile public view** — optional public profile showing interests and liked clubs to encourage student-to-student discovery

---

*End of Document*

---

> **Maintained by:** Ministry of Technology, Ashoka University  
> **Next review:** Before development kickoff