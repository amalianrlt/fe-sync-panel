import { useEffect, useId, useRef, useState } from 'react'
import { CloseCircle } from 'iconsax-react'
import { createPortal } from 'react-dom'
import { Button } from '../common/Button'
import { formatFieldDisplayName } from '../../domain/sync/fieldDisplayName'
import type { ConflictRecord, ResolutionChoice, SyncPreviewPayload } from '../../domain/sync/types'
import { SyncPreviewPanel } from './SyncPreviewPanel'

export interface ConflictResolutionPanelProps {
  open: boolean
  sessionKey: number
  onClose: () => void
  isSyncing: boolean
  syncError: string | null
  preview: SyncPreviewPayload | null
  conflicts: ConflictRecord[]
  resolutions: Record<string, ResolutionChoice>
  unresolvedCount: number
  onResolutionChange: (conflictId: string, choice: ResolutionChoice) => void
  onRetrySync: () => void
  onConfirmMerge: () => void
}

function SyncModalFooter({
  unresolvedCount,
  onClose,
  onConfirmMerge,
}: {
  unresolvedCount: number
  onClose: () => void
  onConfirmMerge: () => void
}) {
  const [dataAcknowledged, setDataAcknowledged] = useState(false)

  const mergeDisabled = !dataAcknowledged || unresolvedCount > 0

  return (
    <div className="sync-modal-footer">
      <label className="sync-modal-ack">
        <input
          type="checkbox"
          checked={dataAcknowledged}
          onChange={(event) => setDataAcknowledged(event.target.checked)}
        />
        <span>I confirm the reviewed data is correct before merging.</span>
      </label>
      <div className="sync-modal-footer-actions">
        <Button type="button" className="integration-detail-btn integration-detail-btn--secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          className="integration-detail-btn integration-detail-btn--primary"
          onClick={onConfirmMerge}
          disabled={mergeDisabled}
        >
          Confirm merge
        </Button>
      </div>
    </div>
  )
}

export function ConflictResolutionPanel({
  open,
  sessionKey,
  onClose,
  isSyncing,
  syncError,
  preview,
  conflicts,
  resolutions,
  unresolvedCount,
  onResolutionChange,
  onRetrySync,
  onConfirmMerge,
}: ConflictResolutionPanelProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const node = panelRef.current
    if (!node) return
    const focusable = node.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [open, isSyncing, syncError, preview])

  const previewFingerprint = preview
    ? `${preview.applicationName}:${preview.changes.map((c) => c.id).join(':')}`
    : ''

  if (!open) {
    return null
  }

  const modal = (
    <div className="sync-modal-root" role="presentation">
      <Button
        type="button"
        className="sync-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="sync-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sync-modal-header">
          <h2 id={titleId} className="sync-modal-title">
            Review sync changes
          </h2>
          <Button type="button" className="sync-modal-close" onClick={onClose} aria-label="Close">
            <CloseCircle color="currentColor" size={20} variant="Linear" aria-hidden />
          </Button>
        </div>

        <div className="sync-modal-body">
          {isSyncing ? (
            <div className="sync-modal-loading" role="status" aria-live="polite">
              <div className="sync-modal-spinner" aria-hidden />
              <p>Loading sync data from the API…</p>
            </div>
          ) : syncError ? (
            <div className="sync-modal-error" role="alert">
              <p>{syncError}</p>
              <div className="sync-modal-error-actions">
                <Button type="button" className="integration-detail-btn integration-detail-btn--primary" onClick={onRetrySync}>
                  Retry
                </Button>
                <Button type="button" className="integration-detail-btn integration-detail-btn--secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : preview ? (
            <>
              <div className="sync-modal-preview">
                <SyncPreviewPanel changes={preview.changes} variant="modal" />
              </div>

              <div className="sync-modal-conflicts">
                <div className="panel-heading">
                  <h3>Field-level conflict resolution</h3>
                  <p>Choose the winning value for each conflicting field.</p>
                </div>
                {conflicts.length === 0 ? (
                  <p className="muted">No update conflicts were detected.</p>
                ) : (
                  <div className="conflict-table-wrap">
                    <table className="table conflict-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Severity</th>
                          <th>Current source</th>
                          <th>Local value</th>
                          <th>External value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conflicts.map((conflict) => (
                          <tr key={conflict.id}>
                            <td>
                              <strong title={conflict.fieldName}>{formatFieldDisplayName(conflict.fieldName)}</strong>
                            </td>
                            <td>
                              <span className={`badge ${conflict.severity === 'HIGH' ? 'error' : 'synced'}`}>
                                {conflict.severity === 'HIGH' ? 'High risk' : 'Low risk'}
                              </span>
                            </td>
                            <td>
                              <code>{conflict.sourceCurrentValue}</code>
                            </td>
                            <td>
                              <label
                                className={`conflict-choice ${resolutions[conflict.id] === 'LOCAL' ? 'conflict-choice--selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={conflict.id}
                                  checked={resolutions[conflict.id] === 'LOCAL'}
                                  onChange={() => onResolutionChange(conflict.id, 'LOCAL')}
                                />
                                <span>
                                  Keep local
                                  <code>{conflict.localValue}</code>
                                </span>
                              </label>
                            </td>
                            <td>
                              <label
                                className={`conflict-choice ${resolutions[conflict.id] === 'EXTERNAL' ? 'conflict-choice--selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={conflict.id}
                                  checked={resolutions[conflict.id] === 'EXTERNAL'}
                                  onChange={() => onResolutionChange(conflict.id, 'EXTERNAL')}
                                />
                                <span>
                                  Use external
                                  <code>{conflict.externalValue}</code>
                                </span>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="muted">No preview loaded.</p>
          )}
        </div>

        {!isSyncing && !syncError && preview ? (
          <SyncModalFooter
            key={`${sessionKey}-${previewFingerprint}`}
            unresolvedCount={unresolvedCount}
            onClose={onClose}
            onConfirmMerge={onConfirmMerge}
          />
        ) : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
