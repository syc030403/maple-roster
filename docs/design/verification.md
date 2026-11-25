# 항상 지켜야 할 규칙과 확인 방법

기획 파일 "지켜야 할 규칙"에는 이 문서의 번호(V1…)를 적는다. 번호는 한 번 정하면 바꾸지 않는다. 쓰지 않게 된 규칙은 지우지 말고 규칙 칸에 "(폐지)"를 붙인다.
"자동"은 명령으로 확인, "직접"은 사람이 실제 환경에서 확인. 직접 확인을 못 했으면 보고에 못 했다고 적는다.
CI를 두면 자동 항목 일부를 함께 검사할 수 있다. CI는 보조이고, V2의 `CLAUDE.local.md` 문자열 점검은 CI에 넣지 않고 로컬에서만 한다.

## 공통 (모든 프로젝트)

| 번호 | 규칙 | 확인 방법 | 종류 |
| --- | --- | --- | --- |
| V1 | 비밀값이 git에 없음 | `git ls-files .env` 출력이 비어 있음. `git diff --cached`에 토큰·비밀번호 없음. 새 키는 `.env.example`에 이름만 | 자동 |
| V2 | 공개 파일에 로컬 정보가 없음 | `CLAUDE.local.md`의 "공개 파일 점검용 문자열" 각각으로 `git grep -nF '<값>'` 결과가 비어 있음. `git ls-files CLAUDE.local.md` 비어 있음. `git grep -nE '/home/[A-Za-z0-9_]\|/Users/[A-Za-z0-9_]'`로 사용자 홈 경로가 없음 | 자동 |
| V3 | 자동 검증 통과 | `CLAUDE.md` "검증" 절의 자동 명령이 모두 통과. 도구가 없어서 못 돌렸으면 통과가 아님 | 자동 |
| V4 | 실제 환경 반영은 확인 기록이 있음 | 기동·접속·배포·복구가 필요한 변경은 `CLAUDE.md` "검증" 절의 직접 확인 결과, 또는 못 한 이유가 보고·PR에 있음 | 직접 |
| V5 | 데이터 파괴 명령 검토 | `git grep -nE 'rm -rf\|down -v\|DROP '` 결과 검토. 삭제 경로는 고정 디렉토리 안으로 제한, 실행은 승인 후 | 자동 |

## 프로젝트 고유 (V20부터)

프로젝트에서 항상 지켜야 할 규칙이 생기면 여기에 번호를 이어서 붙인다. 예: "외부 공개 포트는 하나뿐", "관리 API는 127.0.0.1에만 바인딩", "마이그레이션은 되돌리기 스크립트와 함께".

| 번호 | 규칙 | 확인 방법 | 종류 |
| --- | --- | --- | --- |
| V20 | NEXON Open API 키가 저장소에 없음 | `git grep -nE '(live\|test)_[0-9a-f]{20,}'` 결과가 비어 있음. 테스트는 가짜 키(`test-key` 등)만 사용 | 자동 |
| V21 | 외부 요청은 `src/api/`에서만, 대상은 NEXON Open API뿐 | `git grep -nE '\bfetch\(\|XMLHttpRequest\|axios' -- src ':!src/api'` 결과가 비어 있음. `git grep -nE 'https?://' -- src`에 `open.api.nexon.com` 외 요청 주소가 없음 | 자동 |
| V22 | 화면에 NEXON Open API 출처 표기 | `git grep -n 'NEXON Open API' -- src`로 표기 컴포넌트 확인. 배포 화면에서 보이는지 확인 | 자동 + 직접 |
| V23 | 사용자 데이터는 브라우저에만 | API 키·보스 처치 기록은 `localStorage`에만 저장하고 NEXON Open API 외로 전송하지 않음. V21과 함께 `git grep -n 'localStorage' -- src`로 저장 위치가 `src/storage/` 한 곳인지 확인 | 자동 |
| V24 | 게임 고정 데이터에 출처와 기준 날짜 | `src/data/*.json` 각 파일에 `source`, `updatedAt` 키가 있음 (`npm test`의 데이터 검사 테스트) | 자동 |
| V25 | GitHub Pages 하위 경로에서 동작 | `npm run build` 뒤 `dist/index.html`의 자산 경로가 `base`(`/<저장소 이름>/`)로 시작. 배포 주소에서 새로고침해도 화면이 깨지지 않음 | 자동 + 직접 |
