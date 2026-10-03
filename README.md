# StudySteady Frontend

StudySteady is a React/Vite study-planning frontend for creating learning goals and courses, building study plans, scheduling tasks, tracking progress, managing reminders, recovering missed work, and managing an account.

This package is prepared for deployment with **Netlify** and is configured to communicate with the StudySteady backend on **Render**.

## Live services

- Frontend: https://study-steady-n.netlify.app/
- Backend: https://study-steady-backend.onrender.com
- API base URL: https://study-steady-backend.onrender.com/api
- Backend health check: https://study-steady-backend.onrender.com/health

> The frontend URL and API URL can also be overridden with `VITE_API_URL` at build time.

## Technology

- React 18
- React DOM 18
- React Router DOM 6
- Vite 6
- JavaScript / JSX
- CSS
- Netlify for hosting
- Render for the backend API
- MongoDB Atlas is used by the backend, not directly by this frontend

## Requirements

- Node.js 18+ recommended (Node.js 20+ is also suitable)
- npm
- Access to the StudySteady backend API

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── main.jsx
    ├── user-context.jsx
    └── Components/
        ├── api.js
        ├── account.jsx
        ├── add-course-form.jsx
        ├── catchup.jsx
        ├── course-utils.js
        ├── dashboard.jsx
        ├── email-quick-access.jsx
        ├── layout.jsx
        ├── login.jsx
        ├── navbar.jsx
        ├── onboarding.jsx
        ├── password-field.jsx
        ├── plan-controls.jsx
        ├── plan-pause-confirm.jsx
        ├── plan-pause-date.jsx
        ├── plan-pause.jsx
        ├── plan-reminders.jsx
        ├── plan-schedule-editor.jsx
        ├── plan-updated-preview.jsx
        ├── plan.jsx
        ├── progress-ring.jsx
        ├── progress.jsx
        ├── reminders.jsx
        ├── settings.jsx
        ├── signup.jsx
        ├── task-view.jsx
        └── welcome.jsx
```

## Main application features

### Authentication

- User registration
- User login
- Token-based API authentication
- Logout
- Onboarding flow after registration

### Goals and courses

- Create study goals/courses
- Store subject/title, description, provider and target date
- View and update goals
- Delete goals

### Study plans

- Create plans from goals/courses
- Configure weekly study time
- Configure study days
- Configure activities
- Set start and end dates
- View and update plans
- Delete plans
- Pause and resume plans
- Adjust plan schedules
- Preview updated plans
- Configure plan-specific reminders

### Tasks and events

- View scheduled study events
- Filter events by date, plan or goal
- Update scheduled date/time and estimated duration
- Pause and resume events
- Configure event reminders
- Start activities
- Complete activities
- Snooze activities

### Progress and recovery

- View study progress
- View missed-work summaries
- Recover missed activities
- Snooze recovery tasks
- Catch-up workflow for missed study work
- Progress ring visualization

### Reminders

- Account-level reminder settings
- Enable/disable reminders
- Configure reminder days
- Configure reminder time
- Plan-specific reminder overrides
- Event-specific reminder overrides

### Account management

The account page supports:

- Viewing the user's name and email
- Logging out
- Permanently deleting the account

Account deletion requires the user's current password and a `DELETE` confirmation. The backend is responsible for deleting the account and associated StudySteady data.

## Routes

The React application currently defines these routes:

| Route | Purpose |
|---|---|
| `/` | Welcome page |
| `/login` | Login |
| `/signup` | Registration |
| `/onboarding` | New-user onboarding |
| `/dashboard` | Main dashboard |
| `/plan` | Plans |
| `/plan/:taskId` | Task view |
| `/plan/pause/:scope/:id` | Pause-plan flow |
| `/plan/pause/:scope/:id/date` | Pause date selection |
| `/plan/pause/:scope/:id/confirm` | Pause confirmation |
| `/plan/pause/:scope/:id/schedule` | Schedule adjustment |
| `/plan/pause/:scope/:id/preview` | Updated-plan preview |
| `/plan/reminders/:scope/:id` | Plan reminders |
| `/progress` | Progress |
| `/settings` | Settings |
| `/settings/account` | Account and deletion |
| `/settings/reminders` | Reminder settings |
| `/settings/plan` | Plan controls |
| `/catchup` | Catch-up/recovery |

## API configuration

The frontend reads the API URL from the Vite environment variable:

```text
VITE_API_URL=https://study-steady-backend.onrender.com/api
```

The current code also has the same Render API URL as its fallback, so the application can still target the deployed backend if the environment variable is not supplied.

### Netlify environment variable

In Netlify, open:

**Site configuration → Environment variables**

Add:

```text
Key: VITE_API_URL
Value: https://study-steady-backend.onrender.com/api
```

Because this is a Vite `VITE_*` variable, it is read during the frontend build. **Redeploy the site after changing it.**

Do not put MongoDB credentials or backend secrets in frontend environment variables.

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then set:

```env
VITE_API_URL=https://study-steady-backend.onrender.com/api
```

For local backend development, you can instead use a local API URL, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Vite

```bash
npm run dev
```

Vite will print the local development address, normally something like:

```text
http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

The production output is generated in:

```text
dist/
```

### 5. Preview the production build

```bash
npm run preview
```

## Netlify deployment

This project includes `netlify.toml` with the expected Vite settings.

### Netlify settings

- Build command: `npm run build`
- Publish directory: `dist`
- Node/npm dependencies are installed automatically from `package.json`

The `netlify.toml` file also includes SPA fallback routing so React Router routes can be opened directly without Netlify returning a 404.

### Deploying from GitHub

1. Put the frontend project in a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Connect GitHub.
4. Select the frontend repository.
5. Use the build command `npm run build`.
6. Use `dist` as the publish directory.
7. Add `VITE_API_URL` as a Netlify environment variable.
8. Deploy.

### Deploying from a ZIP

If using Netlify's manual deployment workflow, extract the project first and build it with:

```bash
npm install
npm run build
```

Upload/deploy the generated `dist` directory for a manual static deployment. For continuous deployment, connecting the GitHub repository is preferable because Netlify can run the build automatically.

## Backend dependency

The frontend does not connect directly to MongoDB. All data requests go through the Express backend.

Current API:

```text
https://study-steady-backend.onrender.com/api
```

The backend must have the appropriate MongoDB and authentication environment variables configured on Render.

### Backend health check

Open:

```text
https://study-steady-backend.onrender.com/health
```

A successful deployment should return a JSON health response.

The root URL `/` does not need to return a webpage. A `Cannot GET /` response can simply mean there is no root Express route; use `/health` to test the API server.

## API functions used by the frontend

`src/Components/api.js` centralizes API communication.

It currently supports requests for:

- Authentication: register, login, delete account
- Goals: create, list, read, update, delete
- Courses: create
- Plans: create, list, read, update, delete, pause, resume, adjust, reminders
- Events: list, read, update, pause, resume, reminders
- Activities: start, complete, snooze, list
- Progress: progress and missed summary
- Account reminders: read and update
- Recovery: get recovery task, snooze and recover activity

Authenticated requests send:

```http
Authorization: Bearer <token>
```

## Account deletion

The frontend calls:

```http
DELETE /api/auth/account
```

with the user's authentication token and current password.

The account page requires the user to type:

```text
DELETE
```

before the request can be submitted.

The deletion operation is intended to permanently remove the user's account and associated StudySteady records handled by the backend. It cannot be undone, so the UI deliberately asks for confirmation.

## Important security notes

- Never commit `.env` files containing secrets.
- Never put `MONGO_URI`, `JWT_SECRET`, database passwords, or other backend secrets into the frontend.
- Anything beginning with `VITE_` is potentially exposed to users in the built frontend.
- The frontend should only contain public configuration such as the API base URL.
- Account deletion should always be authenticated by the backend; the frontend confirmation is only a user-experience safeguard.
- Keep the Render backend CORS configuration restricted to your real frontend domain when possible.

## Common deployment problems

### `Cannot GET /`

This does not automatically mean the backend is broken. Test:

```text
https://study-steady-backend.onrender.com/health
```

### Frontend still calls the old API

Check Netlify's environment variables:

```text
VITE_API_URL=https://study-steady-backend.onrender.com/api
```

Then trigger a new deployment. Vite environment variables are applied during the build.

### CORS error in the browser

Check the Render backend environment variable:

```text
CORS_ORIGINS=https://study-steady-n.netlify.app
```

Then redeploy/restart the backend if necessary.

### API requests return 401

The user token may be missing, expired, invalid, or the backend may have restarted with a changed authentication configuration. Log in again and retry.

### API requests return 500

Check the Render service logs. A 500 response usually requires investigation on the backend, database connection, validation, or server configuration.

### Netlify routes return 404 after refresh

Make sure `netlify.toml` is present and contains the SPA redirect. The project is already configured for React Router fallback routing.

## Available npm scripts

```bash
npm run dev
npm run build
npm run preview
```

## Version information

Current frontend package version:

```text
1.0.0
```

React:

```text
18.3.1
```

React Router:

```text
6.28.2
```

Vite:

```text
6.0.11
```

## Project deployment summary

```text
┌─────────────────────────────────────┐
│ Netlify                             │
│ https://study-steady-n.netlify.app/ │
│                                     │
│ React + Vite frontend               │
└─────────────────┬───────────────────┘
                  │
                  │ HTTPS / REST API
                  ▼
┌─────────────────────────────────────┐
│ Render                              │
│ https://study-steady-backend        │
│ .onrender.com                       │
│                                     │
│ Node.js + Express API               │
└─────────────────┬───────────────────┘
                  │
                  │ MongoDB
                  ▼
┌─────────────────────────────────────┐
│ MongoDB Atlas                       │
│                                     │
│ Application data                    │
└─────────────────────────────────────┘
```

## Recommended workflow for updates

1. Make changes in the frontend source.
2. Run `npm install` if dependencies changed.
3. Run `npm run build`.
4. Test the application locally or on a preview deployment.
5. Commit and push to GitHub.
6. Let Netlify build and deploy the updated frontend.
7. Verify API requests against the Render backend.
8. If backend endpoints changed, update `src/Components/api.js` and coordinate the backend deployment.

## Support checklist

Before reporting a deployment problem, verify:

- [ ] Netlify site loads.
- [ ] `VITE_API_URL` points to `https://study-steady-backend.onrender.com/api`.
- [ ] Netlify was redeployed after changing `VITE_API_URL`.
- [ ] Render backend is running.
- [ ] `/health` responds successfully.
- [ ] Render `CORS_ORIGINS` contains `https://study-steady-n.netlify.app`.
- [ ] MongoDB Atlas is reachable by the Render backend.
- [ ] Render has the required backend environment variables.
- [ ] Browser developer tools do not show an authentication or CORS error.

