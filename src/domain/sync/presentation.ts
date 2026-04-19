import type { IntegrationProvider, IntegrationStatus, SyncHistoryStatus } from './types'

export const providerAvatarClass: Record<IntegrationProvider, string> = {
  Salesforce: 'salesforce',
  HubSpot: 'hubspot',
  Stripe: 'stripe',
  Slack: 'slack',
  Zendesk: 'zendesk',
  Intercom: 'intercom',
}

export const integrationStatusLabel: Record<IntegrationStatus, string> = {
  SYNCED: 'Synced',
  SYNCING: 'Syncing',
  CONFLICT: 'Conflict',
  ERROR: 'Failed',
}

export const historyStatusBadgeClass: Record<SyncHistoryStatus, 'synced' | 'syncing' | 'conflict' | 'error'> = {
  SUCCESS: 'synced',
  SYNCING: 'syncing',
  CONFLICT: 'conflict',
  ERROR: 'error',
}
