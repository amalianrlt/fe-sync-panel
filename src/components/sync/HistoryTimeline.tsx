import type { SyncHistoryEvent, VersionSnapshot } from '../../domain/sync/types'
import { historyStatusBadgeClass } from '../../domain/sync/presentation'

function formatDate(value: string | undefined): string {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString()
}

export function HistoryTimeline({
  events,
  versions,
}: {
  events: SyncHistoryEvent[]
  versions: VersionSnapshot[]
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Sync History and Versioning</h3>
        <p>Audit what changed and when each version was created.</p>
      </div>
      <div className="history-grid">
        <div>
          <h4>Events</h4>
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-row">
                  <strong>{event.summary}</strong>
                  <span className={`badge ${historyStatusBadgeClass[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                <p className="muted">
                  {formatDate(event.startedAt)} - {formatDate(event.finishedAt)}
                </p>
                <p className="muted">
                  Source: {event.source} | Version: {event.versionFrom} to {event.versionTo} | Changes:{' '}
                  {event.changeCount}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Version Snapshots</h4>
          <ul className="snapshot-list">
            {versions.map((snapshot) => (
              <li key={snapshot.id} className="snapshot-item">
                <div className="event-row">
                  <strong>{snapshot.version}</strong>
                  <span>{formatDate(snapshot.createdAt)}</span>
                </div>
                <p className="muted">{snapshot.notes}</p>
                <details>
                  <summary>Inspect values</summary>
                  <ul className="kv-list">
                    {Object.entries(snapshot.values).map(([field, value]) => (
                      <li key={field}>
                        <code>{field}</code>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
