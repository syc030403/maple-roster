# maple-roster 개요

## 목적
메이플스토리 계정을 입력하면 내 캐릭터를 한 화면에 모아 보고, 직업별 링크 스킬·유니온 효과와 캐릭터별 주간 보스 추천·처치 현황을 확인하는 정적 웹앱.

## 기능
| # | 기능 | 영역 | 상태 |
| --- | --- | --- | --- |
| F1 | 계정 입력(NEXON Open API 키) → 내 캐릭터 목록 | `area:api` `area:roster` | [확정] |
| F2 | 현재 존재하는 전체 직업 목록. 내가 만든 직업 / 만들지 않은 직업 구분 | `area:roster` | [확정] |
| F3 | 직업별 링크 스킬, 링크 효과, 유니온 공격대원 효과 | `area:link-union` | [확정] |
| F4 | 내 캐릭터 선택 → 전투력, 전투력에 맞는 보스 12마리 추천 | `area:boss` | [확정] |
| F5 | 보스 처치 현황. 추천 12마리 중 잡은 보스에 "처치" 표시 | `area:boss` | [확정] (직접 체크 방식) |
| F6 | GitHub Pages 배포 | `area:deploy` | [확정] |

- [추론] "계정 입력"은 NEXON Open API 키 입력이다. 키 하나가 넥슨 계정 하나에 묶여 있고, `character/list`가 그 계정의 캐릭터를 모두 돌려준다.
- [추론] "모든 캐릭터"는 게임에 존재하는 전체 **직업**을 뜻한다. 같은 직업 캐릭터가 여러 개면 하나로 묶어 "보유"로 본다.
- [추론] "보스 12마리"는 캐릭터당 주간 보스 결정석 판매 한도(12개)에 맞춘 것이다.

## 구성
```
브라우저 (GitHub Pages 정적 파일)
  ├─ 화면 (src/ui)          ─ 판단 로직(src/logic, 순수 함수)
  ├─ src/api   ── HTTPS ──▶ NEXON Open API (open.api.nexon.com)
  ├─ src/storage ─▶ localStorage (API 키, 보스 처치 체크)
  └─ src/data/*.json (직업·링크·유니온·보스 고정 데이터)
```
- 서버 없음. 모든 호출은 사용자 브라우저에서 사용자 본인의 키로 한다.

## 디렉토리 (예정)
| 경로 | 내용 |
| --- | --- |
| `src/api/` | NEXON Open API 클라이언트, 캐시, 동시 요청 제한 |
| `src/storage/` | localStorage 읽기·쓰기 (키, 보스 체크) |
| `src/logic/` | 보스 추천, 주간 초기화, 직업 보유 계산 (테스트 대상) |
| `src/data/` | 고정 게임 데이터 JSON (`source`, `updatedAt` 필수) |
| `src/ui/` | 화면 |
| `.github/workflows/deploy.yml` | GitHub Pages 배포 |
| `docs/` | 설계·기획·협업 문서 |

## 로드맵
| 순서 | 이슈 (예정) | 종류 · 영역 | 상태 |
| --- | --- | --- | --- |
| 1 | 프로젝트 뼈대: Vite + React + TS, 린트·테스트, Pages 배포 워크플로, 출처 표기 | chore · `area:deploy` | 예정 |
| 2 | API 키 입력, 캐릭터 목록 (CORS 확인 포함) | feature · `area:api` `area:roster` | 예정 |
| 3 | 전체 직업 목록과 보유/미보유 구분 | feature · `area:roster` | 예정 |
| 4 | 직업별 링크 스킬·유니온 효과 | feature · `area:link-union` | 예정 |
| 5 | 캐릭터 상세: 전투력, 보스 12마리 추천 | feature · `area:boss` | 예정 |
| 6 | 보스 처치 현황과 추천 목록의 처치 표시 | feature · `area:boss` | 예정 |

## 결정된 사항
| # | 내용 | 결정 |
| --- | --- | --- |
| Q1 | 기술 스택 | [확정] Vite + React + TypeScript |
| Q2 | 보스 처치 현황 데이터 원천 | [확정] 직접 체크, localStorage 저장, 매주 목요일 00:00(KST) 초기화 |
| Q3 | 보스별 권장 전투력 기준표 | [확정] 직접 정리한 `src/data/bosses.json`이 기준. 공식·외부 수치가 있으면 참고해 반영하되 JSON을 우선 |

## 남은 [미정]
| # | 내용 | 선택지 | 추천 |
| --- | --- | --- | --- |
| Q4 | 브라우저에서 NEXON Open API 직접 호출(CORS) 가능 여부 | 가능하면 그대로 / 안 되면 프록시(외부 비용·계정 생김) | 이슈 2에서 먼저 확인. 프록시가 필요하면 디렉터 확인 |
