# StudySteady

**Small Steps. Steady Progress.**

A digital learning consistency and recovery companion — StudySteady helps learners plan realistically, break learning into manageable tasks, see their progress, and get back on track after falling behind. It's a support layer around a learner's *existing* courses (Coursera, Udemy, a bootcamp, etc.), not a course platform itself.

> Built from an EdTech capstone PRD and a 5-phase design documentation pass (Product Brief → Architecture → User Flows → Screen Inventory → Wireframes). This repo implements the MVP scope defined there.

---

## Core idea

Most learners don't struggle to *start* — they struggle to stay consistent and to come back after life interrupts them. StudySteady treats falling behind as a normal part of the journey, not a failure state:

```
PLAN → LEARN → TRACK → MISS/DELAY → RETURN → RECOVER → CONTINUE
```

## Features (MVP)

| Feature | Priority | Status |
|---|---|---|
| Learning plan (goal, pace, schedule) | Must | ✅ |
| Manageable tasks (create/edit/remove/status) | Must | ✅ |
| Progress tracking | Must | ✅ |
| Clear next step | Must | ✅ |
| Catch-up / resume after inactivity | Must | ✅ |
| Reminders (in-app preferences) | Must | ✅ |
| Inactivity detection (7-day threshold) | Must | ✅ |
| Completion feedback | Must | ✅ |
| Schedule flexibility (pause/adjust) | Should | ✅ |
| Missed activities view | Should | ✅ (via Catch-up View) |
| Basic analytics | Should | ✅ (Progress page) |
| Push/OS-level reminder delivery | — | ⚠️ Not implemented — see [Known limitations](#known-limitations) |

## Tech stack

- **React 18** + **Vite**
- **React Router v6** — client-side routing
- Plain CSS with custom properties (`App.css`) — no CSS framework
- No backend — all state lives in React Context, persisted to `localStorage`

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project structure

```
src/
├── App.jsx              # Routes
├── App.css               # Design system (tokens, layout, all component styles)
├── user-context.jsx      # Frontend-only user/session store (localStorage-backed)
├── main.jsx
└── Components/
    ├── landing.jsx        # Marketing landing page
    ├── login.jsx / signup.jsx
    ├── onboarding.jsx     # 6-step wizard (goal → programme → activities → time → preview → reminders)
    ├── layout.jsx          # Wraps authenticated pages with the bottom nav
    ├── navbar.jsx          # Bottom tab bar: Home / Plan / Progress / Settings
    ├── dashboard.jsx       # 4 states: first-time, normal, catch-up, plan-complete
    ├── plan.jsx            # Task CRUD, pause/adjust plan, completion overlay
    ├── progress.jsx        # Progress ring + completed list
    ├── settings.jsx        # Account, links to reminders/plan controls
    ├── reminders.jsx       # Reminder Settings sub-page (day/time picker)
    ├── catchup.jsx         # Dedicated recovery screen (waiting activities, recovery task)
    └── progress-ring.jsx   # Shared SVG ring (used by dashboard/progress/completion overlay)
```

## Navigation

Bottom tab bar, 4 tabs — **Catch-up is intentionally not a tab.** It surfaces contextually from the Dashboard when inactivity is detected, per the architecture doc's design decision: *"Recovery is a normal part of the journey, not a separate destination."*

```
Home (Dashboard) · Plan · Progress · Settings
                                        └─ Reminder Settings (sub-page)
```

## Design system

Colors and type sourced directly from the Phase 5 wireframe spec:

| Token | Value | Use |
|---|---|---|
| `--ss-teal` | `#1B685E` | Brand primary — buttons, active states, progress ring |
| `--ss-cream` | `#F5F3EC` | App background |
| `--ss-track` | `#E8E8E8` | Progress ring track / placeholder grey (spec-specified) |
| `--ss-attention` | `#C2703F` | Unified warm orange — pending status *and* form validation (deliberately not red, to stay consistent with the "no guilt, no punishment" product principle) |

**Type:** Fraunces (display/headings/numbers), IBM Plex Sans (body/UI), IBM Plex Mono (small-caps labels).

## Known limitations

This is a frontend-only build — no backend exists yet. A few things follow directly from that:

- **Login doesn't verify identity.** There's nowhere to look up "this email belongs to this name," so login guesses a display name from the email address. Signup can capture a real name because the user just typed it.
- **Nothing syncs across devices or browsers.** State lives in `localStorage` only.
- **Reminders are preferences only — nothing actually fires.** The product brief itself flags this as an open decision (*"Push notifications or in-app only? Must resolve before designing reminder flow"*). Delivering real reminders (in-tab notification vs. OS push) needs that decision made, and push specifically needs backend infrastructure (a scheduler + VAPID keys) that can't be faked client-side.

None of these are bugs — they're the actual, honest boundary of what's buildable without a server, and they're the natural next milestones once one exists.

## Deployment

Works on any static host. Two things to know if using **GitHub Pages** specifically:

1. Set `base: '/your-repo-name/'` in `vite.config.js` — Pages serves project repos from a subpath, not the domain root.
2. Client-side routes (`/plan`, `/dashboard`, etc.) will 404 on refresh unless you either switch to `HashRouter` or add a `404.html` redirect — Pages is a static file server with no knowledge of React Router.

Vercel and Netlify both handle SPA routing correctly out of the box with zero config.

## Open product decisions

Carried over from the product brief, not yet resolved by the team:

- How learners add courses/activities (currently: manual entry during onboarding)
- What inactivity period triggers recovery (currently: 7 days, per doc recommendation)
- How the first recovery task is selected (currently: oldest incomplete task)
- Push notifications vs. in-app only
- Free vs. premium feature split
