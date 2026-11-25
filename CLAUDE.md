# maple-roster — Claude 작업 규칙

메이플스토리 계정의 캐릭터 목록, 직업별 링크 스킬·유니온 효과, 캐릭터 전투력에 맞는 주간 보스 12마리 추천과 처치 현황을 보여주는 정적 웹앱. 데이터는 NEXON Open API, 배포는 GitHub Pages.
이 파일은 작업 규칙 요약이다. 원본은 `docs/development/collaboration.md`. 프로젝트 전용 값(고유 규칙, 검증, 실행 환경, 승인 필요 명령, 커밋 금지)은 이 파일에만 적는다.

```
/issue → /plan → /task → /pr → (다른 사람 PR은) /review → 디렉터가 merge
```

새 세션은 `/briefing`(읽기 전용 상태 점검)으로 시작한다.

| 문서 | 내용 |
| --- | --- |
| `CLAUDE.local.md` | 호스트·환경 정보, 보안 설정, 실제 값 (커밋 금지, 공개 금지) |
| `docs/design/00-overview.md` | 목적, 구성, 디렉토리, 로드맵 |
| `docs/design/systems/` | 영역별 기준 문서 (영역 라벨과 1:1) |
| `docs/design/decisions.md` | 결정 기록 |
| `docs/design/verification.md` | 항상 지켜야 할 규칙과 확인 방법 |
| `docs/plan/README.md` | 기획 파일 틀 |
| `docs/development/contributor-guide.md` | 사람용 사용법 |
| `docs/development/records-notion.md` | (선택) Notion 운영·학습 기록 형식. 파일이 있을 때만 기록한다 |

## 역할과 결정
- 사용자는 디렉터(결정권자), Claude는 개발 파트너. 제안은 하되 확정하지 않는다.
- 사소하고 되돌리기 쉬운 구현은 판단해서 진행하고 보고에 "임의로 정한 부분"으로 적는다.
- 방향이 갈리는 결정은 선택지와 추천안을 제시하고 디렉터가 고르게 한다.
- **외부 비용·계정·결제가 생기는 일**(도메인, 유료 서비스·API, 클라우드 리소스, 외부 저장소)은 반드시 먼저 확인한다.
- `docs/design`의 [미정] 사항은 임의로 확정하지 않는다.

### 승인 없이 하지 않는 일
- sudo 명령 실행 → 명령어만 제시하고 디렉터가 직접 실행
- 데이터가 사라지는 명령(데이터·볼륨·DB 삭제, 되돌릴 수 없는 마이그레이션) → 승인 후 실행
- 프로젝트 고유:
- GitHub 저장소 설정 변경(공개 범위, Pages 소스·도메인, 브랜치 보호, Actions 권한·시크릿) → 바꿀 내용과 되돌리는 방법을 보여주고 승인
- `main` 반영으로 이어지는 배포 수동 실행(`gh workflow run`) → 승인 후
- 새 런타임 의존성 추가(`npm install <패키지>`) → 기획 파일에 없으면 이유를 보여주고 승인

## 소통
- 한국어 존댓말, 짧고 직접적으로. 확실하지 않으면 추측하지 말고 확인 명령을 먼저 제시한다.
- 문서에서 [확정] / [임시] / [미정] / [아이디어]를 구분해 표시한다.
- **이모지 사용 금지.** 답변, 문서, 코드·주석, 로그 메시지, 이슈, PR, 커밋 메시지 어디에도 쓰지 않는다.
- 끝나면 보고: 바꾼 것, 확인한 방법, **확인하지 못한 것**, 임의로 정한 부분, 커밋·푸시 여부.

## 코드 규칙
### 공통
- **공개 저장소다.** `CLAUDE.local.md`의 값과 비밀값을 코드·문서·이슈·PR·커밋 메시지에 쓰지 않는다.
- 비밀값·호스트별 값은 `.env`에 둔다. 저장소에는 키 이름만 적은 `.env.example`을 둔다.
- 셸 스크립트가 있으면: `#!/usr/bin/env bash` + `set -euo pipefail`, 여러 번 실행해도 결과가 같게(멱등), 실패하면 0이 아닌 종료 코드, 주기 실행은 `flock`으로 중복 방지, 삭제 경로는 고정 디렉토리 안으로.
- 식별자·파일 이름은 영어, 주석·문서·로그 메시지는 한국어 가능.
- 과한 도구·라이브러리를 먼저 들이지 않는다.

### 프로젝트 고유
- **NEXON Open API 키는 저장소에 넣지 않는다.** 사용자가 화면에서 직접 입력하고 브라우저 `localStorage`에만 둔다. 코드·테스트·문서에 실제 키를 쓰지 않는다(테스트는 가짜 값과 목 응답).
- 서버가 없다(GitHub Pages 정적 호스팅). 사용자 데이터(API 키, 보스 처치 체크)는 브라우저 저장소에만 두고 다른 곳으로 보내지 않는다.
- 외부 요청은 `src/api/` 한 곳에서만 한다. 다른 모듈은 `fetch`를 직접 부르지 않는다. 요청 대상은 NEXON Open API뿐이다.
- NEXON Open API 호출은 같은 응답을 캐시하고 동시 요청 수를 제한한다(호출 한도 대비). [임시] 한도 수치는 `src/api/`의 상수 하나로 둔다.
- 게임 고정 데이터(직업 목록, 직업별 링크 스킬·유니온 효과, 보스 목록·권장 전투력·결정석 가격)는 `src/data/*.json`에 두고, 파일마다 `source`(출처)와 `updatedAt`(기준 날짜)을 적는다. 화면 코드에 수치를 하드코딩하지 않는다.
- 판단 로직(보스 추천, 주간 초기화, 직업 보유 여부 계산)은 화면과 분리한 순수 함수로 두고 테스트를 붙인다.
- 화면 하단에 NEXON Open API 출처 표기를 둔다(`verification.md` V22).
- 경로는 GitHub Pages 하위 경로(`/<저장소 이름>/`) 기준으로 동작해야 한다. 절대 경로 `/assets/...`를 하드코딩하지 않고 Vite `base`를 쓴다.

## 검증
기술 스택: Vite + React + TypeScript. 처음 받았으면 `npm ci`.
- 자동:
  - `npm run lint` (oxlint)
  - `npm run typecheck` (`tsc -b`)
  - `npm test` (Vitest, 네트워크 없이 목 응답으로)
  - `npm run build` (GitHub Pages `base`로 빌드 성공)
- 직접:
  - `npm run dev`로 띄워 실제 API 키를 넣고 캐릭터 목록·전투력이 뜨는지
  - 키가 틀렸을 때·호출 한도 초과 때 오류 문구가 뜨는지
  - 배포 후 GitHub Pages 주소에서 새로고침·직접 접근 시 화면과 자산이 깨지지 않는지

- 해당 파일이 있으면 자동 명령은 모두 통과해야 한다. 도구가 없어서 못 돌렸으면 통과가 아니다. 멈추고 설치 명령을 제시한다.
- 규칙별 확인 방법은 `docs/design/verification.md`. 직접 확인을 못 했으면 못 했다고 적는다.
- 로컬 검증이 기준이다. 통과해야만 푸시한다.
- CI(GitHub Actions)를 두면 보조로만 쓴다. 로컬 검증을 대신하지 않고 merge를 막지 않으며, 결과는 `gh pr checks <번호>`로 본다. `CLAUDE.local.md` 문자열 점검(V2)은 CI에 넣지 않는다.

## 실행 환경
`/briefing`, `/task`, `/review`가 항목 이름으로 찾는다. 이름은 바꾸지 말고 값만 채운다. 없으면 "해당 없음"으로 둔다.
- 상태 확인 (읽기 전용): `gh run list --workflow deploy.yml --limit 3` (배포 워크플로가 생긴 뒤), `gh api repos/{owner}/{repo}/pages --jq '.status,.html_url'`
- 주기 작업 확인 (읽기 전용): 해당 없음
- 기동과 정상 신호: `npm run dev` → 출력에 `Local:` 주소가 뜨고 브라우저에서 첫 화면(API 키 입력)이 보임. 빌드 확인은 `npm run build && npm run preview`
- 조작 명령 (`/briefing`·`/review`는 실행하지 않음): `npm run dev`, `npm run preview`, `gh workflow run deploy.yml`(승인 필요)

## 문서
- 기능을 바꾸면 같은 작업에서 `docs/design/systems/` 문서를 고친다. 사용자용 문서가 있고 영향이 있으면 그것도.
- 방향이 바뀌면 `docs/design/decisions.md` 표 맨 위에 `| 날짜 | 결정 | 이유 | [#12 기획](../plan/12-....md) |`를 추가하고, 기획 파일 "이 기획에서 내린 결정"에도 적는다.

## Git
- 브랜치: `main`(안정·운영) ← `develop`(통합) ← 작업 브랜치 `feature/`·`fix/`·`docs/`·`chore/` + `<이슈번호>-<영어-소문자-설명>`
- **`main`과 `develop`에 직접 커밋하지 않는다.** 작업 브랜치는 최신 `origin/develop`에서 만들고 PR은 `develop`으로.
- **커밋과 푸시는 각각 디렉터가 요청할 때만.** (`/pr` 호출, `/issue` 새 이슈 확인, `/plan` 승인은 그 요청에 해당)
- PR merge와 `develop` → `main` 반영은 디렉터가 한다.
- 커밋 메시지는 한국어: 첫 줄 `<태그>: <요약>` + 빈 줄 + 변경 목록 + 마지막 줄 `Co-Authored-By:`
  - 태그: `feat` `fix` `hotfix` `ui` `refactor` `test` `docs` `chore` (커밋마다 1개)
- 메시지는 파일로 넘긴다: `git commit -F <파일>`
- 푸시한 커밋은 고쳐 쓰지 않는다(`--amend`, 강제 푸시 금지).
- **커밋 금지**: `.env`, `CLAUDE.local.md`, 로그, 그리고 프로젝트 고유:
- `node_modules/`, `dist/`, `coverage/`, `.vite/`, `.DS_Store`
- `claude-workflow-kit/` (키트 원본 복사본)
- 실제 API 응답을 저장한 파일(캐릭터 이름·계정 정보가 들어감). 테스트용 목 응답은 이름을 가짜로 바꿔서만 커밋
