import { useEffect, useState } from 'react'
import { fetchCharacterList } from '../api/characters.ts'
import { clearApiCache } from '../api/client.ts'
import { groupByWorld, type WorldGroup } from '../logic/groupCharacters.ts'
import { clearApiKey, loadApiKey, saveApiKey } from '../storage/apiKey.ts'
import { ApiKeyForm } from './ApiKeyForm.tsx'
import { CharacterList } from './CharacterList.tsx'
import { errorMessage } from './errorMessage.ts'
import { Footer } from './Footer.tsx'

type State =
  | { screen: 'key-form'; loading: boolean; error: string | null }
  | { screen: 'loading' }
  | { screen: 'roster'; groups: WorldGroup[] }
  | { screen: 'load-error'; error: string }

function initialState(): State {
  return loadApiKey() ? { screen: 'loading' } : { screen: 'key-form', loading: false, error: null }
}

export function App() {
  const [state, setState] = useState<State>(initialState)
  const [reloadCount, setReloadCount] = useState(0)

  // 저장된 키로 목록 불러오기 (처음 접속, 다시 시도)
  useEffect(() => {
    const apiKey = loadApiKey()
    if (!apiKey) return
    let ignore = false
    fetchCharacterList(apiKey).then(
      (characters) => !ignore && setState({ screen: 'roster', groups: groupByWorld(characters) }),
      (error: unknown) => !ignore && setState({ screen: 'load-error', error: errorMessage(error) }),
    )
    return () => {
      ignore = true
    }
  }, [reloadCount])

  // 새 키 입력: 성공했을 때만 저장한다
  function handleSubmit(apiKey: string) {
    setState({ screen: 'key-form', loading: true, error: null })
    fetchCharacterList(apiKey).then(
      (characters) => {
        saveApiKey(apiKey)
        setState({ screen: 'roster', groups: groupByWorld(characters) })
      },
      (error: unknown) => setState({ screen: 'key-form', loading: false, error: errorMessage(error) }),
    )
  }

  function handleRetry() {
    setState({ screen: 'loading' })
    setReloadCount((n) => n + 1)
  }

  function handleClearKey() {
    clearApiKey()
    clearApiCache()
    setState({ screen: 'key-form', loading: false, error: null })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>maple-roster</h1>
        {(state.screen === 'roster' || state.screen === 'load-error') && (
          <button type="button" onClick={handleClearKey}>
            키 지우기
          </button>
        )}
      </header>
      <main className="app-main">
        {state.screen === 'key-form' && (
          <ApiKeyForm loading={state.loading} error={state.error} onSubmit={handleSubmit} />
        )}
        {state.screen === 'loading' && <p>불러오는 중...</p>}
        {state.screen === 'roster' && <CharacterList groups={state.groups} />}
        {state.screen === 'load-error' && (
          <div>
            <p className="error" role="alert">
              {state.error}
            </p>
            <button type="button" onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
