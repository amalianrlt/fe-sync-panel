# Business Documentation

## Product Overview

Integration Sync Panel is a frontend experience for B2B SaaS teams to review and control incoming changes from connected systems (for example Salesforce, HubSpot, and Stripe) before applying them.

The product emphasizes safe synchronization through explicit preview, conflict resolution, and audit visibility.

## Target Users

- Operations and RevOps teams managing CRM/data integrations
- Admin users responsible for data quality and sync governance
- Support teams investigating failed or conflicting sync runs

## Business Goals

- Prevent accidental overwrites from external systems
- Make sync outcomes understandable to non-technical users
- Reduce time to resolve field-level conflicts
- Provide auditable history for compliance and incident review

## Core User Journey

1. User opens Integrations list and checks current statuses.
2. User opens a specific integration detail page.
3. User starts sync via **Sync Now**.
4. User reviews incoming changes in a modal preview.
5. If conflicts exist, user selects field-level winners (Local vs External).
6. User confirms acknowledgment checkbox and merges changes.
7. User validates update in history timeline and version snapshots.

## Key Capabilities

- Integrations table with status, version, and last sync metadata
- Sync preview from live endpoint
- Conflict resolution with explicit field decisions
- Required acknowledgment before merge
- Sync history + version snapshots for traceability
- Header notifications for important integration events

## Error and Risk Handling

- User-friendly error messages by error class (client/server/gateway/unknown)
- Retry path in sync modal after API failure
- Cancel/close behavior to avoid stale in-progress review sessions
- Manual merge confirmation guardrails to prevent unintended data writes

## UX Principles Applied

- Show loading, error, and success states clearly
- Keep high-risk actions explicit and reversible where possible
- Present conflict choices side-by-side for easier comparison
- Maintain context (history and versioning) on the same detail page

## Success Indicators

- Lower unresolved conflict count per sync session
- Reduced time from conflict detection to merge confirmation
- Fewer failed sync retries before successful completion
- Higher confidence in audit review due to clear timeline/history
