import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/client.ts'
import { ApiKeyForm, API_KEY_GUIDE_URL } from './ApiKeyForm.tsx'
import { CharacterList } from './CharacterList.tsx'
import { NO_CHARACTERS_MESSAGE, errorMessage } from './errorMessage.ts'

describe('errorMessage', () => {
  it('오류 종류마다 다른 문구', () => {
    const messages = [
      errorMessage(new ApiError('invalid-key', '', 'OPENAPI00005')),
      errorMessage(new ApiError('rate-limit', '', 'OPENAPI00007')),
      errorMessage(new ApiError('network', '')),
      errorMessage(new ApiError('server', '', 'OPENAPI00001')),
      errorMessage(new Error('?')),
    ]
    expect(new Set(messages).size).toBe(messages.length)
    expect(messages[0]).toContain('API 키')
    expect(messages[1]).toContain('호출 한도')
    expect(messages[2]).toContain('네트워크')
    expect(messages[3]).toContain('OPENAPI00001')
  })
})

describe('ApiKeyForm', () => {
  it('입력란, 저장 안내, 발급 링크가 있고 빈 값이면 버튼이 비활성', () => {
    const html = renderToString(<ApiKeyForm loading={false} error={null} onSubmit={() => {}} />)
    expect(html).toContain('type="password"')
    expect(html).toContain('이 브라우저에만 저장')
    expect(html).toContain(`href="${API_KEY_GUIDE_URL}"`)
    expect(html).toMatch(/<button type="submit" disabled="">/)
  })

  it('오류 문구를 보여준다', () => {
    const html = renderToString(<ApiKeyForm loading={false} error="API 키가 올바르지 않습니다." onSubmit={() => {}} />)
    expect(html).toContain('API 키가 올바르지 않습니다.')
  })
})

describe('CharacterList', () => {
  it('캐릭터가 없으면 안내 문구', () => {
    expect(renderToString(<CharacterList groups={[]} />)).toContain(NO_CHARACTERS_MESSAGE)
  })

  it('월드 제목과 이름·직업·레벨을 보여준다', () => {
    const html = renderToString(
      <CharacterList
        groups={[{ world: '스카니아', characters: [{ ocid: 'o1', name: '테스트캐릭A', world: '스카니아', job: '히어로', level: 270 }] }]}
      />,
    )
    expect(html).toContain('스카니아')
    expect(html).toContain('테스트캐릭A')
    expect(html).toContain('히어로')
    expect(html).toContain('270')
  })
})
