import type { WorldGroup } from '../logic/groupCharacters.ts'
import { NO_CHARACTERS_MESSAGE } from './errorMessage.ts'

type Props = {
  groups: WorldGroup[]
}

export function CharacterList({ groups }: Props) {
  if (groups.length === 0) return <p>{NO_CHARACTERS_MESSAGE}</p>

  return (
    <div className="character-list">
      {groups.map((group) => (
        <section key={group.world}>
          <h2>
            {group.world} <span className="count">{group.characters.length}</span>
          </h2>
          <ul>
            {group.characters.map((c) => (
              <li key={c.ocid}>
                <span className="name">{c.name}</span>
                <span className="job">{c.job}</span>
                <span className="level">Lv.{c.level}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
