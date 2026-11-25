import { describe, expect, it } from 'vitest'

// 게임 고정 데이터는 파일마다 출처와 기준 날짜를 가진다 (verification.md V24)
const files = import.meta.glob<Record<string, unknown>>('./*.json', { eager: true, import: 'default' })

describe('src/data/*.json', () => {
  it('파일 목록을 읽을 수 있다', () => {
    expect(typeof files).toBe('object')
  })

  for (const [path, data] of Object.entries(files)) {
    it(`${path}에 source와 updatedAt이 있다`, () => {
      expect(typeof data.source, `${path}: source 없음`).toBe('string')
      expect(data.source).not.toBe('')
      expect(typeof data.updatedAt, `${path}: updatedAt 없음`).toBe('string')
      expect(data.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  }
})
