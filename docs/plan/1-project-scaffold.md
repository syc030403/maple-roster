# #1 프로젝트 뼈대: Vite + React + TS, 검증 도구, GitHub Pages 배포

- 이슈: #1
- 브랜치: `chore/1-project-scaffold`
- 종류: chore · 영역: area:deploy
- 선행: 없음
- 함께 나눈 이슈: 없음

## 목적
이후 기능 이슈(#2~)가 화면·로직 코드만 쓰면 되도록 빌드, 자동 검증, GitHub Pages 배포를 한 번에 갖춘다. 끝나면 배포 주소에서 빈 첫 화면과 출처 표기를 볼 수 있다.

## 규칙 / 변경 내용
- [확정] Vite + React + TypeScript. `npm create vite`의 react-ts 템플릿을 기준으로 필요 없는 예제(로고, 카운터)는 지운다.
- [확정] npm 스크립트 이름은 `CLAUDE.md` "검증"에 맞춘다: `dev`, `build`, `preview`, `lint`, `typecheck`(`tsc -b --noEmit` 또는 동등), `test`(`vitest run`).
- [확정] 개발 의존성: ESLint(템플릿 기본 설정), Vitest. 그 밖의 라이브러리는 넣지 않는다 (라우터, 상태 관리, UI 키트, testing-library 없음).
- [확정] 디렉토리: `src/api`, `src/storage`, `src/logic`, `src/data`, `src/ui`. 빈 폴더는 역할 한 줄을 적은 `README.md`로 유지한다.
- [확정] Vite `base`: 빌드는 `/maple-roster/`, 개발 서버는 `/` (V25).
- [확정] 첫 화면: 앱 이름, "준비 중" 안내, 하단 출처 표기 `Data based on NEXON Open API` (V22). 출처 표기는 `src/ui/Footer.tsx` 컴포넌트로 분리.
- [확정] 테스트 2개 (네트워크 없음):
  - Footer를 `react-dom/server`의 `renderToString`으로 렌더해 출처 문구 확인
  - `src/data/*.json` 각 파일에 `source`, `updatedAt`이 있는지 검사 (V24. 지금은 파일 0개라 통과하고, 이후 데이터가 생기면 자동 적용)
- [확정] 배포: `.github/workflows/deploy.yml`
  - 트리거: `main` push, `workflow_dispatch`
  - 단계: `npm ci` → `lint` → `typecheck` → `test` → `build` → `actions/upload-pages-artifact`(`dist`) → `actions/deploy-pages`
  - 권한: `contents: read`, `pages: write`, `id-token: write`. 비밀값 없음
  - 검증 단계가 실패하면 배포하지 않는다. PR merge는 막지 않는다 (CI 보조 원칙 유지)
- [임시] 별도의 PR용 CI 워크플로는 만들지 않는다. 필요해지면 따로 이슈.
- [임시] CI Node 버전 24 (LTS). 로컬은 `CLAUDE.local.md` 참고.
- [확정] 저장소 설정 (승인 후 `/task`에서 실행, 되돌리는 방법 함께 제시):
  - Pages 활성화, 소스 = GitHub Actions
  - `github-pages` 환경의 배포 허용 브랜치에 `main` 추가 [확인 필요: 기본 브랜치가 `develop`이라 기본값으로는 `main` 배포가 거부될 수 있음]
- [확정] 문서: `docs/design/systems/deploy.md`를 실제 구성으로 갱신, `CLAUDE.md` "검증"의 "[임시]/해당 없음" 문구 정리, README 개발 절 갱신.

## 수용 기준
- [ ] 성공: `npm ci && npm run lint && npm run typecheck && npm test && npm run build`가 로컬에서 모두 통과
- [ ] 성공: `npm run dev`로 첫 화면과 출처 표기가 보임
- [ ] 성공: `dist/index.html`의 스크립트·스타일 경로가 `/maple-roster/`로 시작
- [ ] 성공: `workflow_dispatch` 또는 `main` 반영 후 배포 워크플로가 성공하고 Pages 주소에서 첫 화면이 뜸
- [ ] 실패·예외: 테스트를 일부러 깨뜨리면 워크플로가 build 전 단계에서 멈추고 배포되지 않음 (로컬에서 `npm test` 실패로 확인, 워크플로 순서는 파일로 확인)
- [ ] 경계: Pages 주소에서 새로고침해도 404·자산 깨짐이 없음
- [ ] 경계: `src/data/`에 `source` 없는 JSON을 임시로 넣으면 데이터 검사 테스트가 실패함 (확인 후 삭제)

## 지켜야 할 규칙
- V1, V2, V3, V4(배포 확인 기록), V5
- V20(키 없음), V21(외부 요청 없음 — 이번엔 `fetch` 자체가 없어야 함), V22, V24, V25
- decisions.md: 정적 웹앱 + GitHub Pages, Vite + React + TS, 기본 브랜치 develop

## 영향 범위 (예상)
- 설정: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`
- 코드: `src/main.tsx`, `src/ui/App.tsx`, `src/ui/Footer.tsx`, 폴더별 `README.md`
- 테스트: `src/ui/Footer.test.tsx`, `src/data/data.test.ts`
- 배포: `.github/workflows/deploy.yml`
- 문서: `docs/design/systems/deploy.md`, `CLAUDE.md`, `README.md`, `docs/design/decisions.md`
- [추론] 파일 수는 10개를 넘지만 대부분 템플릿 설정이고, 직접 쓰는 코드는 300줄 이하라 나누지 않는다.

## 확인 방법
- 자동: `CLAUDE.md` "검증" 4개 명령, V2·V20·V21 grep, `grep -o 'src="[^"]*"' dist/index.html`
- 직접: `npm run dev` 화면 확인, 저장소 설정 후 `gh workflow run deploy.yml --ref main`(승인 필요) → `gh run watch` → Pages 주소 접속·새로고침

## 범위 밖
- API 키 입력, NEXON Open API 호출 (#2)
- 화면 디자인, 라우팅
- PR용 CI 워크플로
- 사용자 지정 도메인

## 이 기획에서 내린 결정
| 결정 | 이유 | decisions.md |
| --- | --- | --- |
| 배포 워크플로 안에서 lint·typecheck·test를 돌리고, 실패하면 배포 중단 | 깨진 빌드 배포 방지. merge는 막지 않음 | 추가 |
| PR용 CI는 두지 않음 [임시] | 로컬 검증이 기준, 도구 최소화 | 추가 안 함 |
| 기본 브랜치 develop | `Closes #N`이 develop merge 때 동작 | 추가 |

## 진행 기록
- 2026-11-25 빈 기획 파일 생성 (/issue)
- 2026-11-25 기획 작성 (/plan)
