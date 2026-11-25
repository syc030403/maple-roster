import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer.tsx'

describe('Footer', () => {
  it('NEXON Open API 출처 문구를 표시한다', () => {
    expect(renderToString(<Footer />)).toContain('Data based on NEXON Open API')
  })
})
