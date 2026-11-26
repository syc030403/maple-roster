import { afterEach, describe, expect, it, vi } from 'vitest'
import fixture from './__fixtures__/character-list.json'
import { fetchCharacterList, toCharacters } from './characters.ts'
import { clearApiCache } from './client.ts'

describe('toCharacters', () => {
  it('여러 계정의 캐릭터를 하나로 펼친다', () => {
    expect(toCharacters(fixture)).toEqual([
      { ocid: 'fake-ocid-1', name: '테스트캐릭A', world: '스카니아', job: '히어로', level: 270 },
      { ocid: 'fake-ocid-2', name: '테스트캐릭B', world: '베라', job: '비숍', level: 255 },
      { ocid: 'fake-ocid-3', name: '테스트캐릭C', world: '스카니아', job: '카데나', level: 230 },
    ])
  })

  it('캐릭터가 없으면 빈 배열', () => {
    expect(toCharacters({ account_list: [] })).toEqual([])
    expect(toCharacters({ account_list: [{ account_id: 'fake', character_list: [] }] })).toEqual([])
  })
})

describe('fetchCharacterList', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    clearApiCache()
  })

  it('character/list를 불러와 펼친다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(fixture), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const characters = await fetchCharacterList('test-key')
    expect(characters).toHaveLength(3)
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://open.api.nexon.com/maplestory/v1/character/list')
  })
})
