import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  // This test verifies that visible button text (children) is exposed to assistive tech via the accessible name.
  it('renders children', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  // This test verifies that the default HTML type is `button` so forms are not accidentally submitted.
  it('defaults type to button', () => {
    render(<Button>Act</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  // This test verifies that `type="submit"` is forwarded for use inside forms.
  it('forwards type submit when set', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  // This test verifies that click events propagate to the provided `onClick` handler.
  it('invokes onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Tap</Button>)
    await user.click(screen.getByRole('button', { name: 'Tap' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // This test verifies that the native `disabled` attribute blocks interaction.
  it('respects disabled', () => {
    render(<Button disabled>Off</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
