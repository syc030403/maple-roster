# area:api — NEXON Open API 연동

## 규칙
- [확정] 브라우저에서 NEXON Open API를 직접 호출한다. 프록시 없음 (Q4, #7에서 실제 키로 확인. preflight가 요청 Origin과 `x-nxopen-api-key` 헤더를 허용).
- [확정] 키는 사용자가 화면에서 입력, `localStorage`(`maple-roster:api-key`, `src/storage/apiKey.ts`)에만 저장. "키 지우기" 버튼 제공.
- [확정] 새 키는 `character/list` 호출이 성공했을 때만 저장한다. 실패하면 오류 문구만 보여준다.
- [확정] 요청 헤더 `x-nxopen-api-key`. 요청은 `src/api/client.ts`의 `nexonGet`에서만 (V21).
- [확정] 같은 키 + 같은 URL의 성공 응답은 세션 동안 메모리 캐시. 진행 중인 같은 요청은 합친다. 실패는 캐시하지 않는다. "키 지우기" 때 캐시도 비운다.
- [임시] 동시 요청 상한 `MAX_CONCURRENT_REQUESTS = 5` (`src/api/client.ts` 상수 하나).
- [확정] 오류 구분 (`ApiError.kind`)과 문구 (`src/ui/errorMessage.ts`):

  | 종류 | 조건 | 문구 |
  | --- | --- | --- |
  | `invalid-key` | 오류 코드 `OPENAPI00005` (400) | API 키가 올바르지 않습니다. 키를 다시 확인해 주세요. |
  | `rate-limit` | 429 또는 `OPENAPI00007` [추론: 실제 재현 안 함] | 호출 한도를 넘었습니다. 잠시 후 다시 시도해 주세요. |
  | `network` | `fetch` 자체 실패 | 네트워크 오류로 불러오지 못했습니다. 연결을 확인해 주세요. |
  | `server` | 그 밖의 오류 (코드 표시) | NEXON Open API 오류로 불러오지 못했습니다. (코드) |
  | 캐릭터 없음 | 응답은 성공, 캐릭터 0명 | 이 계정에 캐릭터가 없습니다. |

## 쓰는 엔드포인트
`character/list`는 #7에서 실제 응답으로 확인했다(`account_list[].character_list[]`에 `ocid`, `character_name`, `world_name`, `character_class`, `character_level`). 나머지는 쓰는 이슈에서 확인한다.

| 용도 | 엔드포인트 |
| --- | --- |
| 계정 캐릭터 목록 | `GET /maplestory/v1/character/list` (확인함) |
| 이름 → ocid | `GET /maplestory/v1/id?character_name=` |
| 기본 정보 | `GET /maplestory/v1/character/basic?ocid=` |
| 전투력 (최종 스탯) | `GET /maplestory/v1/character/stat?ocid=` |
| 보유 링크 스킬 | `GET /maplestory/v1/character/link-skill?ocid=` |
| 유니온 / 공격대 | `GET /maplestory/v1/user/union`, `/user/union-raider` |

