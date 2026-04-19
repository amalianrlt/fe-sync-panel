import type { ConflictRecord, ResolutionChoice, SyncChange, SyncDecision } from './types'

function valueToString(value: string | undefined): string {
  return value ?? '(empty)'
}

export function detectFieldConflicts(
  localValues: Record<string, string>,
  changes: SyncChange[],
): ConflictRecord[] {
  return changes
    .filter((change) => change.changeType === 'UPDATE')
    .map((change) => {
      const localValue = localValues[change.fieldName]
      const hasDiverged = localValue !== change.currentValue && localValue !== change.newValue

      return {
        id: change.id,
        fieldName: change.fieldName,
        localValue: valueToString(localValue),
        externalValue: valueToString(change.newValue),
        sourceCurrentValue: valueToString(change.currentValue),
        suggestedResolution: hasDiverged ? 'EXTERNAL' : 'LOCAL',
        severity: hasDiverged ? 'HIGH' : 'LOW',
      }
    })
}

export function defaultResolutions(conflicts: ConflictRecord[]): Record<string, ResolutionChoice> {
  return conflicts.reduce<Record<string, ResolutionChoice>>((accumulator, conflict) => {
    accumulator[conflict.id] = conflict.suggestedResolution
    return accumulator
  }, {})
}

export function buildMergeValues(
  localValues: Record<string, string>,
  changes: SyncChange[],
  resolutions: Record<string, ResolutionChoice>,
): {
  mergedValues: Record<string, string>
  decisions: SyncDecision[]
} {
  const mergedValues: Record<string, string> = { ...localValues }
  const decisions: SyncDecision[] = []

  for (const change of changes) {
    if (change.changeType === 'DELETE') {
      delete mergedValues[change.fieldName]
      continue
    }

    const selectedSource = resolutions[change.id] ?? 'EXTERNAL'
    const resolvedValue = selectedSource === 'LOCAL' ? localValues[change.fieldName] : change.newValue

    mergedValues[change.fieldName] = valueToString(resolvedValue)
    decisions.push({
      conflictId: change.id,
      fieldName: change.fieldName,
      selectedSource,
      resolvedValue: valueToString(resolvedValue),
      resolvedAt: new Date().toISOString(),
    })
  }

  return { mergedValues, decisions }
}
