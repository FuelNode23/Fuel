# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Athlete Nutrition Planner" (FuelNode) — a React frontend that walks an athlete through an onboarding
questionnaire, sends their answers to a backend that calls Claude to generate a personalized nutrition
protocol, and renders that protocol (macros, diet/fueling plans, specialist protocols, weekly product box).
No test suite or linter is configured in this repo.

## Commands

```
npm run dev       # start Vite dev server on port 5173
npm run build     # production build to dist/
npm run preview   # preview the production build
```

There is no test or lint script — none is configured in `package.json`.

## Environment

The API base URL is read from `VITE_API_BASE_URL` (see `src/api/client.js`), falling back to a hardcoded
EC2 IP if unset. Set it in a local `.env`/`.env.local` (both gitignored) when pointing at a different backend.

Deployment (`.github/workflows/deploy.yml`) builds on push to `develop` and SCPs `dist/` to an EC2 instance,
served from `/var/www/fuelnode`.

## Architecture

**Path alias**: `@` → `src/` (configured in `vite.config.js`).

**Provider nesting** (`src/main.jsx`): `BrowserRouter` → `LanguageProvider` → `AuthProvider` → `App`.
`AuthProvider` calls `useNavigate`, so it must stay inside `BrowserRouter`.

**Routing** (`src/routes/AppRoutes.jsx`): flat route list, no nested layouts. `/` redirects to `/login`,
unknown paths redirect to `/login`. `PrivateRoute` (`src/components/PrivateRoute.jsx`) exists for gating
routes on auth but most routes in `AppRoutes.jsx` are currently unwrapped by it.

**Auth** (`src/context/AuthContext.jsx`): token + user JSON stored in `localStorage` under `token`/`user`.
Axios interceptor in `src/api/client.js` attaches the bearer token to every request and clears storage on a
401 response. A 30-minute inactivity timer (mouse/keyboard/scroll/touch) auto-logs-out and redirects to
`/login` while a user session is active.

**i18n** (`src/i18n/LanguageContext.jsx`): no key-based translation system — English is the literal source
text used at every call site. `t("Some English sentence")` looks up that exact string in `src/i18n/fr.js`
when the active language is `fr`, and returns the original string unchanged otherwise (or as a fallback for
untranslated strings). Language is persisted to `localStorage` (`fn_language`) and applies app-wide. When
adding user-facing text, wrap it in `t(...)` and add the French string to `fr.js` keyed by the exact English
text.

**Onboarding flow** (`src/pages/OnboardingFlow.jsx` + `src/api/Questions.js`): entirely data-driven. All
question steps, field types (`text`, `select`, `multi-select`, `connect`), conditional fields, and
sport-dependent dropdown options live in the `questions` array in `Questions.js` — the flow, progress bar,
and step counter derive from it automatically, so most new questions don't need code changes to
`OnboardingFlow.jsx`. The flow includes an auth gate (register/login) before questions begin, and pre-fills
answers from an existing saved profile (`GET /athletes/profile`) via `mapProfileToUserData` for returning
users. Onboarding can be filled out anonymously; if `POST /protocol/generate-with-profile` 401s, answers are
stashed in `sessionStorage` (`pendingOnboarding`) and the user is sent to auth — `completePendingOnboarding`
in `src/api/client.js` resumes the submission right after login/register succeeds.

**Protocol generation is a single call**: `submitOnboarding` in `src/api/client.js` (`POST
/protocol/generate-with-profile`) is the *only* place that triggers Claude generation — it's called once
from `OnboardingFlow` on "Finish". The response is Claude's generated protocol JSON in snake_case, matching
the backend's system prompt schema (`main/resources/prompts/protocol-system.txt`) — see the doc comments at
the top of `src/api/client.js` and `src/api/Protocoladapters.js` for the full confirmed field list. That
shape is handed forward via `navigate(..., { state })` (fresh navigation) *and* mirrored into
`sessionStorage` under `protocolHandoff` (survives a hard refresh, since router state does not) — `Protocol`
and `WeeklyBox` pages read state first and fall back to sessionStorage. Don't add a second call site for
protocol generation; extend the existing flow instead.

**Protocol display** (`src/pages/Protocol.jsx` + `src/Protocol/*.jsx`): child components
(`DietProtocol`, `FuelingProtocol`, `MacroTargets`, `AthleteSummary`, `SpecialistProtocols`, `WeeklyBox`,
`ScienceCards`, etc.) are built directly against the backend's snake_case field names, so most props pass
straight through. `src/api/Protocoladapters.js` only covers genuine gaps between what the model returns and
what a component expects (e.g. `active_specialist_protocols` arrives as plain strings but
`SpecialistProtocols` wants objects) and guards against fields being missing/null, which the prompt allows.
Prefer extending an adapter over reshaping data ad hoc inside a component.
