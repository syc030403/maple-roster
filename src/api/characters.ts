import { nexonGet } from './client.ts'

export type Character = {
  ocid: string
  name: string
  world: string
  job: string
  level: number
}

// GET /maplestory/v1/character/list 응답 중 쓰는 부분
export type CharacterListResponse = {
  account_list: Array<{
    account_id: string
    character_list: Array<{
      ocid: string
      character_name: string
      world_name: string
      character_class: string
      character_level: number
    }>
  }>
}

export function toCharacters(response: CharacterListResponse): Character[] {
  return response.account_list.flatMap((account) =>
    account.character_list.map((c) => ({
      ocid: c.ocid,
      name: c.character_name,
      world: c.world_name,
      job: c.character_class,
      level: c.character_level,
    })),
  )
}

export async function fetchCharacterList(apiKey: string): Promise<Character[]> {
  const response = await nexonGet<CharacterListResponse>('/maplestory/v1/character/list', {}, apiKey)
  return toCharacters(response)
}
