# StudySteady

**Small Steps. Steady Progress.**

StudySteady is a learning consistency and recovery companion. It helps people who study across several platforms plan realistically, break courses into manageable activities, see their progress, and get back on track after falling behind. It sits alongside the courses a learner already takes (Coursera, Udemy, a bootcamp, a YouTube series) rather than hosting any content itself.

Falling behind is treated as a normal part of learning, not a failure state. The whole product is built around one loop:

```
PLAN → LEARN → TRACK → MISS/DELAY → RETURN → RECOVER → CONTINUE
```

## Features

- **Multiple courses.** Add as many courses as you like from onboarding, the Home screen, or the Plan screen. Each keeps its own activities, schedule, pace, and progress.
- **Today's activities.** Every activity is assigned a day of the week. Home reads the real date and shows what belongs to today across all courses.
- **Flexible time per day.** Each activity carries an estimated duration. Tell Home how many minutes you have today and it splits today's activities into what fits and what can wait.
- **Manageable activities.** Create, edit, remove, and move activities; cycle status between pending, in progress, and completed.
- **Activity detail.** Each activity has its own screen with status tabs, an editable day and duration, a description, a course-platform link, and a completion moment.
- **Progress.** An overall ring plus a ring and completed list for each course.
- **Catch-up and recovery.** After seven days of inactivity Home switches to a welcome-back state, and a dedicated recovery screen offers one small step to restart. Completed work is never lost.
- **Pause and adjust, at the level you choose.** Pause or reschedule a whole course or a single activity, with return-date validation and a confirmation step. A pause lifts itself once the return date arrives, or it can be ended early from that course or activity.
- **Reminders, at the level you choose.** Set an account-wide default in Settings, override it for a course, or override it again for a single activity. The most specific setting wins.
- **Accessible sign-in.** Password fields have a show/hide control that works on mobile, including on confirmation fields, and signup offers quick links to common webmail providers.

## Tech stack

- React 18 and Vite
- React Router v6
- Plain CSS with custom properties, no framework
- No backend: state lives in React Context and is persisted to `localStorage`

## Getting started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Project structure

```
public/
└── _redirects                   Netlify single-page-app routing rule
src/
├── main.jsx
├── App.jsx                      Routes
├── index.css                    Tokens, reset, and reusable classes
├── App.css                      Component-specific styles
├── user-context.jsx             Frontend-only session store (localStorage)
└── Components/
    ├── course-utils.js          Course/task helpers: day parsing, lookups, pause and reminder resolution, time-budget split
    ├── welcome.jsx              Entry screen
    ├── login.jsx / signup.jsx   Authentication
    ├── password-field.jsx       Show/hide password input
    ├── email-quick-access.jsx   Webmail shortcuts on signup
    ├── onboarding.jsx           Intro plus a six-step first-course wizard
    ├── add-course-form.jsx      Quick add for additional courses
    ├── layout.jsx / navbar.jsx  App frame and bottom tab bar
    ├── dashboard.jsx            Course list, today's activities, catch-up / first-time / completed states
    ├── plan.jsx                 Courses with their activities, missed-activities section
    ├── task-view.jsx            Single activity screen
    ├── plan-pause*.jsx          Pause and adjust flow (choice, date, confirmation)
    ├── plan-schedule-editor.jsx Adjust a course's pace or move an activity
    ├── plan-updated-preview.jsx Summary after an adjustment
    ├── plan-reminders.jsx       Course or activity reminder override
    ├── progress.jsx             Overall and per-course progress
    ├── progress-ring.jsx        Shared SVG ring
    ├── catchup.jsx              Recovery screen
    ├── settings.jsx             Settings index
    ├── reminders.jsx            Account-wide reminder default
    ├── account.jsx              Account details and log out
    └── plan-controls.jsx        List of courses with pause/adjust entry points
```

## Navigation

A persistent bottom tab bar with four tabs: **Home**, **Plan**, **Progress**, **Settings**. Plan and Progress are global and grouped by course. Catch-up is deliberately not a tab; it appears from Home when it is relevant.

```
Welcome → Sign up / Log in → Onboarding → Home
                                            │
                    Home · Plan · Progress · Settings
                              │
             Activity → Pause / Adjust / Reminders
```

## Data model

```
user
├── name, email, hasVisitedDashboard, lastActiveAt
├── remindersEnabled, reminderDays, reminderTime   (account default)
└── courses[]
    ├── id, title, provider, weeklyTime, days
    ├── paused, pauseReturnDate
    ├── reminderOverride                            (optional)
    └── tasks[]
        ├── id, title, status, scheduledDay, estimatedMinutes
        ├── paused, pauseReturnDate                 (optional)
        └── reminderOverride                        (optional)
```

Pause state and reminder settings resolve from the most specific level: activity, then course, then account default.

## Styling system

Styles are split across two files.

- **`index.css`** holds the design tokens, the reset, and reusable classes: buttons, form fields, cards, badges, toggles, segmented controls, the day picker, list rows, page scaffolding, and the progress-ring structure.
- **`App.css`** holds component-specific styles that build on those base classes. Components compose them in markup, for example `ss-card ss-auth-card` or `ss-list-row ss-plan-item`, where the base class supplies the shared look and the second class adds only what is unique.

| Token | Value | Use |
|---|---|---|
| `--ss-teal` | `#1B685E` | Primary brand color: buttons, active states, progress |
| `--ss-cream` | `#F5F3EC` | App background |
| `--ss-track` | `#E8E8E8` | Progress ring track |
| `--ss-attention` | `#C2703F` | Pending state and form validation; deliberately not red, so nothing in the product reads as a warning or a scolding |

**Typeface:** Atkinson Hyperlegible Next, used for everything and differentiated only by weight. It was designed for low-vision legibility, which suits a product that should stay calm and readable on a bad day.

## Known limitations

StudySteady is frontend-only for now.

- **Login does not verify identity.** With no server there is nothing to look accounts up against, so login derives a display name from the email address. Signup captures a real name.
- **Nothing syncs across devices.** State lives in the browser's `localStorage`.
- **Reminders are stored but not delivered.** The preferences, overrides, and cascade all work, but nothing fires a notification. Real delivery needs a decision between in-tab notifications and push, and push needs a scheduler and server.
- **No usage analytics.** Product events such as account creation, task completion, and missed activities are not logged anywhere yet.
- **Webmail shortcuts are a convenience, not verification.** No confirmation email is sent, so the Gmail/Outlook/Yahoo/iCloud links only make checking an inbox quicker.
- **"Today" resets on refresh.** The available-minutes field on Home is not persisted, since it is meant to be answered fresh each day.

## Deployment

Any static host works.

**Netlify:** the included `public/_redirects` file (`/*    /index.html   200`) lets client-side routes such as `/plan` survive a refresh. Build command `npm run build`, publish directory `dist`; leave base and functions directories blank. Free-plan sites show a "Powered by Netlify" badge in the bottom-right corner by default; turn it off under **Project configuration → General** if it overlaps the tab bar.

**GitHub Pages:** set `base: '/your-repo-name/'` in `vite.config.js`, and either switch `BrowserRouter` to `HashRouter` or add a `404.html` redirect, since Pages has no equivalent of `_redirects`.

**Vercel:** works with no extra configuration.

## Open decisions

- Push notifications versus in-app reminders only
- Which features stay free and which become paid
- How the first recovery activity should be chosen (currently the earliest incomplete one)
- Whether courses should sync automatically from external platforms
