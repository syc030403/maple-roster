import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, MAX_CONCURRENT_REQUESTS, clearApiCache, nexonGet } from './client.ts'

const KEY = 'test-key'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('오류가 나야 하는데 성공했습니다')
}

describe('nexonGet', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    clearApiCache()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('성공하면 JSON을 돌려주고 키를 헤더에 넣는다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: 1 }))
    await expect(nexonGet('/maplestory/v1/character/list', {}, KEY)).resolves.toEqual({ ok: 1 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('https://open.api.nexon.com/maplestory/v1/character/list')
    expect(new Headers(init?.headers).get('x-nxopen-api-key')).toBe(KEY)
  })

  it('쿼리 파라미터를 붙인다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}))
    await nexonGet('/maplestory/v1/character/basic', { ocid: 'abc' }, KEY)
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://open.api.nexon.com/maplestory/v1/character/basic?ocid=abc')
  })

  it('OPENAPI00005는 invalid-key', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: { name: 'OPENAPI00005', message: 'The apikey is not valid.' } }))
    const error = await catchError(nexonGet('/x', {}, KEY))
    expect(error.kind).toBe('invalid-key')
    expect(error.code).toBe('OPENAPI00005')
  })

  it('429는 rate-limit', async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, { error: { name: 'OPENAPI00007', message: 'too many requests' } }))
    expect((await catchError(nexonGet('/x', {}, KEY))).kind).toBe('rate-limit')
  })

  it('OPENAPI00007은 상태 코드와 관계없이 rate-limit', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: { name: 'OPENAPI00007', message: '' } }))
    expect((await catchError(nexonGet('/x', {}, KEY))).kind).toBe('rate-limit')
  })

  it('fetch 자체가 실패하면 network', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    expect((await catchError(nexonGet('/x', {}, KEY))).kind).toBe('network')
  })

  it('그 밖의 오류는 server이고 코드를 남긴다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, { error: { name: 'OPENAPI00001', message: 'server error' } }))
    const error = await catchError(nexonGet('/x', {}, KEY))
    expect(error.kind).toBe('server')
    expect(error.code).toBe('OPENAPI00001')
  })

  it('JSON이 아닌 오류 응답도 server', async () => {
    fetchMock.mockResolvedValue(new Response('bad gateway', { status: 502 }))
    const error = await catchError(nexonGet('/x', {}, KEY))
    expect(error.kind).toBe('server')
    expect(error.code).toBe('HTTP 502')
  })

  it('같은 요청은 캐시해서 한 번만 보낸다', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { n: 1 }))
    await nexonGet('/x', { a: '1' }, KEY)
    await nexonGet('/x', { a: '1' }, KEY)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('동시에 들어온 같은 요청도 한 번만 보낸다', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { n: 1 }))
    await Promise.all([nexonGet('/x', {}, KEY), nexonGet('/x', {}, KEY)])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('키가 다르면 따로 보낸다', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, {}))
    await nexonGet('/x', {}, 'test-key-a')
    await nexonGet('/x', {}, 'test-key-b')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('실패한 응답은 캐시하지 않는다', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { error: { name: 'OPENAPI00001', message: '' } }))
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: 1 }))
    await catchError(nexonGet('/x', {}, KEY))
    await expect(nexonGet('/x', {}, KEY)).resolves.toEqual({ ok: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('clearApiCache 뒤에는 다시 보낸다', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, {}))
    await nexonGet('/x', {}, KEY)
    clearApiCache()
    await nexonGet('/x', {}, KEY)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it(`동시 요청은 ${MAX_CONCURRENT_REQUESTS}개를 넘지 않는다`, async () => {
    let inFlight = 0
    let maxInFlight = 0
    const releases: Array<() => void> = []
    fetchMock.mockImplementation(() => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      return new Promise<Response>((resolve) => {
        releases.push(() => {
          inFlight -= 1
          resolve(jsonResponse(200, {}))
        })
      })
    })

    const total = MAX_CONCURRENT_REQUESTS + 3
    const all = Promise.all(Array.from({ length: total }, (_, i) => nexonGet('/x', { i: String(i) }, KEY)))

    // 대기 중인 요청을 하나씩 풀어 준다
    for (let done = 0; done < total; done += 1) {
      await vi.waitFor(() => expect(releases.length).toBeGreaterThan(done))
      releases[done]()
    }
    await all

    expect(fetchMock).toHaveBeenCalledTimes(total)
    expect(maxInFlight).toBe(MAX_CONCURRENT_REQUESTS)
  })
})
