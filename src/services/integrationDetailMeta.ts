import type { IntegrationSummary } from '../domain/sync/types'

export type ConnectionRowCopy = {
  title: string
  description: string
}

export type IntegrationDetailMeta = {
  categoryLabel: string
  stepCount: number
  overview: string
  howItWorks: [string, string]
  connectionRows: [ConnectionRowCopy, ConnectionRowCopy, ConnectionRowCopy]
}

const DEFAULT_META: IntegrationDetailMeta = {
  categoryLabel: 'BUSINESS TOOLS',
  stepCount: 4,
  overview: '',
  howItWorks: [
    'This integration uses secure OAuth and webhook subscriptions to keep your data in sync with minimal latency.',
    'Automation rules and field mappings can be configured so your team reviews changes before they are applied to production records.',
  ],
  connectionRows: [
    {
      title: 'Link your workspace account',
      description: 'Connect your API credentials so we can sync entities securely with your tenant.',
    },
    {
      title: 'Connect personal workspace',
      description: 'Authorize read and write scopes required for bidirectional synchronization.',
    },
    {
      title: 'Connected search & indexing',
      description: 'Search and reconcile records from your connected account across supported objects.',
    },
  ],
}

const BY_ID: Partial<Record<string, Partial<IntegrationDetailMeta>>> = {
  salesforce: {
    categoryLabel: 'CRM & SALES',
    stepCount: 5,
    overview:
      'Salesforce Sales Cloud: Unify accounts, contacts, and opportunities with your internal workspace. Review sync previews before merges and keep version history for every run. ',
    howItWorks: [
      'The Salesforce REST and Bulk APIs power reliable sync of standard and custom objects. Conflicts are surfaced field-by-field so your team can choose the winning value.',
      'Webhooks and scheduled jobs reconcile changes on a cadence you control, with full audit trails for compliance.',
    ],
    connectionRows: [
      {
        title: 'Link your Salesforce org',
        description: 'Integrate your Salesforce org with our application for seamless CRM alignment.',
      },
      {
        title: 'Connect production org',
        description: 'Connect with popular apps to automate tasks and keep sales data consistent.',
      },
      {
        title: 'Org-wide connected search',
        description: 'Search accounts and opportunities from your connected Salesforce org.',
      },
    ],
  },
  hubspot: {
    categoryLabel: 'MARKETING & CRM',
    stepCount: 4,
    overview:
      'HubSpot CRM: Sync contacts, companies, and lifecycle stages between HubSpot and your workspace. ',
    howItWorks: [
      'Contacts and deals sync through the HubSpot APIs with conflict detection when the same field changes in both systems.',
      'Lifecycle and list membership updates can be previewed before you approve a merge.',
    ],
    connectionRows: [
      {
        title: 'Link your HubSpot portal',
        description: 'Connect your HubSpot portal for contact and deal synchronization.',
      },
      {
        title: 'Connect marketing workspace',
        description: 'Automate handoffs between marketing and sales with shared record state.',
      },
      {
        title: 'Portal connected search',
        description: 'Search contacts and companies from your connected HubSpot account.',
      },
    ],
  },
  stripe: {
    categoryLabel: 'PAYMENTS',
    stepCount: 3,
    overview:
      'Stripe Billing: Keep subscription status, customers, and invoices aligned with your internal billing views. ',
    howItWorks: [
      'Stripe webhooks notify the sync service of subscription and invoice events in near real time.',
      'Sensitive payment data stays in Stripe; only metadata and references are mirrored locally.',
    ],
    connectionRows: [
      {
        title: 'Link your Stripe account',
        description: 'Connect Stripe for subscription and customer profile synchronization.',
      },
      {
        title: 'Connect live mode',
        description: 'Use restricted API keys scoped to the objects you need for sync.',
      },
      {
        title: 'Billing connected search',
        description: 'Look up customers and subscriptions from your connected Stripe account.',
      },
    ],
  },
  slack: {
    categoryLabel: 'COLLABORATION',
    stepCount: 4,
    overview:
      'Slack Workspace: Mirror membership and channel context for alerts when sync events need attention. ',
    howItWorks: [
      'Slack APIs deliver notifications to the right channels when conflicts or errors require review.',
      'Workspace installation is scoped to the channels you authorize.',
    ],
    connectionRows: [
      {
        title: 'Link your Slack workspace',
        description: 'Install the app to your workspace for sync notifications and digests.',
      },
      {
        title: 'Connect workspace channels',
        description: 'Route alerts to specific channels based on integration health.',
      },
      {
        title: 'Workspace connected search',
        description: 'Find recent sync messages from your connected Slack workspace.',
      },
    ],
  },
  zendesk: {
    categoryLabel: 'SUPPORT',
    stepCount: 4,
    overview:
      'Zendesk Support: Sync tickets and user profiles while handling OAuth securely. ',
    howItWorks: [
      'The Zendesk REST API pulls ticket and user updates; failures surface clearly when tokens expire.',
      'You can resolve credential issues and retry without losing audit history.',
    ],
    connectionRows: [
      {
        title: 'Link your Zendesk subdomain',
        description: 'Connect your Zendesk instance for ticket and user synchronization.',
      },
      {
        title: 'Connect support account',
        description: 'Authorize help desk scopes needed for read and write sync.',
      },
      {
        title: 'Support connected search',
        description: 'Search tickets from your connected Zendesk account.',
      },
    ],
  },
  intercom: {
    categoryLabel: 'CUSTOMER SUCCESS',
    stepCount: 4,
    overview:
      'Intercom Inbox: Align conversations and company data with your internal customer records. ',
    howItWorks: [
      'Intercom APIs sync people, companies, and conversation metadata for a single customer view.',
      'Inbound changes are previewed before merge to avoid overwriting critical fields.',
    ],
    connectionRows: [
      {
        title: 'Link your Intercom workspace',
        description: 'Connect Intercom for conversation and company attribute sync.',
      },
      {
        title: 'Connect inbox workspace',
        description: 'Automate CS workflows with shared data between systems.',
      },
      {
        title: 'Inbox connected search',
        description: 'Search conversations from your connected Intercom workspace.',
      },
    ],
  },
}

export function getIntegrationDetailMeta(integration: IntegrationSummary): IntegrationDetailMeta {
  const override = BY_ID[integration.id] ?? {}
  const overview =
    override.overview ??
    `${integration.name}: ${integration.description} Review sync previews, resolve conflicts field by field, and keep a full audit trail.`

  return {
    ...DEFAULT_META,
    ...override,
    overview,
    howItWorks: override.howItWorks ?? DEFAULT_META.howItWorks,
    connectionRows: override.connectionRows ?? DEFAULT_META.connectionRows,
  }
}
