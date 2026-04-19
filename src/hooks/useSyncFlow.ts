import { useEffect, useMemo, useRef, useState } from 'react'
import { buildMergeValues, defaultResolutions, detectFieldConflicts } from '../domain/sync/conflict'
import type {
  IntegrationRecord,
  IntegrationSummary,
  ResolutionChoice,
  SyncHistoryEvent,
  SyncPreviewPayload,
  VersionSnapshot,
} from '../domain/sync/types'
import {
  getIntegrationRecord,
  getIntegrationSummary,
  getSyncHistory,
  getVersionSnapshots,
  patchIntegrationSummary,
  setIntegrationRecord as writeIntegrationRecord,
  setSyncHistory as writeSyncHistory,
  setVersionSnapshots as writeVersionSnapshots,
} from '../services/syncRuntimeStore'
import { SyncApiError, fetchSyncPreview } from '../services/syncApi'

function nowIso(): string {
  return new Date().toISOString()
}

export function useSyncFlow(integrationId: string | undefined) {
  const [integration, setIntegration] = useState<IntegrationSummary | undefined>(() =>
    getIntegrationSummary(integrationId),
  )
  const [integrationRecord, setIntegrationRecord] = useState<IntegrationRecord | undefined>(() => getIntegrationRecord(integrationId))
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEvent[]>(() => getSyncHistory(integrationId))
  const [versions, setVersions] = useState<VersionSnapshot[]>(() => getVersionSnapshots(integrationId))
  const [preview, setPreview] = useState<SyncPreviewPayload | null>(null)
  const [resolutions, setResolutions] = useState<Record<string, ResolutionChoice>>({})
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestSequenceRef = useRef(0)

  const conflicts = useMemo(() => {
    if (!integrationRecord || !preview) {
      return []
    }

    return detectFieldConflicts(integrationRecord.values, preview.changes)
  }, [integrationRecord, preview])

  const unresolvedCount = useMemo(() => {
    if (conflicts.length === 0) {
      return 0
    }

    return conflicts.filter((conflict) => !resolutions[conflict.id]).length
  }, [conflicts, resolutions])

  useEffect(
    () => () => {
      abortControllerRef.current?.abort()
    },
    [],
  )

  function applyIntegrationSummaryUpdate(
    id: string,
    updates: Partial<Pick<IntegrationSummary, 'lastSyncAt' | 'status' | 'version'>>,
  ) {
    const next = patchIntegrationSummary(id, updates)
    if (integrationId === id) {
      setIntegration(next)
    }
  }

  async function syncNow() {
    if (!integrationId || !integrationRecord) {
      setSyncError('Cannot sync: no integration is selected.')
      return
    }

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const requestId = requestSequenceRef.current + 1
    requestSequenceRef.current = requestId

    const syncEventId = `sync-${Date.now()}`
    const startedAt = nowIso()

    setIsSyncing(true)
    setSyncError(null)
    applyIntegrationSummaryUpdate(integrationId, {
      lastSyncAt: startedAt,
      status: 'SYNCING',
    })
    setSyncHistory((previous) => {
      const next = [
        {
          id: syncEventId,
          integrationId,
          status: 'SYNCING' as const,
          startedAt,
          source: integration?.provider ?? 'integration',
          summary: 'Sync in progress.',
          versionFrom: integration?.version ?? 'v0.00',
          versionTo: integration?.version ?? 'v0.00',
          changeCount: 0,
        },
        ...previous,
      ]
      writeSyncHistory(integrationId, next)
      return next
    })

    try {
      const nextPreview = await fetchSyncPreview(integrationId, controller.signal)
      if (requestId !== requestSequenceRef.current) {
        return
      }
      const nextConflicts = detectFieldConflicts(integrationRecord.values, nextPreview.changes)
      const finishedAt = nowIso()

      setPreview(nextPreview)
      setResolutions(defaultResolutions(nextConflicts))
      applyIntegrationSummaryUpdate(integrationId, {
        lastSyncAt: finishedAt,
        status: nextConflicts.length > 0 ? 'CONFLICT' : 'SYNCED',
      })
      setSyncHistory((previous) => {
        const next = previous.map((event) =>
          event.id === syncEventId
            ? {
                ...event,
                status: 'SUCCESS' as const,
                finishedAt,
                source: nextPreview.applicationName,
                summary: `Preview loaded with ${nextPreview.changes.length} incoming changes.`,
                changeCount: nextPreview.changes.length,
              }
            : event,
        )
        writeSyncHistory(integrationId, next)
        return next
      })
    } catch (error) {
      if (controller.signal.aborted || requestId !== requestSequenceRef.current) {
        setSyncHistory((previous) => {
          const next = previous.filter((event) => event.id !== syncEventId)
          writeSyncHistory(integrationId, next)
          return next
        })
        return
      }
      const failureMessage =
        error instanceof SyncApiError ? error.userMessage : 'Unexpected error while retrieving sync preview.'
      const finishedAt = nowIso()

      if (error instanceof SyncApiError) {
        setSyncError(error.userMessage)
      } else {
        setSyncError(failureMessage)
      }
      applyIntegrationSummaryUpdate(integrationId, {
        lastSyncAt: finishedAt,
        status: 'ERROR',
      })

      setSyncHistory((previous) => {
        const next = previous.map((event) =>
          event.id === syncEventId
            ? {
                ...event,
                status: 'ERROR' as const,
                finishedAt,
                summary: `Sync failed: ${failureMessage}`,
              }
            : event,
        )
        writeSyncHistory(integrationId, next)
        return next
      })
    } finally {
      if (requestId === requestSequenceRef.current) {
        setIsSyncing(false)
      }
    }
  }

  function setFieldResolution(conflictId: string, choice: ResolutionChoice) {
    setResolutions((previous) => ({
      ...previous,
      [conflictId]: choice,
    }))
  }

  function confirmMerge() {
    if (!integrationRecord || !preview || !integration || !integrationId) {
      return
    }

    const { mergedValues, decisions } = buildMergeValues(integrationRecord.values, preview.changes, resolutions)
    const nextVersion = `v${(Number.parseFloat(integration.version.replace('v', '')) + 0.01).toFixed(2)}`
    const mergedAt = nowIso()

    const nextRecord: IntegrationRecord = {
      ...integrationRecord,
      values: mergedValues,
    }
    setIntegrationRecord(nextRecord)
    writeIntegrationRecord(integrationId, nextRecord)

    setVersions((previous) => {
      const next = [
        {
          id: `snapshot-${Date.now()}`,
          integrationId: integration.id,
          version: nextVersion,
          createdAt: nowIso(),
          notes: `Manual review completed. ${decisions.length} fields resolved.`,
          values: mergedValues,
        },
        ...previous,
      ]
      writeVersionSnapshots(integrationId, next)
      return next
    })

    setSyncHistory((previous) => {
      const next = [
        {
          id: `merge-${Date.now()}`,
          integrationId: integration.id,
          status: 'SUCCESS' as const,
          startedAt: mergedAt,
          finishedAt: mergedAt,
          source: preview.applicationName,
          summary: `Merge approved after review. ${decisions.length} field decisions captured.`,
          versionFrom: integration.version,
          versionTo: nextVersion,
          changeCount: preview.changes.length,
        },
        ...previous,
      ]
      writeSyncHistory(integrationId, next)
      return next
    })

    applyIntegrationSummaryUpdate(integration.id, {
      lastSyncAt: mergedAt,
      status: 'SYNCED',
      version: nextVersion,
    })
    setPreview(null)
    setResolutions({})
  }

  function resetSyncSession() {
    abortControllerRef.current?.abort()
    requestSequenceRef.current += 1
    setIsSyncing(false)
    setPreview(null)
    setResolutions({})
    setSyncError(null)
    setSyncHistory((previous) => {
      const pendingSyncIndex = previous.findIndex((event) => event.status === 'SYNCING')
      if (pendingSyncIndex === -1) {
        return previous
      }

      const next = previous.filter((_, index) => index !== pendingSyncIndex)
      if (integrationId) {
        writeSyncHistory(integrationId, next)
      }
      return next
    })
  }

  return {
    integration,
    integrationRecord,
    syncHistory,
    versions,
    preview,
    conflicts,
    resolutions,
    unresolvedCount,
    syncError,
    isSyncing,
    syncNow,
    setFieldResolution,
    confirmMerge,
    resetSyncSession,
  }
}
