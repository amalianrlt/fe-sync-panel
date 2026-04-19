# Technical Documentation

## Architecture Summary

The project is a React + TypeScript + Vite frontend with a layered structure:

- **UI layer**: pages/layout/components responsible for rendering and interactions
- **Business logic layer**: `useSyncFlow` hook and domain utilities for conflict/merge logic
- **API layer**: `syncApi` client for live sync preview retrieval
- **Runtime data store**: `syncRuntimeStore` for in-session integration, history, and version state

## Key Technical Decisions

### 1. Separation of concerns

- Domain logic is isolated in `src/domain/sync/`:
  - `types.ts` for shared contracts
  - `conflict.ts` for deterministic conflict and merge behavior
- API concerns are isolated in `src/services/syncApi.ts`.
- Orchestration is centralized in `src/hooks/useSyncFlow.ts`.
- Presentation mapping is centralized in `src/domain/sync/presentation.ts`.

### 2. Sync workflow handling

`useSyncFlow` handles:

- Sync start/finish lifecycle
- Modal state inputs (`preview`, `conflicts`, `resolutions`, `syncError`, `isSyncing`)
- Conflict resolution updates
- Merge confirmation and history/version updates
- Session reset behavior

### 3. Request safety

- `AbortController` is used per sync invocation.
- Previous requests are aborted before new sync runs.
- Sequence guard protects against late/stale response updates.
- Abort cleanup occurs on unmount.

### 4. Route-param correctness

Integration detail page content is keyed by `integrationId` so state does not bleed across `/integrations/:integrationId` transitions.

### 5. Runtime state ownership

`src/services/syncRuntimeStore.ts` is the in-session source of truth for:

- integration summaries
- integration records
- sync history
- version snapshots

`mockData.ts` now acts as seed data rather than mutable runtime persistence.

## API Integration

- Endpoint configured via `VITE_SYNC_ENDPOINT` with a default fallback.
- Response shape is validated before mapping to domain payload.
- Failures are wrapped in typed `SyncApiError` with user-safe messages and error kind classification.

## UI/UX Implementation Notes

- Conflict resolution uses a modal with:
  - loading state
  - retryable error state
  - preview + conflict table
  - acknowledgment gate before merge
- History timeline badge semantics align with status classes (`synced`, `syncing`, `conflict`, `error`).
- Reusable `Button` component is used for non-pagination button actions.
- Icons are standardized with `iconsax-react`.

## Project Structure

- `src/app` - router setup
- `src/layouts` - shell layout and header interactions
- `src/pages` - list/detail page composition
- `src/components` - reusable and feature-specific UI
- `src/hooks` - sync flow orchestration
- `src/services` - API client, seed data, runtime store
- `src/domain/sync` - domain types, business rules, presentation mappings

## Quality Gates

Primary checks:

- `npm run lint`
- `npm run build`

These validate code quality standards and TypeScript/build integrity.
