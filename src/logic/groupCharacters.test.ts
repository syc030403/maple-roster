import { describe, expect, it } from 'vitest'
import type { Character } from '../api/characters.ts'
import { groupByWorld } from './groupCharacters.ts'

function char(name: string, world: string, level: number): Character {
  return { ocid: `ocid-${name}`, name, world, job: '히어로', level }
}

describe('groupByWorld', () => {
  it('빈 배열이면 빈 배열', () => {
    expect(groupByWorld([])).toEqual([])
  })

  it('월드별로 묶고 월드 안에서 레벨 내림차순, 같은 레벨은 이름순', () => {
    const groups = groupByWorld([
      char('다', '스카니아', 200),
      char('가', '스카니아', 260),
      char('나', '스카니아', 200),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].world).toBe('스카니아')
    expect(groups[0].characters.map((c) => c.name)).toEqual(['가', '나', '다'])
  })

  it('월드 순서는 최고 레벨 내림차순, 같으면 월드 이름순', () => {
    const groups = groupByWorld([
      char('a', '베라', 250),
      char('b', '스카니아', 270),
      char('c', '루나', 250),
      char('d', '베라', 100),
    ])
    expect(groups.map((g) => g.world)).toEqual(['스카니아', '루나', '베라'])
    expect(groups[2].characters.map((c) => c.name)).toEqual(['a', 'd'])
  })

  it('입력 배열을 바꾸지 않는다', () => {
    const input = [char('b', '베라', 1), char('a', '베라', 2)]
    const copy = [...input]
    groupByWorld(input)
    expect(input).toEqual(copy)
  })
})
