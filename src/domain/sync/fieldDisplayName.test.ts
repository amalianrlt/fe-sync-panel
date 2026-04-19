import { describe, expect, it } from 'vitest'

import { formatFieldDisplayName } from './fieldDisplayName'

describe('formatFieldDisplayName', () => {
  // This test verifies that whitespace-only input is returned unchanged (no accidental empty label).
  it('returns the original key when input is only whitespace', () => {
    expect(formatFieldDisplayName('   ')).toBe('   ')
  })

  // This test verifies that an empty string key stays empty (edge case for missing field paths).
  it('returns empty string segment edge case unchanged', () => {
    expect(formatFieldDisplayName('')).toBe('')
  })

  // This test verifies that dotted paths with snake_case leaf segments become title-cased words.
  it('humanizes snake_case leaf segments', () => {
    expect(formatFieldDisplayName('account.owner_name')).toBe('Owner Name')
  })

  // This test verifies that top-level `user` and `key` namespaces append a disambiguating “(user)” / “(key)” suffix.
  it('adds namespace suffix for user and key roots', () => {
    expect(formatFieldDisplayName('user.displayName')).toBe('Display Name (user)')
    expect(formatFieldDisplayName('key.apiToken')).toBe('Api Token (key)')
  })

  // This test verifies that a leaf segment named `id` is displayed as “ID” for readability.
  it('maps trailing id segment to ID', () => {
    expect(formatFieldDisplayName('record.id')).toBe('ID')
  })

  // This test verifies that camelCase in the last segment is split into separate words before title casing.
  it('splits camelCase in the leaf segment', () => {
    expect(formatFieldDisplayName('props.minAmountDue')).toBe('Min Amount Due')
  })
})
