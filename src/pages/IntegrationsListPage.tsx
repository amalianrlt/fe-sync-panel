import { useMemo, useState } from 'react'
import { Filter, SearchNormal1 } from 'iconsax-react'
import { Button } from '../components/common/Button'
import { IntegrationsTable } from '../components/integrations/IntegrationsTable'
import type { IntegrationStatus, IntegrationSummary } from '../domain/sync/types'
import { listIntegrationSummaries } from '../services/syncRuntimeStore'

type StatusFilter = 'all' | IntegrationStatus

function filterIntegrations(
  list: IntegrationSummary[],
  query: string,
  status: StatusFilter,
): IntegrationSummary[] {
  const q = query.trim().toLowerCase()
  return list.filter((integration) => {
    if (status !== 'all' && integration.status !== status) {
      return false
    }
    if (!q) {
      return true
    }
    return (
      integration.name.toLowerCase().includes(q) ||
      integration.description.toLowerCase().includes(q) ||
      integration.provider.toLowerCase().includes(q) ||
      integration.id.toLowerCase().includes(q)
    )
  })
}

export function IntegrationsListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(
    () => filterIntegrations(listIntegrationSummaries(), searchQuery, statusFilter),
    [searchQuery, statusFilter],
  )

  return (
    <section className="integrations-page">
      <div className="integrations-data-card">
        <div className="integrations-data-card-head">
          <h1 className="integrations-data-title">Integrations</h1>
          <p className="integrations-data-subtitle">Manage and monitor your connected integrations</p>

          <div className="integrations-data-toolbar">
            <label className="data-toolbar-search">
              <span className="data-toolbar-search-icon" aria-hidden>
                <SearchNormal1 color="currentColor" size={18} variant="Linear" />
              </span>
              <input
                type="search"
                className="data-toolbar-search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoComplete="off"
                aria-label="Search integrations"
              />
            </label>

            <div className="data-toolbar-filters">
              <span className="data-toolbar-filters-icon" aria-hidden>
                <Filter color="currentColor" size={18} variant="Linear" />
              </span>
              <select
                className="data-toolbar-filters-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label="Filter by status"
              >
                <option value="all">Filters</option>
                <option value="SYNCED">Synced</option>
                <option value="SYNCING">Syncing</option>
                <option value="CONFLICT">Conflict</option>
                <option value="ERROR">Error</option>
              </select>
            </div>

            <Button type="button" className="data-toolbar-add">
              + Add Manually
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="integrations-empty-muted" role="status">
            No integrations match your search or filters.
          </p>
        ) : (
          <IntegrationsTable
            key={`${searchQuery}-${statusFilter}`}
            integrations={filtered}
          />
        )}
      </div>
    </section>
  )
}
