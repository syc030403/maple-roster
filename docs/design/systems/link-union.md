# area:link-union — 링크 스킬과 유니온 효과

## 규칙
- [확정] 원본은 디렉터가 직접 수집한 Markdown 파일(`data/raw/link-skills.md`, `data/raw/union-effects.md` 예정)이다. 구현 시 이를 `src/data/link-union.json`으로 옮기고, 원본 md도 함께 커밋한다.
- [확정] 원본 md 맨 위에 `출처`(게임 내 확인 / 공식 홈페이지 / 참고한 사이트 URL)와 `기준 날짜`를 적는다. JSON의 `source`, `updatedAt`도 같은 값으로 채운다 (V24).
- [확정] 위키 등 남이 쓴 글을 그대로 옮긴 경우에는 그 사이트의 라이선스에 따라 화면에도 출처를 표기한다. 수치만 정리한 경우에는 파일 안 표기로 충분하다.
- [확정] 내 캐릭터가 있는 직업은 실제 레벨 기준 링크 레벨·유니온 등급을 함께 보여준다.
- [임시] 실제 보유 링크는 `character/link-skill` 응답으로 보강할 수 있다 (이슈 4 `/plan`에서 결정).

