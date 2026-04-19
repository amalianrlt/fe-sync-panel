import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { SyncChange } from '../../domain/sync/types'
import { SyncPreviewPanel } from './SyncPreviewPanel'

const sampleChanges: SyncChange[] = [
  {
    id: 'c1',
    fieldName: 'user.email',
    changeType: 'UPDATE',
    currentValue: 'old@x.com',
    newValue: 'new@x.com',
  },
]

describe('SyncPreviewPanel', () => {
  // This test verifies that the preview section exposes the “Incoming Changes” heading and all column headers for the table.
  it('renders section heading and table headers', () => {
    render(<SyncPreviewPanel changes={sampleChanges} />)
    expect(screen.getByRole('heading', { name: 'Incoming Changes' })).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Field' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Type' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Current' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Incoming' })).toBeInTheDocument()
  })

  // This test verifies that each change row shows the formatted field label, change type, and current/incoming cell values.
  it('maps change rows with formatted field label and values', () => {
    render(<SyncPreviewPanel changes={sampleChanges} />)
    expect(screen.getByText('Email (user)')).toBeInTheDocument()
    expect(screen.getByText('UPDATE')).toBeInTheDocument()
    expect(screen.getByText('old@x.com')).toBeInTheDocument()
    expect(screen.getByText('new@x.com')).toBeInTheDocument()
  })

  // This test verifies that blank or whitespace-only API values render as “(empty)” in the preview table.
  it('shows (empty) for blank cell values', () => {
    const changes: SyncChange[] = [
      { id: 'x', fieldName: 'a', changeType: 'CREATE', currentValue: '', newValue: '   ' },
    ]
    render(<SyncPreviewPanel changes={changes} />)
    const empties = screen.getAllByText('(empty)')
    expect(empties.length).toBeGreaterThanOrEqual(1)
  })

  // This test verifies that `variant="modal"` adds the modal-specific panel class used inside the sync dialog.
  it('applies modal panel class when variant is modal', () => {
    const { container } = render(<SyncPreviewPanel changes={[]} variant="modal" />)
    expect(container.querySelector('.sync-modal-preview-panel')).toBeInTheDocument()
  })
})
