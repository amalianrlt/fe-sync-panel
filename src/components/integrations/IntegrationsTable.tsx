import { useMemo, useState } from 'react'
import { ArrowDown2, ArrowLeft2, ArrowRight2, ArrowUp2, CloseCircle, Danger, TickCircle } from 'iconsax-react'
import { Link } from 'react-router-dom'
import type { IntegrationStatus, IntegrationSummary } from '../../domain/sync/types'
import { integrationStatusLabel, providerAvatarClass } from '../../domain/sync/presentation'

const PAGE_SIZE = 5

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set<number>()
  pages.add(1)
  pages.add(total)
  pages.add(current)
  if (current > 1) pages.add(current - 1)
  if (current < total) pages.add(current + 1)
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push('ellipsis')
    }
    out.push(sorted[i])
  }
  return out
}

function formatIntegrationCode(id: string): string {
  const core = id.replace(/-/g, '').toUpperCase().slice(0, 8).padEnd(8, '0')
  return `INT-${core}`
}

function formatTableDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd}/${yy} - ${hh}:${min}`
}

function SortArrows() {
  return (
    <span className="data-table-sort" aria-hidden>
      <ArrowUp2 color="currentColor" size={10} variant="Linear" />
      <ArrowDown2 color="currentColor" size={10} variant="Linear" />
    </span>
  )
}

function StatusPill({ status }: { status: IntegrationStatus }) {
  const label = integrationStatusLabel[status]
  if (status === 'SYNCED') {
    return (
      <span className="data-status-pill data-status-pill--success">
        <TickCircle color="currentColor" size={14} variant="Bold" aria-hidden />
        {label}
      </span>
    )
  }
  if (status === 'ERROR') {
    return (
      <span className="data-status-pill data-status-pill--danger">
        <CloseCircle color="currentColor" size={14} variant="Bold" aria-hidden />
        {label}
      </span>
    )
  }
  return (
    <span className="data-status-pill data-status-pill--warning">
      <Danger color="currentColor" size={14} variant="Bold" aria-hidden />
      {label}
    </span>
  )
}

export function IntegrationsTable({ integrations }: { integrations: IntegrationSummary[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(integrations.length / PAGE_SIZE))

  const pageSafe = Math.min(page, totalPages)
  const pageSlice = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE
    return integrations.slice(start, start + PAGE_SIZE)
  }, [integrations, pageSafe])

  const pageNumbers = useMemo(() => getVisiblePages(pageSafe, totalPages), [pageSafe, totalPages])

  return (
    <div className="data-table-wrap">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Integration ID</th>
              <th scope="col">Integration name</th>
              <th scope="col">Last sync</th>
              <th scope="col">Provider</th>
              <th scope="col" className="data-table-th-sort">
                Version
                <SortArrows />
              </th>
              <th scope="col" className="data-table-th-sort">
                Status
                <SortArrows />
              </th>
              <th scope="col" className="data-table-th-actions">
                View detail
              </th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((integration) => (
              <tr key={integration.id}>
                <td>
                  <span className="data-table-mono">{formatIntegrationCode(integration.id)}</span>
                </td>
                <td>
                  <Link to={`/integrations/${integration.id}`} className="data-table-name-link">
                    {integration.name}
                  </Link>
                </td>
                <td>
                  <span className="data-table-date">{formatTableDate(integration.lastSyncAt)}</span>
                </td>
                <td>
                  <div className="data-table-provider">
                    <span
                      className={`integration-avatar integration-avatar--dual integration-avatar--sm integration-avatar--${providerAvatarClass[integration.provider]}`}
                      aria-hidden
                    >
                      {integration.id.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="data-table-provider-text">
                      <span className="data-table-provider-title">{integration.provider}</span>
                      <span className="data-table-provider-sub">Connected app</span>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="data-table-version">{integration.version}</span>
                </td>
                <td>
                  <StatusPill status={integration.status} />
                </td>
                <td className="data-table-td-actions">
                  <Link to={`/integrations/${integration.id}`} className="data-table-detail-link">
                    View detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="data-table-pagination" aria-label="Table pagination">
          <button
            type="button"
            className="data-table-page-btn"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ArrowLeft2 color="currentColor" size={16} variant="Linear" aria-hidden />
          </button>
          <div className="data-table-page-numbers">
            {pageNumbers.map((n, i) =>
              n === 'ellipsis' ? (
                <span key={`e-${i}`} className="data-table-page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`data-table-page-num ${n === pageSafe ? 'is-active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-current={n === pageSafe ? 'page' : undefined}
                >
                  {n}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            className="data-table-page-btn"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ArrowRight2 color="currentColor" size={16} variant="Linear" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  )
}
