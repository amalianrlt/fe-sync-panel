import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildMergeValues,
  defaultResolutions,
  detectFieldConflicts,
} from './conflict'
import type { SyncChange } from './types'

describe('detectFieldConflicts', () => {
  // This test verifies that CREATE/DELETE-only changes produce no conflict rows (only UPDATE is analyzed).
  it('returns empty array when there are no UPDATE changes', () => {
    const changes: SyncChange[] = [
      { id: '1', fieldName: 'a', changeType: 'CREATE', currentValue: '', newValue: 'x' },
      { id: '2', fieldName: 'b', changeType: 'DELETE', currentValue: 'old', newValue: '' },
    ]
    expect(detectFieldConflicts({}, changes)).toEqual([])
  })

  // This test verifies that when local differs from both API current and incoming values, severity is HIGH and EXTERNAL is suggested.
  it('flags HIGH severity when local has diverged from both current and new', () => {
    const changes: SyncChange[] = [
      {
        id: 'u1',
        fieldName: 'email',
        changeType: 'UPDATE',
        currentValue: 'a@x.com',
        newValue: 'b@x.com',
      },
    ]
    const localValues = { email: 'local@x.com' }
    const result = detectFieldConflicts(localValues, changes)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'u1',
      fieldName: 'email',
      localValue: 'local@x.com',
      externalValue: 'b@x.com',
      sourceCurrentValue: 'a@x.com',
      suggestedResolution: 'EXTERNAL',
      severity: 'HIGH',
    })
  })

  // This test verifies that when local still matches the API “current” snapshot, the conflict is treated as low risk with a LOCAL suggestion.
  it('uses LOW severity when local still matches API current value', () => {
    const changes: SyncChange[] = [
      {
        id: 'u1',
        fieldName: 'name',
        changeType: 'UPDATE',
        currentValue: 'Same',
        newValue: 'New',
      },
    ]
    const localValues = { name: 'Same' }
    const result = detectFieldConflicts(localValues, changes)
    expect(result[0]?.severity).toBe('LOW')
    expect(result[0]?.suggestedResolution).toBe('LOCAL')
  })
})

describe('defaultResolutions', () => {
  // This test verifies that each conflict id is pre-filled with its suggested LOCAL/EXTERNAL choice.
  it('maps each conflict id to its suggested resolution', () => {
    const resolutions = defaultResolutions([
      {
        id: 'c1',
        fieldName: 'f',
        localValue: 'a',
        externalValue: 'b',
        sourceCurrentValue: 'a',
        suggestedResolution: 'LOCAL',
        severity: 'LOW',
      },
      {
        id: 'c2',
        fieldName: 'g',
        localValue: 'x',
        externalValue: 'y',
        sourceCurrentValue: 'z',
        suggestedResolution: 'EXTERNAL',
        severity: 'HIGH',
      },
    ])
    expect(resolutions).toEqual({ c1: 'LOCAL', c2: 'EXTERNAL' })
  })
})

describe('buildMergeValues', () => {
  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-04-20T00:00:00.000Z')
  })

  // This test verifies that DELETE changes remove keys from merged output and do not add sync decision rows.
  it('removes fields on DELETE and does not emit a decision row for them', () => {
    const localValues = { a: '1', b: '2' }
    const changes: SyncChange[] = [
      { id: 'd1', fieldName: 'b', changeType: 'DELETE', currentValue: '2', newValue: '' },
    ]
    const { mergedValues, decisions } = buildMergeValues(localValues, changes, {})
    expect(mergedValues).toEqual({ a: '1' })
    expect(decisions).toEqual([])
  })

  // This test verifies that missing per-change resolution defaults to EXTERNAL and records the decision with a stable timestamp.
  it('defaults to EXTERNAL when no resolution is provided for a change id', () => {
    const localValues = { x: 'local' }
    const changes: SyncChange[] = [
      { id: 'n1', fieldName: 'x', changeType: 'UPDATE', currentValue: 'old', newValue: 'incoming' },
    ]
    const { mergedValues, decisions } = buildMergeValues(localValues, changes, {})
    expect(mergedValues.x).toBe('incoming')
    expect(decisions[0]).toMatchObject({
      conflictId: 'n1',
      selectedSource: 'EXTERNAL',
      resolvedValue: 'incoming',
      resolvedAt: '2026-04-20T00:00:00.000Z',
    })
  })

  // This test verifies that choosing LOCAL keeps the existing local field value in merged output and in the decision record.
  it('uses LOCAL when resolution requests it', () => {
    const localValues = { x: 'keep-me' }
    const changes: SyncChange[] = [
      { id: 'n1', fieldName: 'x', changeType: 'UPDATE', currentValue: 'old', newValue: 'incoming' },
    ]
    const { mergedValues, decisions } = buildMergeValues(localValues, changes, { n1: 'LOCAL' })
    expect(mergedValues.x).toBe('keep-me')
    expect(decisions[0]?.selectedSource).toBe('LOCAL')
    expect(decisions[0]?.resolvedValue).toBe('keep-me')
  })

  // This test verifies that absent local values are surfaced as “(empty)” in merged field values when LOCAL is selected.
  it('stringifies undefined local values as (empty)', () => {
    const changes: SyncChange[] = [
      { id: 'c1', fieldName: 'missing', changeType: 'CREATE', currentValue: '', newValue: 'nv' },
    ]
    const { mergedValues } = buildMergeValues({}, changes, { c1: 'LOCAL' })
    expect(mergedValues.missing).toBe('(empty)')
  })
})
