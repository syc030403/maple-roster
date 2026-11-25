# area:deploy — 빌드와 GitHub Pages 배포

## 규칙
- [확정] GitHub Pages로 배포. 서버 없음.
- [임시] `main`에 push되면 GitHub Actions(`deploy.yml`)가 `npm ci && npm run build` 후 `actions/deploy-pages`로 배포. `develop`은 배포하지 않는다.
- [확정] Vite `base`를 `/<저장소 이름>/`로 설정 (V25).
- [임시] 라우팅이 필요하면 해시 라우팅(`#/...`)을 써서 Pages 새로고침 404를 피한다.
- [확정] 배포 워크플로에는 비밀값이 필요 없다 (API 키는 사용자 브라우저에서만).
- [확정] 화면 하단에 NEXON Open API 출처 표기 (V22).

## 확인
- 상태: `CLAUDE.md` "실행 환경"
- 배포 후 직접: Pages 주소 접속, 새로고침, 자산 로드
