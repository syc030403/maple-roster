# maple-roster

메이플스토리 계정의 캐릭터를 한 화면에 모아 보는 정적 웹앱입니다.

## 기능 (예정)
- NEXON Open API 키를 입력하면 내 계정의 캐릭터 목록 표시 (월드 지정 가능)
- 현재 존재하는 전체 직업 목록과 내가 만든 직업 / 만들지 않은 직업 구분
- 직업별 링크 스킬, 링크 효과, 유니온 공격대원 효과
- 캐릭터별 전투력과 전투력에 맞는 보스 12마리 추천
- 보스 처치 현황 체크 (매주 목요일 00:00 KST 초기화)

## 개인정보와 API 키
- 서버가 없습니다. 모든 요청은 사용자의 브라우저에서 NEXON Open API로 직접 보냅니다.
- API 키와 보스 처치 기록은 사용자의 브라우저(`localStorage`)에만 저장됩니다.
- API 키는 [NEXON Open API](https://openapi.nexon.com/)에서 발급받을 수 있습니다.

## 개발
기술 스택: Vite + React + TypeScript, oxlint, Vitest

```bash
npm ci
npm run dev        # 개발 서버
npm run lint       # 린트
npm run typecheck  # 타입 검사
npm test           # 테스트
npm run build      # GitHub Pages용 빌드 (dist/)
```

검증 명령과 작업 규칙은 `CLAUDE.md`, 작업 흐름은 `docs/development/contributor-guide.md`를 봅니다.

## 문서
| 문서 | 내용 |
| --- | --- |
| `docs/design/00-overview.md` | 목적, 구성, 로드맵 |
| `docs/design/systems/` | 영역별 기준 |
| `docs/design/decisions.md` | 결정 기록 |
| `docs/design/verification.md` | 항상 지켜야 할 규칙 |

## 배포
GitHub Pages

## 출처
Data based on NEXON Open API. 이 프로젝트는 넥슨과 관련이 없는 개인 프로젝트입니다.
