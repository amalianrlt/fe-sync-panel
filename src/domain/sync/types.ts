export type IntegrationStatus = 'SYNCED' | 'SYNCING' | 'CONFLICT' | 'ERROR'

export type SyncChangeType = 'CREATE' | 'UPDATE' | 'DELETE'

export type IntegrationProvider =
  | 'Salesforce'
  | 'HubSpot'
  | 'Stripe'
  | 'Slack'
  | 'Zendesk'
  | 'Intercom'

export interface IntegrationSummary {
  id: string
  name: string
  provider: IntegrationProvider
  status: IntegrationStatus
  description: string
  lastSyncAt: string
  version: string
}

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success'

export interface NotificationItem {
  id: string
  integrationId: string
  title: string
  message: string
  severity: NotificationSeverity
  createdAt: string
  read: boolean
}

export interface SyncChange {
  id: string
  fieldName: string
  changeType: SyncChangeType
  currentValue: string
  newValue: string
}

export interface SyncPreviewPayload {
  applicationName: string
  changes: SyncChange[]
}

export type ConflictSeverity = 'LOW' | 'HIGH'

export interface ConflictRecord {
  id: string
  fieldName: string
  localValue: string
  externalValue: string
  sourceCurrentValue: string
  suggestedResolution: ResolutionChoice
  severity: ConflictSeverity
}

export type ResolutionChoice = 'LOCAL' | 'EXTERNAL'

export interface SyncDecision {
  conflictId: string
  fieldName: string
  selectedSource: ResolutionChoice
  resolvedValue: string
  resolvedAt: string
}

export type SyncHistoryStatus = 'SUCCESS' | 'ERROR' | 'CONFLICT' | 'SYNCING'

export interface SyncHistoryEvent {
  id: string
  integrationId: string
  status: SyncHistoryStatus
  startedAt: string
  finishedAt?: string
  source: string
  summary: string
  versionFrom: string
  versionTo: string
  changeCount: number
}

export interface VersionSnapshot {
  id: string
  integrationId: string
  version: string
  createdAt: string
  notes: string
  values: Record<string, string>
}

export interface IntegrationRecord {
  integrationId: string
  values: Record<string, string>
}
