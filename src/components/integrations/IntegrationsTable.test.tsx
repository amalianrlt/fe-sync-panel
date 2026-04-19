import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { IntegrationSummary } from '../../domain/sync/types'
import { IntegrationsTable } from './IntegrationsTable'

function buildIntegration(overrides: Partial<IntegrationSummary> = {}): IntegrationSummary {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'CRM Link',
    provider: 'Salesforce',
    description: 'Test',
    status: 'SYNCED',
    lastSyncAt: '2024-01-15T14:30:00.000Z',
    version: '2.1.0',
    ...overrides,
  }
}

function renderTable(integrations: IntegrationSummary[]) {
  return render(
    <MemoryRouter>
      <IntegrationsTable integrations={integrations} />
    </MemoryRouter>,
  )
}

describe('IntegrationsTable', () => {
  // This test verifies that the integration name links to `/integrations/:id` for navigation to the detail page.
  it('renders integration name as a link to the detail route', () => {
    renderTable([buildIntegration({ id: 'abc-123', name: 'My Integration' })])
    const link = screen.getByRole('link', { name: 'My Integration' })
    expect(link).toHaveAttribute('href', '/integrations/abc-123')
  })

  // This test verifies that SYNCED integrations display the “Synced” pill label.
  it('shows synced status label for SYNCED rows', () => {
    renderTable([buildIntegration({ status: 'SYNCED' })])
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  // This test verifies that ERROR integrations display the “Failed” pill label.
  it('shows failed status label for ERROR rows', () => {
    renderTable([buildIntegration({ status: 'ERROR' })])
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  // This test verifies that when row count exceeds the page size, pagination appears and “Next page” reveals later rows.
  it('shows pagination when there are more rows than the page size', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 6 }, (_, i) =>
      buildIntegration({
        id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
        name: `Integration ${i}`,
      }),
    )
    renderTable(rows)

    expect(screen.getByRole('navigation', { name: 'Table pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    expect(screen.getByText('Integration 0')).toBeInTheDocument()
    expect(screen.queryByText('Integration 5')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.queryByText('Integration 0')).not.toBeInTheDocument()
    expect(screen.getByText('Integration 5')).toBeInTheDocument()
  })
})
