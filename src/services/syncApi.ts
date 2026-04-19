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

function isApiSyncChange(value: unknown): value is ApiSyncChange {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ApiSyncChange>
  return (
    typeof item.id === 'string' &&
    typeof item.field_name === 'string' &&
    (item.change_type === 'CREATE' || item.change_type === 'UPDATE' || item.change_type === 'DELETE') &&
    typeof item.current_value === 'string' &&
    typeof item.new_value === 'string'
  )
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

  if (!approval.changes.every(isApiSyncChange)) {
    throw new SyncApiError(
      'Invalid sync approval change entries.',
      'UNKNOWN',
      'Unexpected sync response format. Please retry.',
    )
  }

  return {
    code: typeof data.code === 'string' ? data.code : 'UNKNOWN',
    message: typeof data.message === 'string' ? data.message : '',
    data: {
      sync_approval: {
        application_name: approval.application_name,
        changes: approval.changes,
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
