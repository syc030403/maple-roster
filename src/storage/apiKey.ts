// API 키는 브라우저 localStorage에만 둔다 (verification.md V23).

export const API_KEY_STORAGE_KEY = 'maple-roster:api-key'

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function defaultStore(): KeyValueStore {
  return globalThis.localStorage
}

export function loadApiKey(store: KeyValueStore = defaultStore()): string | null {
  const value = store.getItem(API_KEY_STORAGE_KEY)?.trim()
  return value ? value : null
}

export function saveApiKey(apiKey: string, store: KeyValueStore = defaultStore()): void {
  const value = apiKey.trim()
  if (value) store.setItem(API_KEY_STORAGE_KEY, value)
}

export function clearApiKey(store: KeyValueStore = defaultStore()): void {
  store.removeItem(API_KEY_STORAGE_KEY)
}
