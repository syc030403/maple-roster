# area:deploy — 빌드와 GitHub Pages 배포

## 규칙
- [확정] GitHub Pages로 배포. 서버 없음.
- [확정] `main`에 push되거나 수동 실행(`workflow_dispatch`)하면 `.github/workflows/deploy.yml`이 `npm ci` → `lint` → `typecheck` → `test` → `build` 후 `actions/deploy-pages`로 배포. 검증이 실패하면 배포하지 않는다. `develop`은 배포하지 않는다.
- [확정] 저장소 설정: Pages 소스 = GitHub Actions. 기본 브랜치가 `develop`이므로 `github-pages` 환경의 배포 허용 브랜치에 `main`이 있어야 한다.
- [임시] CI Node 버전 24. PR용 CI 워크플로는 없다.
- [확정] Vite `base`: 빌드 시 `/maple-roster/`, 개발 서버는 `/` (`vite.config.ts`, V25).
- [임시] 라우팅이 필요하면 해시 라우팅(`#/...`)을 써서 Pages 새로고침 404를 피한다.
- [확정] 배포 워크플로에는 비밀값이 필요 없다 (API 키는 사용자 브라우저에서만).
- [확정] 화면 하단에 NEXON Open API 출처 표기 (`src/ui/Footer.tsx`, V22).

## 확인
- 상태: `CLAUDE.md` "실행 환경"
- 배포 후 직접: Pages 주소 접속, 새로고침, 자산 로드
