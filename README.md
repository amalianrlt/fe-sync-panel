# Integration Sync Panel

A frontend implementation of a Web App Integration Sync Panel for a B2B SaaS platform connecting to external providers such as Salesforce, HubSpot, and Stripe.

This app demonstrates:

- Integrations overview with sync status, last sync time, and versions
- Integration detail with `Sync Now` trigger
- Sync preview and conflict resolution with field-level decisions
- Sync history timeline and version snapshot inspection
- Typed API handling for 4xx/500/502 error classes

## Tech Stack

- React + TypeScript + Vite
- React Router for page routing
- Local mocked repositories for list/history/version data
- Live API call only for `Sync Now` endpoint

## Assumptions

These are the working assumptions for this submission:

- **Runtime:** You have **Node.js 20+** (for `npm` workflows) and/or **Docker** (for the containerized preview). See [Prerequisites](#prerequisites) below.
- **Network:** `npm install` can reach the public npm registry. The default **Sync Now** URL is reachable from your machine when you exercise that flow; the browser must be allowed to call it (**CORS** must permit your origin, e.g. `http://localhost:5173` or `http://localhost:4173`).
- **Scope:** There is **no authentication**, tenant switching, or real persistence to a server database. Integrations list, history, and version snapshots are **seeded and updated in-session** for demonstration.
- **Single session:** State is modeled for **one browser tab/session**; the goal is a clear review of sync UX, not multi-user concurrency.
- **Language:** UI copy is **English** only.

## Notes on design decisions

- **Data split:** Only **Sync Now** hits the live API. Everything else uses **seed data** plus a small **in-memory runtime store** (`syncRuntimeStore`) so list/detail/history stay consistent after a sync without implementing a full backend.
- **Sync orchestration:** **`useSyncFlow`** owns preview/conflict/merge lifecycle, **`AbortController`** + a request sequence guard avoid stale updates, and the integration detail view is **keyed by route param** so switching integrations does not leak state.
- **Safety UX:** Conflict review runs in a **modal** with loading and retryable errors; merge requires an **explicit acknowledgment** step.
- **API layer:** Sync responses are **validated** before mapping to domain types; failures surface as **typed errors** with messages suitable for the UI.

For file-level architecture, request lifecycle, and UI notes, see [Technical documentation](./TECHNICAL_DOCUMENTATION.md). Product context and journeys are in [Business documentation](./BUSINESS_DOCUMENTATION.md).

## Setup instructions

### Prerequisites

**Option A — run with Node (development)**

- Node.js **20+** (matches the Docker image)
- npm (comes with Node)

**Option B — run with Docker**

- [Docker](https://docs.docker.com/get-docker/) installed and running (Docker Desktop on macOS is fine)

### Install dependencies

From the project root:

```bash
npm install
```

### Run the app (development)

Starts Vite with hot reload:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Run the app (production build, local)

Builds static assets and serves them with Vite preview:

```bash
npm run build
npm run preview
```

Open the URL printed in the terminal (default **http://localhost:4173**).

### Run with Docker (recommended for reviewers)

This builds the production bundle inside the image and serves it with `vite preview` on port **4173**.

**1. Build the image** (from the project root, where `Dockerfile` lives):

```bash
docker build -t integration-sync-panel .
```

**2. Run the container** (maps host port 4173 to the app):

```bash
docker run --rm -p 4173:4173 integration-sync-panel
```

**3. Open the app**

- In the browser: **http://localhost:4173**

**4. Stop**

- In the terminal where the container is running, press **Ctrl+C**.

If port 4173 is already in use, map a different host port, for example:

```bash
docker run --rm -p 8080:4173 integration-sync-panel
```

Then open **http://localhost:8080**.

#### Sync API URL (optional)

By default the sync endpoint uses the built-in fallback. To override it (e.g. for staging), set when **building** the image:

```bash
docker build -t integration-sync-panel --build-arg VITE_SYNC_ENDPOINT=https://your-api.example/sync .
```

For local `npm` runs, use a Vite env file (e.g. `.env.local` — not committed):

```bash
VITE_SYNC_ENDPOINT=https://your-api.example/sync
```

### Required API (Sync Now)

The `Sync Now` action calls a sync preview API. Default URL:

`https://portier-takehometest.onrender.com/api/v1/data/sync`

Override with `VITE_SYNC_ENDPOINT` as described above, or see `src/services/syncApi.ts`.

### Run quality checks

```bash
npm run lint
npm run build
```

## Documentation

- [Business documentation](./BUSINESS_DOCUMENTATION.md)
- [Technical documentation](./TECHNICAL_DOCUMENTATION.md)

## Project structure

- `src/app`: routing
- `src/layouts`: top-level shell layout
- `src/pages`: integrations list + integration detail pages
- `src/components`: common and sync-focused UI components
- `src/domain/sync`: typed models and conflict utilities
- `src/services`: API client + mock data repository
- `src/hooks`: sync flow orchestration

## Notes

- Backend logic is intentionally not implemented.
- Only the `Sync Now` button calls the live endpoint.
- Remaining data behavior is modeled locally for reviewability and auditability flow demonstration.
