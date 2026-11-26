# #7 API 키 입력, 캐릭터 목록 (CORS 확인 포함)

- 이슈: #7
- 브랜치: `feature/7-api-key-character-list`
- 종류: feature · 영역: area:api, area:roster
- 선행: 없음
- 함께 나눈 이슈: 없음

## 목적
사용자가 자기 NEXON Open API 키를 넣으면 그 계정의 캐릭터가 월드별로 보이게 한다. 이후 기능(#3~)이 쓸 API 클라이언트(캐시, 동시 요청 제한, 오류 구분)와 키 저장소를 이번에 만든다. Q4(CORS)를 실제 키로 확인해 닫는다.

## 규칙 / 변경 내용
### CORS (Q4)
- [추론] 브라우저 직접 호출 가능. 2026-11-26 키 없이 확인: preflight에 요청 Origin이 그대로 허용되고(`localhost:5173`, `*.github.io` 모두) `access-control-allow-headers: x-nxopen-api-key`가 온다.
- [확정] `/task`에서 실제 키로 `npm run dev` 화면에서 목록이 뜨면 Q4를 "직접 호출, 프록시 없음"으로 닫는다 (decisions.md, 00-overview.md, api.md 갱신). 막히면 멈추고 디렉터 확인.

### API 클라이언트 (`src/api/`)
- [확정] `client.ts`: `nexonGet(path, params, apiKey)`. 기본 주소 `https://open.api.nexon.com`, 헤더 `x-nxopen-api-key`. `fetch`는 여기서만 (V21).
- [확정] 캐시: 같은 키 + 같은 요청 URL의 성공 응답을 메모리에 저장해 다시 호출하지 않는다. 실패 응답은 캐시하지 않는다. 같은 요청이 동시에 들어오면 한 번만 보낸다. 키를 지우면 캐시도 비운다.
- [임시] 동시 요청 상한 `MAX_CONCURRENT_REQUESTS = 5` (상수 하나). 넘는 요청은 대기열에서 순서대로.
- [확정] 오류를 종류로 바꿔 던진다 (`ApiError.kind`):
  - `invalid-key`: 400 + `OPENAPI00005` (확인함)
  - `rate-limit`: 429 또는 `OPENAPI00007` [추론, 실제 확인 못 할 수 있음]
  - `network`: `fetch` 자체 실패
  - `server`: 그 밖의 응답 오류 (오류 코드 보존)
- [확정] `characters.ts`: `fetchCharacterList(apiKey)` → `GET /maplestory/v1/character/list`. 응답 `account_list[].character_list[]`를 펼쳐 `{ ocid, name, world, job, level }` 배열로 [추론: 응답 형태는 실제 키로 확인 후 api.md 표의 [확인 필요]를 지운다].

### 키 저장 (`src/storage/`)
- [확정] `apiKey.ts`: `loadApiKey`, `saveApiKey`, `clearApiKey`. `localStorage` 키 이름 `maple-roster:api-key`. `localStorage` 접근은 이 폴더에서만 (V23). 테스트는 저장소 객체를 주입해서.

### 묶기·정렬 (`src/logic/`)
- [확정] `groupCharacters.ts` 순수 함수: 월드별로 묶고, 월드 안에서 레벨 내림차순, 같은 레벨이면 이름 가나다순.
- [임시] 월드 순서: 그 월드의 최고 레벨 내림차순, 같으면 월드 이름순.

### 화면 (`src/ui/`)
- [확정] 저장된 키가 없으면 키 입력 화면:
  - 비밀번호 입력란(앞뒤 공백 제거, 비어 있으면 버튼 비활성), "불러오기" 버튼
  - "키는 이 브라우저에만 저장되며 NEXON Open API 외에는 보내지 않습니다" 문구
  - "NEXON Open API에서 키 발급" 링크 (https://openapi.nexon.com/, 새 탭)
- [확정] 불러오기 → `character/list` 호출 → 성공하면 키 저장 후 목록. 실패하면 오류 문구만 보여주고 저장하지 않는다.
- [확정] 저장된 키가 있으면 바로 목록을 불러온다. 실패하면 오류 문구와 "다시 시도", "키 지우기" 버튼.
- [확정] 목록: 월드 이름을 묶음 제목으로, 캐릭터마다 이름·직업·레벨. 상단에 "키 지우기" 버튼 → 키·캐시 삭제 후 입력 화면.
- [확정] 오류 문구:
  - invalid-key: "API 키가 올바르지 않습니다. 키를 다시 확인해 주세요."
  - rate-limit: "호출 한도를 넘었습니다. 잠시 후 다시 시도해 주세요."
  - network: "네트워크 오류로 불러오지 못했습니다. 연결을 확인해 주세요."
  - server: "NEXON Open API 오류로 불러오지 못했습니다. (<오류 코드>)"
  - 캐릭터 0명: "이 계정에 캐릭터가 없습니다."
- [확정] 불러오는 중에는 "불러오는 중..." 표시, 버튼 비활성.
- [확정] 하단 출처 표기(Footer)는 그대로 (V22).
- [확정] 새 의존성 없음 (testing-library, 라우터, 상태 관리 라이브러리 없음).

### 테스트 (네트워크 없음)
- `src/api/client.test.ts` (`fetch`를 `vi.stubGlobal`로 목): 성공, 헤더에 키 포함, `OPENAPI00005` → invalid-key, 429 → rate-limit, fetch 실패 → network, 같은 요청 두 번 → fetch 1회, 실패는 캐시 안 함, 동시 요청이 상한을 넘지 않음
- `src/api/characters.test.ts`: 목 응답(가짜 이름) → 펼친 배열, 계정 여러 개, 빈 목록
- `src/logic/groupCharacters.test.ts`: 월드 묶기, 레벨·이름 정렬, 월드 순서, 빈 배열
- `src/storage/apiKey.test.ts`: 저장·읽기·삭제, 공백만 있는 값
- 목 응답은 `src/api/__fixtures__/character-list.json`, 캐릭터 이름은 가짜로만

## 수용 기준
성공
- [x] 저장된 키가 없으면 첫 화면에 키 입력란, 저장 안내 문구, 발급 링크가 보인다
- [x] 올바른 키를 넣으면 계정의 캐릭터가 월드별로 묶여 이름·직업·레벨로 보이고, 월드 안에서 레벨 내림차순이다
- [x] 새로고침하면 키를 다시 묻지 않고 바로 목록이 뜬다
- [x] "키 지우기"를 누르면 `localStorage`에서 키가 사라지고 입력 화면으로 돌아간다
- [x] 같은 요청을 다시 해도 네트워크 요청이 다시 나가지 않는다 (테스트 + 개발자 도구 Network 탭)

실패·예외
- [x] 틀린 키를 넣으면 키 오류 문구가 뜨고 키가 저장되지 않는다
- [x] 저장된 키로 실패하면 오류 문구, "다시 시도", "키 지우기"가 보인다
- [x] 호출 한도 초과·네트워크 오류·그 밖의 오류는 각각 다른 문구가 뜬다 (테스트로 확인, 실제 한도 초과는 재현 못 할 수 있음)

경계
- [x] 빈 값이나 공백만 넣으면 불러오기 버튼이 눌리지 않는다
- [x] 캐릭터가 0명이면 "캐릭터가 없습니다" 문구가 뜬다 (테스트)
- [x] 동시 요청이 상한(5)을 넘지 않는다 (테스트)

규칙
- [x] Q4가 실제 키로 확인되어 decisions.md·00-overview.md·api.md에 반영되어 있다
- [x] 자동 검증 4개 통과, V20·V21·V23 grep 통과

## 지켜야 할 규칙
- V1 비밀값이 git에 없음
- V2 공개 파일에 로컬 정보 없음 (목 응답·스크린샷에 실제 캐릭터 이름 없음)
- V3 자동 검증 통과
- V4 실제 환경 확인 기록 (실제 키로 dev 화면 확인)
- V20 API 키가 저장소에 없음 (테스트는 `test-key`)
- V21 `fetch`는 `src/api/`에서만. 요청 주소는 `open.api.nexon.com`뿐. 발급 안내 링크(`openapi.nexon.com`)는 `<a href>`라 요청이 아니며, 점검 grep에 나오면 링크임을 확인
- V22 출처 표기 유지
- V23 키는 `localStorage`에만, 접근은 `src/storage/`에서만
- V25 Pages 하위 경로 빌드

## 영향 범위 (예상)
- 새 파일: `src/api/client.ts`, `src/api/characters.ts`, `src/api/__fixtures__/character-list.json`, `src/storage/apiKey.ts`, `src/logic/groupCharacters.ts`, `src/ui/ApiKeyForm.tsx`, `src/ui/CharacterList.tsx`, 테스트 4개
- 수정: `src/ui/App.tsx`, `src/ui/index.css`
- 문서: `docs/design/systems/api.md`, `docs/design/systems/roster.md`, `docs/design/00-overview.md`, `docs/design/decisions.md`, `README.md`(사용법 한 줄)
- [추론] 코드는 테스트 포함 약 400~500줄, 파일 13개 정도. 나누기 기준(10개·300줄)을 넘지만, API 클라이언트만 먼저 하면 화면에서 써 볼 수 있는 결과가 없어서 나누지 않는다

## 확인 방법
- 자동: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, V1·V2·V20·V21·V23 grep
- 직접 (디렉터 키 필요):
  - `npm run dev` → 첫 화면에 입력란이 보이는지
  - 실제 키 → 목록이 뜨는지 (Q4 확인), 새로고침해도 유지되는지, Network 탭에서 중복 요청이 없는지
  - 일부러 틀린 키 → 오류 문구, 키가 저장되지 않는지
  - "키 지우기" → 개발자 도구 Application 탭에서 키가 사라지는지
- 배포 후 Pages 주소에서 같은 흐름 확인은 merge 뒤 디렉터가

## 범위 밖
- 월드 선택 필터와 마지막 선택 기억 → #3 (직업 보유 계산과 함께)
- 캐릭터 이미지, 전투력 등 추가 호출 → #5 이후
- 캐릭터 선택·상세 화면 → #5
- 실제 호출 한도 초과 재현

## 이 기획에서 내린 결정
| 결정 | 이유 | decisions.md |
| --- | --- | --- |
| 월드 선택은 #3에서 | 필터가 실제로 쓰이는 곳이 직업 보유 계산. #7 범위를 줄임 | 추가 안 함 (작업 순서) |
| 키 입력 화면에 발급 안내 링크 둠 | 처음 쓰는 사람이 키를 어디서 받는지 바로 알 수 있게 | 추가 안 함 |
| 목록 항목은 이름·직업·레벨 (character/list 한 번) | 추가 호출 없이 한도 부담 없음 | 추가 안 함 |
| Q4 CORS는 `/task`에서 실제 키로 확인한 뒤 닫는다 | 키 없이 확인한 preflight만으로는 확정하지 않음 | 추가함 (2026-11-26, 직접 호출·프록시 없음) |
| 파일 13개 정도지만 이슈를 나누지 않음 | API 클라이언트만으로는 써 볼 수 있는 결과가 없음 | 추가 안 함 |
| (구현 중) 오류 문구는 `src/ui/errorMessage.ts`로 분리하고 화면 테스트는 `src/ui/screens.test.tsx` 한 파일에 | 문구 구분을 테스트하려면 화면 밖 함수가 필요. 새 의존성 없이 `renderToString`으로 확인 | 추가 안 함 |
| (구현 중) "다시 시도" 때 불러오는 중 상태는 버튼 핸들러에서 바꾼다 | effect 안 setState는 oxlint `react(set-state-in-effect)` 경고 | 추가 안 함 |

## 진행 기록
- 2026-11-26 빈 기획 파일 생성 (/issue)
- 2026-11-26 기획 작성 (/plan)
- 2026-11-26 구현 (/task). 디렉터가 실제 키로 dev 화면 확인 1~5 통과(첫 화면, 틀린 키, 목록, 새로고침, 키 지우기). 호출 한도 초과는 테스트로만 확인
