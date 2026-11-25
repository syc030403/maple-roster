// NEXON Open API 이용 시 출처 표기 (verification.md V22)
export const ATTRIBUTION_TEXT = 'Data based on NEXON Open API'

export function Footer() {
  return (
    <footer className="app-footer">
      <p>{ATTRIBUTION_TEXT}</p>
      <p>넥슨과 관련이 없는 개인 프로젝트입니다.</p>
    </footer>
  )
}
