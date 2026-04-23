import type { SyncPreviewPayload } from '../domain/sync/types'

const DEFAULT_SYNC_ENDPOINT = 'https://portier-takehometest.onrender.com/api/v1/data/sync'
const SYNC_ENDPOINT = import.meta.env.VITE_SYNC_ENDPOINT || DEFAULT_SYNC_ENDPOINT

type ApiSyncChange = {
  id: string
  field_name: string
  change_type: 'CREATE' | 'UPDATE' | 'DELETE'
  current_value: string
  new_value: string
}

type SyncApiResponse = {
  code: string
  message: string
  data: {
    sync_approval: {
      application_name: string
      changes: ApiSyncChange[]
    }
  }
}

function normalizeApiChangeType(raw: unknown): ApiSyncChange['change_type'] | undefined {
  if (raw === 'CREATE' || raw === 'ADD') return 'CREATE'
  if (raw === 'UPDATE') return 'UPDATE'
  if (raw === 'DELETE') return 'DELETE'
  if (typeof raw === 'string') {
    const upper = raw.toUpperCase()
    if (upper === 'CREATE' || upper === 'ADD') return 'CREATE'
    if (upper === 'UPDATE') return 'UPDATE'
    if (upper === 'DELETE') return 'DELETE'
  }
  return undefined
}

/** API may use ADD instead of CREATE; may omit values or send null — normalize to strings. */
function normalizeApiSyncChange(value: unknown): ApiSyncChange | undefined {
  if (!value || typeof value !== 'object') return undefined
  const item = value as Partial<ApiSyncChange> & { current_value?: unknown; new_value?: unknown }
  const changeType = normalizeApiChangeType(item.change_type)
  if (typeof item.id !== 'string' || typeof item.field_name !== 'string' || !changeType) {
    return undefined
  }
  const cv = item.current_value
  const nv = item.new_value
  if (cv != null && typeof cv !== 'string') return undefined
  if (nv != null && typeof nv !== 'string') return undefined
  return {
    id: item.id,
    field_name: item.field_name,
    change_type: changeType,
    current_value: typeof cv === 'string' ? cv : '',
    new_value: typeof nv === 'string' ? nv : '',
  }
}

function parseSyncApiResponse(payload: unknown): SyncApiResponse {
  if (!payload || typeof payload !== 'object') {
    throw new SyncApiError(
      'Invalid sync preview payload shape.',
      'UNKNOWN',
      'Unexpected sync response format. Please retry.',
    )
  }

  const data = payload as Partial<SyncApiResponse>
  const approval = data.data?.sync_approval
  if (!approval || typeof approval.application_name !== 'string' || !Array.isArray(approval.changes)) {
    throw new SyncApiError(
      'Invalid sync approval payload shape.',
      'UNKNOWN',
      'Unexpected sync response format. Please retry.',
    )
  }

  const normalizedChanges: ApiSyncChange[] = []
  for (const raw of approval.changes) {
    const change = normalizeApiSyncChange(raw)
    if (!change) {
      throw new SyncApiError(
        'Invalid sync approval change entries.',
        'UNKNOWN',
        'Unexpected sync response format. Please retry.',
      )
    }
    normalizedChanges.push(change)
  }

  return {
    code: typeof data.code === 'string' ? data.code : 'UNKNOWN',
    message: typeof data.message === 'string' ? data.message : '',
    data: {
      sync_approval: {
        application_name: approval.application_name,
        changes: normalizedChanges,
      },
    },
  }
}

export type SyncApiErrorKind = 'CLIENT' | 'SERVER' | 'GATEWAY' | 'UNKNOWN'

export class SyncApiError extends Error {
  status?: number
  kind: SyncApiErrorKind
  userMessage: string

  constructor(message: string, kind: SyncApiErrorKind, userMessage: string, status?: number) {
    super(message)
    this.status = status
    this.kind = kind
    this.userMessage = userMessage
  }
}

function toError(status: number, detail?: string): SyncApiError {
  if (status >= 400 && status < 500) {
    return new SyncApiError(
      'Integration is not configured correctly.',
      'CLIENT',
      detail ??
        'Missing or invalid integration configuration. Check credentials and permissions, then retry.',
      status,
    )
  }

  if (status === 500) {
    return new SyncApiError(
      'Internal sync server failure.',
      'SERVER',
      'Internal server error while preparing sync changes. Please retry shortly.',
      status,
    )
  }

  if (status === 502) {
    return new SyncApiError(
      'Integration service unavailable.',
      'GATEWAY',
      'Gateway error from integration service. External system may be temporarily down.',
      status,
    )
  }

  return new SyncApiError(
    'Unexpected sync API response.',
    'UNKNOWN',
    'An unexpected error occurred while syncing. Please retry.',
    status,
  )
}

async function readErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const data = (await response.json()) as { message?: string }
    return typeof data.message === 'string' ? data.message : undefined
  } catch {
    return undefined
  }
}

export async function fetchSyncPreview(applicationId: string, signal?: AbortSignal): Promise<SyncPreviewPayload> {
  const url = new URL(SYNC_ENDPOINT)
  url.searchParams.set('application_id', applicationId)

  const response = await fetch(url.toString(), { method: 'GET', signal })

  if (!response.ok) {
    const detail = await readErrorDetail(response)
    throw toError(response.status, detail)
  }

  const payload = parseSyncApiResponse(await response.json())
  const approval = payload.data.sync_approval

  return {
    applicationName: approval.application_name,
    changes: approval.changes.map((change) => ({
      id: change.id,
      fieldName: change.field_name,
      changeType: change.change_type,
      currentValue: change.current_value,
      newValue: change.new_value,
    })),
  }
}
