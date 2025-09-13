# Infra

프로젝트의 인프라 관련 리소스를 모아둔 공간입니다. 로컬 개발 환경 리소스는 `local/` 하위에 있습니다.

## 구조

```
infra/
├── local/
│   ├── docker/
│   │   ├── .env                    # 공통 환경 변수 파일(선택)
│   │   ├── docker-compose.base.yml # 기본 Compose 설정
│   │   └── services/
│   │       └── postgres/
│   │           ├── Dockerfile
│   │           ├── init.sql
│   │           └── init/
│   │               └── 01-init-db.sql
│   └── README.md
└── README.md                        # 이 파일
```

## 로컬 개발 환경

자세한 사용법은 `local/README.md`를 참고하세요. 컨테이너 실행은 `docker-compose.base.yml`과 `.env`(선택)를 기반으로 수행합니다.

### 포함된 서비스

- PostgreSQL: 메인 데이터베이스

## 확장 가이드

필요 시 `local/docker/services/` 하위에 새 디렉터리를 추가하고 `docker-compose.base.yml`에 서비스를 정의하여 확장할 수 있습니다.
