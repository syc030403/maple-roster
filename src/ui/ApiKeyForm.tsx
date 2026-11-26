import { useState, type FormEvent } from 'react'

export const API_KEY_GUIDE_URL = 'https://openapi.nexon.com/'

type Props = {
  loading: boolean
  error: string | null
  onSubmit: (apiKey: string) => void
}

export function ApiKeyForm({ loading, error, onSubmit }: Props) {
  const [value, setValue] = useState('')
  const apiKey = value.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (apiKey && !loading) onSubmit(apiKey)
  }

  return (
    <form className="api-key-form" onSubmit={handleSubmit}>
      <label htmlFor="api-key">NEXON Open API 키</label>
      <div className="api-key-row">
        <input
          id="api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!apiKey || loading}>
          {loading ? '불러오는 중...' : '불러오기'}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="hint">키는 이 브라우저에만 저장되며 NEXON Open API 외에는 보내지 않습니다.</p>
      <p className="hint">
        <a href={API_KEY_GUIDE_URL} target="_blank" rel="noreferrer">
          NEXON Open API에서 키 발급
        </a>
      </p>
    </form>
  )
}
