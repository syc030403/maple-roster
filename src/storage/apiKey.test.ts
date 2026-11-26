import { describe, expect, it } from 'vitest'
import { API_KEY_STORAGE_KEY, clearApiKey, loadApiKey, saveApiKey, type KeyValueStore } from './apiKey.ts'

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

describe('apiKey 저장소', () => {
  it('저장한 키를 읽고 지울 수 있다', () => {
    const store = memoryStore()
    expect(loadApiKey(store)).toBeNull()

    saveApiKey('test-key', store)
    expect(store.data.get(API_KEY_STORAGE_KEY)).toBe('test-key')
    expect(loadApiKey(store)).toBe('test-key')

    clearApiKey(store)
    expect(loadApiKey(store)).toBeNull()
  })

  it('앞뒤 공백을 지우고 저장한다', () => {
    const store = memoryStore()
    saveApiKey('  test-key  ', store)
    expect(loadApiKey(store)).toBe('test-key')
  })

  it('공백만 있는 값은 저장하지 않고, 저장돼 있어도 없는 것으로 본다', () => {
    const store = memoryStore()
    saveApiKey('   ', store)
    expect(store.data.has(API_KEY_STORAGE_KEY)).toBe(false)

    store.data.set(API_KEY_STORAGE_KEY, '   ')
    expect(loadApiKey(store)).toBeNull()
  })
})
