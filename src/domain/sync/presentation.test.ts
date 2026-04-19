import { describe, expect, it } from 'vitest'

import {
  historyStatusBadgeClass,
  integrationStatusLabel,
  providerAvatarClass,
} from './presentation'
import type { IntegrationProvider, IntegrationStatus, SyncHistoryStatus } from './types'

describe('presentation maps', () => {
  // This test verifies that every IntegrationProvider has a non-empty, lowercase CSS avatar modifier class.
  it('defines an avatar class for every integration provider', () => {
    const providers: IntegrationProvider[] = [
      'Salesforce',
      'HubSpot',
      'Stripe',
      'Slack',
      'Zendesk',
      'Intercom',
    ]
    for (const p of providers) {
      expect(providerAvatarClass[p]).toMatch(/^[a-z]+$/)
    }
  })

  // This test verifies that each IntegrationStatus maps to the exact user-facing label shown in the UI.
  it('defines a label for every integration status', () => {
    const statuses: IntegrationStatus[] = ['SYNCED', 'SYNCING', 'CONFLICT', 'ERROR']
    expect(statuses.map((s) => integrationStatusLabel[s])).toEqual([
      'Synced',
      'Syncing',
      'Conflict',
      'Failed',
    ])
  })

  // This test verifies that each sync history status maps to the correct badge style token (synced/syncing/conflict/error).
  it('maps history statuses to badge classes', () => {
    const rows: [SyncHistoryStatus, string][] = [
      ['SUCCESS', 'synced'],
      ['SYNCING', 'syncing'],
      ['CONFLICT', 'conflict'],
      ['ERROR', 'error'],
    ]
    for (const [status, badge] of rows) {
      expect(historyStatusBadgeClass[status]).toBe(badge)
    }
  })
})
