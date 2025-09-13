# 🐕 Husky 커밋/프리커밋 설정 가이드 (간소화 버전)

이 디렉토리는 Git hooks를 통한 기본 커밋/프리커밋 검증을 포함하고 있습니다. 현재 설정은 브랜치별 규칙 없이 공통 커밋 메시지 규칙(Conventional Commits 기반, 간소화)을 적용합니다.

## 📌 기본 커밋 메시지 형식

모든 브랜치에서 다음 형식을 따르는 것을 권장합니다:

```
type(scope): summary [TICKET]
```

### 📋 구성 요소 설명

| 구성 요소 | 설명 | 필수 여부 | 예시 |
|-----------|------|-----------|------|
| **type** | 커밋 유형 | ✅ 권장 | `feat`, `fix`, `docs` |
| **scope** | 앱/도메인/패키지명 | ✅ 권장 | `user-api`, `auth-service`, `web-admin` |
| **summary** | 간결한 설명 | ✅ 필수 | `사용자 로그인 기능 추가` |
| **[TICKET]** | Jira 티켓 번호 | 🔄 권장 | `[PROJ-123]`, `[PROJ-123][PROJ-456]` |

## 📁 디렉토리 구조 (현재)

```
.husky/
├── _/               # husky helper (자동 생성)
├── pre-commit       # Pre-commit hook
├── commit-msg       # Commit-msg hook (공통 규칙)
└── README.md        # 이 파일
```

## 🎯 Type 목록

| type | 사용 시점 | 예시 |
|------|-----------|------|
| `feat` | 새로운 기능 추가 | `feat(user-api): 소셜 로그인 기능 추가` |
| `fix` | 버그 수정 | `fix(auth-service): JWT 토큰 만료 오류 수정` |
| `refactor` | 코드 리팩토링 (기능 변화 없음) | `refactor(shared-lib): 유틸리티 함수 구조 개선` |
| `perf` | 성능 개선 | `perf(api): 데이터베이스 쿼리 최적화` |
| `test` | 테스트 코드 추가/수정 | `test(user-api): 회원가입 API 단위 테스트 추가` |
| `docs` | 문서 관련 변경 | `docs(readme): API 엔드포인트 문서 업데이트` |
| `chore` | 빌드/도구/환경 설정 변경, 유지보수성 작업 | `chore(webpack): 빌드 설정 최적화` |

## 🎯 Scope 작성 규칙

- 반드시 작성하길 권장 (빈 값 지양)
- 해당 변경이 일어난 앱/도메인/패키지명을 입력
- kebab-case 형식 권장

### 📋 Scope 예시

| 분류 | Scope 예시 | 설명 |
|------|-----------|------|
| **API 서비스** | `user-api`, `auth-service`, `payment-api` | 백엔드 API 서비스 |
| **프론트엔드** | `web-admin`, `mobile-app`, `dashboard` | 프론트엔드 앱 |
| **공통 라이브러리** | `shared-lib`, `utils`, `components` | 공유 라이브러리 |
| **인프라/도구** | `build`, `docker`, `ci`, `webpack` | 빌드/배포 관련 |
| **문서** | `readme`, `api-docs`, `changelog` | 문서 관련 |

## 📝 Summary 작성 규칙

- 한 줄 요약 (명령문 형태 권장)
- 최대 100자 이내
- 한국어/영어 모두 가능
- 마침표(.) 붙이지 않음

### ✅ Summary 예시

```bash
# ✅ 좋은 예시
feat(user-api): 사용자 프로필 이미지 업로드 기능 추가
fix(auth-service): 로그인 시 토큰 검증 로직 오류 수정
refactor(shared-lib): HTTP 클라이언트 모듈 구조 개선

# ❌ 나쁜 예시
feat(user-api): 기능을 추가했습니다.  # 마침표 사용
fix(): 버그 수정  # scope 누락
feat(user-api): 이 커밋은 사용자 API에 새로운 기능을 추가하는데 그 기능은 프로필 이미지를 업로드할 수 있는 기능입니다.  # 너무 김
```

## 🎫 [TICKET] 작성 규칙 (현행)

- 메시지 끝에 Jira 티켓 번호를 붙이는 것을 권장합니다: `[PROJ-123]`
- 여러 개 가능: `[PROJ-123][PROJ-456]`
- 현재 훅은 티켓 포함을 강제하지 않습니다. (브랜치별 강제 규칙 미적용)

## 🌿 브랜치별 규칙 (현행)

현재는 브랜치별로 다른 규칙을 적용하지 않습니다. 모든 브랜치에서 동일한 공통 형식 가이드를 사용합니다. 추후 필요 시 브랜치별 규칙을 추가할 수 있습니다.

## 🔍 Pre-commit 검증 (현재 스크립트 기준)

커밋 전에 다음 항목들이 자동으로 검증됩니다:

1. ESLint 검사
   - 명령: `npx eslint --max-warnings=0 <스테이징된 JS/TS 파일들>`
   - 실패 시 커밋 차단
2. TypeScript 타입 체크
   - 명령: `npx tsc --noEmit`
   - 실패 시 커밋 차단
3. Prettier 포맷팅 체크
   - 명령: `npx prettier --check <스테이징된 JS/TS 파일들>`
   - 실패 시 커밋 차단
4. 코드 패턴 안내 (차단하지 않음)
   - `console.log` 감지 시 경고
   - `TODO`/`FIXME`/`XXX` 개수 안내

## 🛠️ 현재 훅 동작 요약

- `commit-msg`: 간단한 Conventional Commits 기반 검사. Merge 커밋은 허용. 현재 스크립트는 엄격한 정규식이 아닌 "허용 타입으로 시작하고 '('가 이어지는지"를 중심으로 느슨하게 확인합니다.
- `pre-commit`: ESLint, TypeScript 타입 체크(tsc --noEmit), Prettier 포맷 검사를 수행하며 실패 시 커밋을 차단합니다. `console.log`, `TODO/FIXME/XXX`는 경고/정보로 안내합니다.

## 🔧 설치 및 설정

### 1. 의존성 설치 (필요 시)

```bash
pnpm add -D husky -w
```

### 2. Husky 초기화

```bash
npx husky init
npm pkg set scripts.prepare="husky install"
```

### 3. Git hooks 활성화

이미 필요한 Git hooks가 포함되어 있습니다. 커밋 시 자동으로 실행됩니다.

### 4. 커밋 메시지 검사 엄격도 상향 (선택)

현재 `commit-msg` 훅은 비교적 느슨합니다. 더 엄격하게 하려면 `commit-msg` 스크립트에서 정규식을 사용해 `type(scope): summary` 형식을 강제하도록 개선할 수 있습니다. (브랜치별 규칙 없이도 적용 가능)

## 🚀 커밋 예시 (공통 규칙)

```bash
git add .
git commit -m "feat(user-api): 사용자 인증 시스템 추가"
# ✅ 통과: 공통 형식에 맞음 (티켓은 선택)

git commit -m "fix: 버그 수정"
# ⚠️ 현재 스크립트는 느슨해 일부 케이스 통과할 수 있음. 엄격화 시 실패 가능
```

## 🐛 문제 해결

### 1. Pre-commit 검증 실패

```bash
# ESLint 오류 수정
npx eslint --fix <파일명>

# Prettier 포맷팅 적용
npx prettier --write <파일명>

# TypeScript 오류 확인
npx tsc --noEmit
```

### 2. 커밋 메시지 규칙 위반

```bash
# ❌ 잘못된 형식
git commit -m "add user feature"

# ✅ 올바른 형식
git commit -m "feat(user-api): 사용자 기능 추가 [PROJ-123]"
```

### 3. 스크립트 실행 권한 오류

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

## 📝 커스터마이징

- 공통 규칙만 유지: 현재처럼 단일 `commit-msg`에서 모든 브랜치에 동일 규칙 적용
- 엄격도 조정: `commit-msg` 내 정규식 강도를 높여 형식을 강제
- 티켓 정책: 조직 정책에 맞게 티켓 필수 여부를 공통 규칙으로 결정

---

**📅 마지막 업데이트**: 2025년 9월  
**🔧 설정 버전**: v2.1 (브랜치별 규칙 비활성화, 공통 규칙으로 간소화)