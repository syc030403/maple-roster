# area:api — NEXON Open API 연동

## 규칙
- [확정] 키는 사용자가 화면에서 입력, `localStorage`에만 저장. "키 지우기" 버튼 제공.
- [확정] 요청 헤더 `x-nxopen-api-key`. 요청은 `src/api/`에서만 (V21).
- [임시] 같은 요청은 세션 동안 메모리 캐시. 동시 요청 수 상한은 상수 하나로 둔다.
- [확정] 오류 구분: 키 오류, 호출 한도 초과, 캐릭터 없음, 네트워크. 각각 사용자에게 다른 문구.

## 쓰는 엔드포인트 [확인 필요: 이슈 2에서 실제 응답으로 확인]
| 용도 | 엔드포인트 |
| --- | --- |
| 계정 캐릭터 목록 | `GET /maplestory/v1/character/list` |
| 이름 → ocid | `GET /maplestory/v1/id?character_name=` |
| 기본 정보 | `GET /maplestory/v1/character/basic?ocid=` |
| 전투력 (최종 스탯) | `GET /maplestory/v1/character/stat?ocid=` |
| 보유 링크 스킬 | `GET /maplestory/v1/character/link-skill?ocid=` |
| 유니온 / 공격대 | `GET /maplestory/v1/user/union`, `/user/union-raider` |

## [미정]
- Q4 CORS (`00-overview.md`)
