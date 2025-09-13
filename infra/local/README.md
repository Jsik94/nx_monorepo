# 로컬 인프라(local) 가이드

이 폴더는 로컬 개발 환경에서 필요한 인프라를 모아둔 위치입니다. 특히 컨테이너 관련 리소스는 `docker/` 하위에 정리되어 있습니다.

## 폴더 구조

```
local/
└── docker/
    ├── .env                       # 공통으로 쓰는 환경 변수 파일(선택)
    ├── docker-compose.base.yml    # 기본 설정이 담긴 Compose 파일
    └── services/                  # 각 서비스별 리소스 모음
        └── postgres/
            ├── Dockerfile         # Postgres 컨테이너 빌드 정의
            ├── init.sql           # 초기화 스크립트(옵션)
            └── init/
                └── 01-init-db.sql # 추가 초기화 스크립트들
```

## 포함된 서비스

- PostgreSQL (메인 데이터베이스)

## 사용 방법

아래 명령은 `infrastructure/local` 디렉터리 기준입니다.

### 1) 환경 변수 준비(.env)

`docker/.env` 파일을 생성하여 필요 시 환경 변수를 지정할 수 있습니다.

```bash
# docker/.env 예시
POSTGRES_DB=rnd_nx_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

환경 변수를 파일로 두지 않고, 실행 시점에 직접 넘겨도 됩니다.

### 2) 컨테이너 실행/중지

```bash
# 실행 (db 프로파일만 기동)
docker compose --env-file docker/.env -f docker/docker-compose.base.yml --profile db up -d

# 중지
docker compose -f docker/docker-compose.base.yml --profile db down

# 상태 확인
docker compose -f docker/docker-compose.base.yml ps

# 로그 확인
docker compose -f docker/docker-compose.base.yml logs -f postgres
```

Windows(cmd)에서도 동일하게 동작합니다. 경로 구분자만 상황에 맞게 사용하세요.

```cmd
REM 실행
docker compose --env-file docker\.env -f docker\docker-compose.base.yml --profile db up -d

REM 중지
docker compose -f docker\docker-compose.base.yml --profile db down
```

## 데이터베이스 초기화

PostgreSQL 컨테이너가 처음 시작될 때 아래 스크립트들이 자동 실행됩니다.

- `docker/services/postgres/init.sql`
- `docker/services/postgres/init/` 내 모든 스크립트(알파벳/이름순)

스크립트를 수정했다면 컨테이너를 재생성하세요.

```bash
docker compose -f docker/docker-compose.base.yml --profile db down
docker compose --env-file docker/.env -f docker/docker-compose.base.yml --profile db up -d
```

## 접속 정보(기본값)

- Host: localhost
- Port: `${POSTGRES_PORT:-5432}`
- Username: `${POSTGRES_USER:-postgres}`
- Password: `${POSTGRES_PASSWORD:-postgres}`
- Database: `${POSTGRES_DB:-rnd_nx_dev}`

## 애플리케이션 연동

애플리케이션에서 다음 환경 변수를 사용하도록 설정합니다.

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=rnd_nx_dev`

## 참고

- 볼륨 경로: `docker/services/postgres/data` (컨테이너 재생성 시에도 데이터 유지)
- `docker-compose.base.yml`의 `profiles`를 사용해 필요한 서비스만 선택적으로 기동할 수 있습니다.
