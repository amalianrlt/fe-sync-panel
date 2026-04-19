import { formatFieldDisplayName } from '../../domain/sync/fieldDisplayName'
import type { SyncChange } from '../../domain/sync/types'

function valueText(value: string): string {
  return value ? value.trim() === '' ? '(empty)' : value : '(empty)'
}

export function SyncPreviewPanel({
  changes,
  variant = 'default',
}: {
  changes: SyncChange[]
  variant?: 'default' | 'modal'
}) {
  return (
    <section className={variant === 'modal' ? 'panel sync-modal-preview-panel' : 'panel'}>
      <div className="panel-heading">
        <h3>Incoming Changes</h3>
        <p>Review external values before applying any updates.</p>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Current</th>
            <th>Incoming</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change) => (
            <tr key={change.id}>
              <td title={change.fieldName}>{formatFieldDisplayName(change.fieldName)}</td>
              <td>{change.changeType}</td>
              <td>{valueText(change.currentValue)}</td>
              <td>{valueText(change.newValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
