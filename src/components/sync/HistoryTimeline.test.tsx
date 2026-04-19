import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { SyncHistoryEvent, VersionSnapshot } from '../../domain/sync/types'
import { HistoryTimeline } from './HistoryTimeline'

const events: SyncHistoryEvent[] = [
  {
    id: 'h1',
    integrationId: 'int-1',
    status: 'SUCCESS',
    startedAt: '2024-06-01T10:00:00.000Z',
    finishedAt: '2024-06-01T10:05:00.000Z',
    source: 'connector',
    summary: 'Scheduled sync',
    versionFrom: '1.0.0',
    versionTo: '1.1.0',
    changeCount: 4,
  },
]

const versions: VersionSnapshot[] = [
  {
    id: 'v1',
    integrationId: 'int-1',
    version: '1.1.0',
    createdAt: '2024-06-01T10:05:00.000Z',
    notes: 'Applied CRM updates',
    values: { 'account.name': 'Acme' },
  },
]

describe('HistoryTimeline', () => {
  // This test verifies that each history event shows its summary line and raw status label in the badge.
  it('renders event summary and status badge', () => {
    render(<HistoryTimeline events={events} versions={[]} />)
    expect(screen.getByText('Scheduled sync')).toBeInTheDocument()
    expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  })

  // This test verifies that source, version range, and change count metadata lines render for an event.
  it('renders connector and version metadata for an event', () => {
    render(<HistoryTimeline events={events} versions={[]} />)
    expect(screen.getByText(/Source: connector/)).toBeInTheDocument()
    expect(screen.getByText(/Version: 1\.0\.0 to 1\.1\.0/)).toBeInTheDocument()
    expect(screen.getByText(/Changes:\s*4/)).toBeInTheDocument()
  })

  // This test verifies that version snapshots list notes and expose field/value pairs inside the expandable details block.
  it('renders version snapshot with expandable field values', () => {
    render(<HistoryTimeline events={[]} versions={versions} />)
    expect(screen.getByText('1.1.0')).toBeInTheDocument()
    expect(screen.getByText('Applied CRM updates')).toBeInTheDocument()
    const details = screen.getByText('Inspect values').closest('details')
    expect(details).toBeTruthy()
    if (details) {
      expect(within(details).getByText('account.name')).toBeInTheDocument()
      expect(within(details).getByText('Acme')).toBeInTheDocument()
    }
  })

  // This test verifies that missing start/finish timestamps render placeholder dashes instead of invalid dates.
  it('shows dash when event times are missing', () => {
    const partial: SyncHistoryEvent[] = [
      {
        ...events[0],
        id: 'h2',
        startedAt: '',
        finishedAt: undefined,
      },
    ]
    render(<HistoryTimeline events={partial} versions={[]} />)
    const timeRow = screen.getByText('Scheduled sync').closest('li')?.querySelector('p.muted')
    expect(timeRow?.textContent?.replace(/\s+/g, ' ').trim()).toBe('- - -')
  })
})
