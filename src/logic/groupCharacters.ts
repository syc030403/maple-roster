import type { Character } from '../api/characters.ts'

export type WorldGroup = {
  world: string
  characters: Character[]
}

const byName = (a: string, b: string) => a.localeCompare(b, 'ko')

// 월드별로 묶는다. 월드 안: 레벨 내림차순, 같으면 이름순.
// [임시] 월드 순서: 최고 레벨 내림차순, 같으면 월드 이름순.
export function groupByWorld(characters: readonly Character[]): WorldGroup[] {
  const map = new Map<string, Character[]>()
  for (const c of characters) {
    const list = map.get(c.world)
    if (list) list.push(c)
    else map.set(c.world, [c])
  }

  const groups = [...map].map(([world, list]) => ({
    world,
    characters: [...list].sort((a, b) => b.level - a.level || byName(a.name, b.name)),
  }))

  return groups.sort((a, b) => b.characters[0].level - a.characters[0].level || byName(a.world, b.world))
}
