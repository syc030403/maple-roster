// NEXON Open API 클라이언트. 외부 요청은 이 폴더에서만 한다 (verification.md V21).

export const NEXON_API_BASE = 'https://open.api.nexon.com'

// [임시] 호출 한도 대비 동시 요청 상한. 수치는 이 상수 하나로만 바꾼다.
export const MAX_CONCURRENT_REQUESTS = 5

export type ApiErrorKind = 'invalid-key' | 'rate-limit' | 'network' | 'server'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly code: string | undefined

  constructor(kind: ApiErrorKind, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.code = code
  }
}

const INVALID_KEY_CODE = 'OPENAPI00005'
const RATE_LIMIT_CODE = 'OPENAPI00007'

// 성공 응답과 진행 중인 요청을 함께 담는다. 실패하면 지운다.
const cache = new Map<string, Promise<unknown>>()

let active = 0
const waiting: Array<() => void> = []

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => waiting.push(resolve))
  }
  active += 1
  try {
    return await task()
  } finally {
    active -= 1
    waiting.shift()?.()
  }
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(path, NEXON_API_BASE)
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)
  return url.toString()
}

async function readErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { name?: unknown } }
    if (typeof body.error?.name === 'string') return body.error.name
  } catch {
    // JSON이 아니면 상태 코드로 남긴다
  }
  return `HTTP ${response.status}`
}

async function request(url: string, apiKey: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, { headers: { 'x-nxopen-api-key': apiKey } })
  } catch {
    throw new ApiError('network', '네트워크 오류')
  }

  if (response.ok) return response.json()

  const code = await readErrorCode(response)
  if (code === INVALID_KEY_CODE) throw new ApiError('invalid-key', 'API 키 오류', code)
  if (response.status === 429 || code === RATE_LIMIT_CODE) throw new ApiError('rate-limit', '호출 한도 초과', code)
  throw new ApiError('server', 'NEXON Open API 오류', code)
}

export function nexonGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = buildUrl(path, params)
  const cacheKey = `${apiKey}\n${url}`

  const cached = cache.get(cacheKey)
  if (cached) return cached as Promise<T>

  const pending = withSlot(() => request(url, apiKey))
  cache.set(cacheKey, pending)
  pending.catch(() => {
    if (cache.get(cacheKey) === pending) cache.delete(cacheKey)
  })
  return pending as Promise<T>
}

export function clearApiCache(): void {
  cache.clear()
}
