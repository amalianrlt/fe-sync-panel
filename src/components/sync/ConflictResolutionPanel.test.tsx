import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ConflictRecord, SyncPreviewPayload } from '../../domain/sync/types'
import { ConflictResolutionPanel } from './ConflictResolutionPanel'

const preview: SyncPreviewPayload = {
  applicationName: 'TestApp',
  changes: [{ id: 'ch1', fieldName: 'a.b', changeType: 'UPDATE', currentValue: '1', newValue: '2' }],
}

const conflict: ConflictRecord = {
  id: 'cf1',
  fieldName: 'user.name',
  localValue: 'Local',
  externalValue: 'External',
  sourceCurrentValue: 'Old',
  suggestedResolution: 'EXTERNAL',
  severity: 'HIGH',
}

function renderOpen(props: Partial<ComponentProps<typeof ConflictResolutionPanel>> = {}) {
  const onClose = vi.fn()
  const onResolutionChange = vi.fn()
  const onRetrySync = vi.fn()
  const onConfirmMerge = vi.fn()

  const result = render(
    <ConflictResolutionPanel
      open
      sessionKey={1}
      onClose={onClose}
      isSyncing={false}
      syncError={null}
      preview={preview}
      conflicts={[]}
      resolutions={{}}
      unresolvedCount={0}
      onResolutionChange={onResolutionChange}
      onRetrySync={onRetrySync}
      onConfirmMerge={onConfirmMerge}
      {...props}
    />,
  )

  return { ...result, onClose, onResolutionChange, onRetrySync, onConfirmMerge }
}

describe('ConflictResolutionPanel', () => {
  // This test verifies that when `open` is false, nothing is mounted (no portal content and no layout shift).
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConflictResolutionPanel
        open={false}
        sessionKey={1}
        onClose={() => {}}
        isSyncing={false}
        syncError={null}
        preview={null}
        conflicts={[]}
        resolutions={{}}
        unresolvedCount={0}
        onResolutionChange={() => {}}
        onRetrySync={() => {}}
        onConfirmMerge={() => {}}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  // This test verifies that while `isSyncing` is true, the modal shows an accessible loading status region.
  it('shows loading state while syncing', () => {
    renderOpen({ isSyncing: true, preview: null })
    expect(screen.getByRole('status')).toHaveTextContent(/Loading sync data/)
  })

  // This test verifies that API errors render in an alert, and that Retry / Close in the error actions invoke the right callbacks.
  it('shows error and retry', async () => {
    const user = userEvent.setup()
    const { onRetrySync, onClose } = renderOpen({
      syncError: 'Service unavailable',
      preview: null,
    })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Service unavailable')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetrySync).toHaveBeenCalled()
    await user.click(within(alert).getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  // This test verifies that pressing Escape dismisses the dialog by calling `onClose` (keyboard accessibility).
  it('calls onClose when Escape is pressed', () => {
    const { onClose } = renderOpen()
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  // This test verifies the empty-state copy when the preview loads but there are zero field conflicts.
  it('shows no-conflicts copy when the conflict list is empty', () => {
    renderOpen()
    expect(screen.getByText('No update conflicts were detected.')).toBeInTheDocument()
  })

  // This test verifies that conflict rows render radio choices and that switching to “Use external” calls `onResolutionChange`.
  it('renders conflict rows and notifies on resolution change', async () => {
    const user = userEvent.setup()
    const { onResolutionChange } = renderOpen({
      conflicts: [conflict],
      resolutions: { cf1: 'LOCAL' },
    })
    const localRadio = screen.getByRole('radio', { name: /Keep local/i })
    const externalRadio = screen.getByRole('radio', { name: /Use external/i })
    expect(localRadio).toBeChecked()
    await user.click(externalRadio)
    expect(onResolutionChange).toHaveBeenCalledWith('cf1', 'EXTERNAL')
  })

  // This test verifies that merge stays disabled until the data-acknowledgment checkbox is checked, then calls `onConfirmMerge`.
  it('requires acknowledgment before merge', async () => {
    const user = userEvent.setup()
    const { onConfirmMerge } = renderOpen()
    const mergeBtn = screen.getByRole('button', { name: 'Confirm merge' })
    expect(mergeBtn).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    expect(mergeBtn).toBeEnabled()
    await user.click(mergeBtn)
    expect(onConfirmMerge).toHaveBeenCalled()
  })

  // This test verifies that with a positive `unresolvedCount`, Confirm merge stays disabled even after acknowledgment.
  it('keeps merge disabled when unresolvedCount is greater than zero', async () => {
    const user = userEvent.setup()
    renderOpen({ unresolvedCount: 1 })
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'Confirm merge' })).toBeDisabled()
  })
})
