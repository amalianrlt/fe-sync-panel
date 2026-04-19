import type {
  IntegrationRecord,
  IntegrationSummary,
  NotificationItem,
  SyncHistoryEvent,
  VersionSnapshot,
} from '../domain/sync/types'

export const integrations: IntegrationSummary[] = [
  {
    id: 'salesforce',
    name: 'Salesforce Sales Cloud',
    provider: 'Salesforce',
    status: 'SYNCED',
    description: 'Accounts, contacts, and opportunities stay aligned with your workspace.',
    lastSyncAt: '2026-04-19T08:42:00.000Z',
    version: 'v2.08',
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    provider: 'HubSpot',
    status: 'CONFLICT',
    description: 'Marketing and sales contacts sync bidirectionally with lifecycle stages.',
    lastSyncAt: '2026-04-19T09:13:00.000Z',
    version: 'v1.42',
  },
  {
    id: 'stripe',
    name: 'Stripe Billing',
    provider: 'Stripe',
    status: 'SYNCING',
    description: 'Subscriptions, invoices, and customer billing profiles.',
    lastSyncAt: '2026-04-19T09:20:00.000Z',
    version: 'v3.01',
  },
  {
    id: 'slack',
    name: 'Slack Workspace',
    provider: 'Slack',
    status: 'SYNCED',
    description: 'Channel membership and workspace notifications for sync alerts.',
    lastSyncAt: '2026-04-19T08:05:00.000Z',
    version: 'v1.15',
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support',
    provider: 'Zendesk',
    status: 'ERROR',
    description: 'Tickets and user profiles; last run failed on OAuth refresh.',
    lastSyncAt: '2026-04-19T07:58:00.000Z',
    version: 'v0.97',
  },
  {
    id: 'intercom',
    name: 'Intercom Inbox',
    provider: 'Intercom',
    status: 'SYNCED',
    description: 'Conversations and company attributes for customer success.',
    lastSyncAt: '2026-04-19T10:01:00.000Z',
    version: 'v4.22',
  },
]

export const headerNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    integrationId: 'hubspot',
    title: 'Conflict needs review',
    message: 'HubSpot sync found a conflict on Email. Review and choose the winning value.',
    severity: 'warning',
    createdAt: '2026-04-19T10:14:00.000Z',
    read: false,
  },
  {
    id: 'notif-002',
    integrationId: 'zendesk',
    title: 'Sync failed',
    message: 'Zendesk OAuth token refresh failed. Reconnect credentials and retry sync.',
    severity: 'error',
    createdAt: '2026-04-19T09:58:00.000Z',
    read: false,
  },
  {
    id: 'notif-003',
    integrationId: 'salesforce',
    title: 'Sync completed',
    message: 'Salesforce sync finished successfully with 3 applied updates.',
    severity: 'success',
    createdAt: '2026-04-19T08:42:15.000Z',
    read: true,
  },
  {
    id: 'notif-004',
    integrationId: 'intercom',
    title: 'Merge approved',
    message: 'Manual review was completed and Intercom merge was applied.',
    severity: 'info',
    createdAt: '2026-04-19T10:01:20.000Z',
    read: true,
  },
]

export const integrationRecords: Record<string, IntegrationRecord> = {
  salesforce: {
    integrationId: 'salesforce',
    values: {
      'user.email': 'evan.temp@company.com',
      'user.role': 'manager',
      'door.location': 'HQ - West Lobby',
    },
  },
  hubspot: {
    integrationId: 'hubspot',
    values: {
      'user.email': 'john@company.com',
      'user.phone': '+1-202-555-0144',
      'user.status': 'active',
      'door.status': 'online',
      'key.status': 'active',
    },
  },
  stripe: {
    integrationId: 'stripe',
    values: {
      'user.email': 'billing@company.com',
      'user.status': 'active',
      'key.status': 'active',
    },
  },
  slack: {
    integrationId: 'slack',
    values: {
      'user.email': 'ops@company.com',
      'user.name': 'Operations Bot',
      'user.status': 'active',
    },
  },
  zendesk: {
    integrationId: 'zendesk',
    values: {
      'user.email': 'support@company.com',
      'user.role': 'agent',
      'door.status': 'offline',
    },
  },
  intercom: {
    integrationId: 'intercom',
    values: {
      'user.email': 'cs@company.com',
      'user.name': 'Customer Success',
      'user.status': 'active',
    },
  },
}

export const syncHistoryByIntegration: Record<string, SyncHistoryEvent[]> = {
  salesforce: [
    {
      id: 'hist-salesforce-001',
      integrationId: 'salesforce',
      status: 'SUCCESS',
      startedAt: '2026-04-19T08:41:26.000Z',
      finishedAt: '2026-04-19T08:42:00.000Z',
      source: 'Salesforce',
      summary: 'Opportunity owner and account metadata synchronized.',
      versionFrom: 'v2.07',
      versionTo: 'v2.08',
      changeCount: 3,
    },
  ],
  hubspot: [
    {
      id: 'hist-hubspot-001',
      integrationId: 'hubspot',
      status: 'CONFLICT',
      startedAt: '2026-04-19T09:12:12.000Z',
      finishedAt: '2026-04-19T09:13:00.000Z',
      source: 'HubSpot',
      summary: '1 field requires manual review before merge.',
      versionFrom: 'v1.41',
      versionTo: 'v1.42',
      changeCount: 1,
    },
    {
      id: 'hist-hubspot-000',
      integrationId: 'hubspot',
      status: 'SUCCESS',
      startedAt: '2026-04-18T16:50:00.000Z',
      finishedAt: '2026-04-18T16:50:32.000Z',
      source: 'HubSpot',
      summary: 'Contact lifecycle updates applied.',
      versionFrom: 'v1.40',
      versionTo: 'v1.41',
      changeCount: 4,
    },
  ],
  stripe: [
    {
      id: 'hist-stripe-001',
      integrationId: 'stripe',
      status: 'SYNCING',
      startedAt: '2026-04-19T09:20:00.000Z',
      source: 'Stripe',
      summary: 'Billing events currently being processed.',
      versionFrom: 'v3.00',
      versionTo: 'v3.01',
      changeCount: 2,
    },
  ],
  slack: [
    {
      id: 'hist-slack-001',
      integrationId: 'slack',
      status: 'SUCCESS',
      startedAt: '2026-04-19T08:04:00.000Z',
      finishedAt: '2026-04-19T08:05:00.000Z',
      source: 'Slack',
      summary: 'Workspace membership verified; no pending changes.',
      versionFrom: 'v1.14',
      versionTo: 'v1.15',
      changeCount: 0,
    },
  ],
  zendesk: [
    {
      id: 'hist-zendesk-001',
      integrationId: 'zendesk',
      status: 'ERROR',
      startedAt: '2026-04-19T07:57:05.000Z',
      finishedAt: '2026-04-19T07:58:00.000Z',
      source: 'Zendesk',
      summary: 'OAuth token refresh failed; check app credentials.',
      versionFrom: 'v0.96',
      versionTo: 'v0.97',
      changeCount: 0,
    },
  ],
  intercom: [
    {
      id: 'hist-intercom-001',
      integrationId: 'intercom',
      status: 'SUCCESS',
      startedAt: '2026-04-19T10:00:10.000Z',
      finishedAt: '2026-04-19T10:01:00.000Z',
      source: 'Intercom',
      summary: 'Company and user attributes synchronized.',
      versionFrom: 'v4.21',
      versionTo: 'v4.22',
      changeCount: 5,
    },
  ],
}

export const versionSnapshotsByIntegration: Record<string, VersionSnapshot[]> = {
  salesforce: [
    {
      id: 'snap-salesforce-208',
      integrationId: 'salesforce',
      version: 'v2.08',
      createdAt: '2026-04-19T08:42:00.000Z',
      notes: 'Sales owner updates applied.',
      values: {
        'user.email': 'evan.temp@company.com',
        'user.role': 'manager',
        'door.location': 'HQ - West Lobby',
      },
    },
  ],
  hubspot: [
    {
      id: 'snap-hubspot-142',
      integrationId: 'hubspot',
      version: 'v1.42',
      createdAt: '2026-04-19T09:13:00.000Z',
      notes: 'Pending conflict decision for user.email.',
      values: {
        'user.email': 'john@company.com',
        'user.phone': '+1-202-555-0144',
        'user.status': 'active',
      },
    },
    {
      id: 'snap-hubspot-141',
      integrationId: 'hubspot',
      version: 'v1.41',
      createdAt: '2026-04-18T16:50:32.000Z',
      notes: 'Lifecycle stage updates merged.',
      values: {
        'user.email': 'john@company.com',
        'user.phone': '+1-202-555-0144',
        'user.status': 'suspended',
      },
    },
  ],
  stripe: [
    {
      id: 'snap-stripe-301',
      integrationId: 'stripe',
      version: 'v3.01',
      createdAt: '2026-04-19T09:20:00.000Z',
      notes: 'Sync currently running.',
      values: {
        'user.email': 'billing@company.com',
        'key.status': 'active',
      },
    },
  ],
  slack: [
    {
      id: 'snap-slack-115',
      integrationId: 'slack',
      version: 'v1.15',
      createdAt: '2026-04-19T08:05:00.000Z',
      notes: 'Workspace link stable.',
      values: {
        'user.email': 'ops@company.com',
        'user.name': 'Operations Bot',
      },
    },
  ],
  zendesk: [
    {
      id: 'snap-zendesk-097',
      integrationId: 'zendesk',
      version: 'v0.97',
      createdAt: '2026-04-19T07:58:00.000Z',
      notes: 'Sync failed due to OAuth.',
      values: {
        'user.email': 'support@company.com',
        'user.role': 'agent',
      },
    },
  ],
  intercom: [
    {
      id: 'snap-intercom-422',
      integrationId: 'intercom',
      version: 'v4.22',
      createdAt: '2026-04-19T10:01:00.000Z',
      notes: 'Inbox and people data snapshot.',
      values: {
        'user.email': 'cs@company.com',
        'user.name': 'Customer Success',
      },
    },
  ],
}
