import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ConflictResolutionPanel } from '../components/sync/ConflictResolutionPanel'
import { HistoryTimeline } from '../components/sync/HistoryTimeline'
import { useSyncFlow } from '../hooks/useSyncFlow'
import { integrationStatusLabel, providerAvatarClass } from '../domain/sync/presentation'
import { getIntegrationDetailMeta } from '../services/integrationDetailMeta'

function IntegrationDetailPageContent({ integrationId }: { integrationId: string | undefined }) {
  const {
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
  } = useSyncFlow(integrationId)

  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [syncSessionKey, setSyncSessionKey] = useState(0)

  function handleSyncNow() {
    setSyncSessionKey((key) => key + 1)
    setSyncModalOpen(true)
    void syncNow()
  }

  function handleRetrySync() {
    setSyncSessionKey((key) => key + 1)
    void syncNow()
  }

  function handleCloseSyncModal() {
    resetSyncSession()
    setSyncModalOpen(false)
  }

  function handleConfirmMerge() {
    confirmMerge()
    setSyncModalOpen(false)
  }

  if (!integration) {
    return (
      <section className="integration-detail-page">
        <div className="integration-detail-inner">
          <div className="integration-detail-card integration-detail-card--pad">
            <h2>Integration not found</h2>
            <p className="integration-detail-muted">The selected integration does not exist in this environment.</p>
            <Link to="/integrations" className="integration-detail-btn integration-detail-btn--secondary">
              Back to integrations
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const meta = getIntegrationDetailMeta(integration)
  const pClass = providerAvatarClass[integration.provider]
  const monogram = integration.id.slice(0, 2).toUpperCase()

  return (
    <div className="integration-detail-page">
      <div className="integration-detail-inner">
        <header className="integration-detail-topbar">
          <nav className="integration-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/integrations">Integrations</Link>
            <span className="integration-detail-breadcrumb-sep" aria-hidden>
              /
            </span>
            <strong>{integration.name}</strong>
          </nav>
        </header>

        <section className="integration-detail-card integration-detail-hero">
          <div className="integration-detail-hero-row">
            <div className={`integration-detail-icon-box integration-detail-icon-box--${pClass}`}>
              <span className="integration-detail-icon-monogram" aria-hidden>
                {monogram}
              </span>
            </div>
            <div className="integration-detail-hero-copy">
              <h1 className="integration-detail-title">{integration.name}</h1>
              <p className="integration-detail-byline">By {integration.provider}.com</p>
              <div className="integration-detail-meta-tags">
                <span>{meta.categoryLabel}</span>
                <span>
                  {meta.stepCount} STEPS
                </span>
              </div>
              <p className="integration-detail-lead">{integration.description}</p>
            </div>
            <div className="integration-detail-hero-cta">
              <Button
                type="button"
                className="integration-detail-btn integration-detail-btn--configure"
                onClick={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </section>
        <section className="integration-detail-card integration-detail-sync">
          <h2 className="integration-detail-section-title">Sync &amp; review</h2>
          <p className="integration-detail-muted integration-detail-sync-intro">
            Click <strong>Sync Now</strong> to open a live preview in a modal, resolve any conflicts, confirm the data,
            and merge. History and versions appear below.
          </p>

          <div className="integration-detail-summary-grid">
            <div>
              <span className="integration-detail-summary-label">Status</span>
              <span className="integration-detail-summary-value">{integrationStatusLabel[integration.status]}</span>
            </div>
            <div>
              <span className="integration-detail-summary-label">Last sync</span>
              <span className="integration-detail-summary-value">
                {new Date(integration.lastSyncAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="integration-detail-summary-label">Version</span>
              <span className="integration-detail-summary-value">{integration.version}</span>
            </div>
            <div>
              <span className="integration-detail-summary-label">Tracked fields</span>
              <span className="integration-detail-summary-value">
                {Object.keys(integrationRecord?.values ?? {}).length}
              </span>
            </div>
          </div>

          <HistoryTimeline events={syncHistory} versions={versions} />
        </section>
      </div>

      <ConflictResolutionPanel
        open={syncModalOpen}
        sessionKey={syncSessionKey}
        onClose={handleCloseSyncModal}
        isSyncing={isSyncing}
        syncError={syncError}
        preview={preview}
        conflicts={conflicts}
        resolutions={resolutions}
        unresolvedCount={unresolvedCount}
        onResolutionChange={setFieldResolution}
        onRetrySync={handleRetrySync}
        onConfirmMerge={handleConfirmMerge}
      />
    </div>
  )
}

export function IntegrationDetailPage() {
  const { integrationId } = useParams()
  return <IntegrationDetailPageContent key={integrationId ?? 'integration-not-selected'} integrationId={integrationId} />
}
