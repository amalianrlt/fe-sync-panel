import type { IntegrationRecord, IntegrationSummary, SyncHistoryEvent, VersionSnapshot } from '../domain/sync/types'
import { integrationRecords, integrations, syncHistoryByIntegration, versionSnapshotsByIntegration } from './mockData'

const integrationOrder = integrations.map((integration) => integration.id)

const integrationSummaryStore = new Map(
  integrations.map((integration) => [integration.id, { ...integration }] satisfies [string, IntegrationSummary]),
)

const integrationRecordStore = Object.fromEntries(
  Object.entries(integrationRecords).map(([id, record]) => [
    id,
    {
      integrationId: record.integrationId,
      values: { ...record.values },
    },
  ]),
) as Record<string, IntegrationRecord>

const syncHistoryStore = Object.fromEntries(
  Object.entries(syncHistoryByIntegration).map(([id, events]) => [id, events.map((event) => ({ ...event }))]),
) as Record<string, SyncHistoryEvent[]>

const versionSnapshotStore = Object.fromEntries(
  Object.entries(versionSnapshotsByIntegration).map(([id, versions]) => [
    id,
    versions.map((version) => ({
      ...version,
      values: { ...version.values },
    })),
  ]),
) as Record<string, VersionSnapshot[]>

export function listIntegrationSummaries(): IntegrationSummary[] {
  return integrationOrder
    .map((id) => integrationSummaryStore.get(id))
    .filter((integration): integration is IntegrationSummary => Boolean(integration))
    .map((integration) => ({ ...integration }))
}

export function getIntegrationSummary(integrationId: string | undefined): IntegrationSummary | undefined {
  if (!integrationId) return undefined
  const integration = integrationSummaryStore.get(integrationId)
  return integration ? { ...integration } : undefined
}

export function patchIntegrationSummary(
  integrationId: string,
  updates: Partial<Pick<IntegrationSummary, 'lastSyncAt' | 'status' | 'version'>>,
): IntegrationSummary | undefined {
  const current = integrationSummaryStore.get(integrationId)
  if (!current) return undefined
  const next = { ...current, ...updates }
  integrationSummaryStore.set(integrationId, next)
  return { ...next }
}

export function getIntegrationRecord(integrationId: string | undefined): IntegrationRecord | undefined {
  if (!integrationId) return undefined
  const record = integrationRecordStore[integrationId]
  if (!record) return undefined
  return {
    integrationId: record.integrationId,
    values: { ...record.values },
  }
}

export function setIntegrationRecord(integrationId: string, record: IntegrationRecord) {
  integrationRecordStore[integrationId] = {
    integrationId: record.integrationId,
    values: { ...record.values },
  }
}

export function getSyncHistory(integrationId: string | undefined): SyncHistoryEvent[] {
  if (!integrationId) return []
  return (syncHistoryStore[integrationId] ?? []).map((event) => ({ ...event }))
}

export function setSyncHistory(integrationId: string, events: SyncHistoryEvent[]) {
  syncHistoryStore[integrationId] = events.map((event) => ({ ...event }))
}

export function getVersionSnapshots(integrationId: string | undefined): VersionSnapshot[] {
  if (!integrationId) return []
  return (versionSnapshotStore[integrationId] ?? []).map((version) => ({
    ...version,
    values: { ...version.values },
  }))
}

export function setVersionSnapshots(integrationId: string, versions: VersionSnapshot[]) {
  versionSnapshotStore[integrationId] = versions.map((version) => ({
    ...version,
    values: { ...version.values },
  }))
}
