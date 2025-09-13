# Grafana 설정

Grafana 대시보드 및 데이터소스 자동 프로비저닝 설정입니다.

## 📁 폴더 구조

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   └── loki.yaml              # Loki 데이터소스 자동 등록
│   └── dashboards/
│       └── dashboard-provider.yaml # 대시보드 프로바이더 설정
├── dashboards/
│   └── logs-overview.json         # 로그 모니터링 대시보드
└── data/                          # Grafana 데이터 볼륨 마운트
```

## 🔧 데이터소스 설정 (provisioning/datasources/loki.yaml)

### Loki 데이터소스
```yaml
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    isDefault: true
    jsonData:
      maxLines: 1000
      derivedFields:
        - name: TraceID
          matcherRegex: "trace_id=([\\w]+)"
          url: "http://localhost:16686/trace/$${__value.raw}"
          datasourceUid: jaeger
```

### 환경변수
```bash
# Loki 연결 정보
LOKI_URL=http://loki:3100
LOKI_MAX_LINES=1000

# Jaeger 연결 정보 (선택사항)
JAEGER_URL=http://localhost:16686
```

## 🎨 대시보드 설정 (provisioning/dashboards/dashboard-provider.yaml)

### 프로바이더 설정
```yaml
providers:
  - name: 'local-dashboards'
    orgId: 1
    folder: 'Local Dashboards'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: true
```

## 📊 포함된 대시보드

### 로그 모니터링 대시보드 (logs-overview.json)
- **로그 라인 수 (서비스별)**: 시간별 로그 처리량
- **최근 로그**: 실시간 로그 스트림
- **LogQL 쿼리**: `{job="logs"}` 기본 쿼리

### 대시보드 기능
- 시간 범위: 최근 1시간
- 자동 새로고침: 5초
- 로그 레벨별 색상 구분
- 서비스별 그룹화

## 🚀 Docker Compose 예시

```yaml
services:
  grafana:
    image: grafana/grafana:10.0.0
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - ./provisioning:/etc/grafana/provisioning
      - ./dashboards:/var/lib/grafana/dashboards
      - ./data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    depends_on:
      - loki
```

## 🔧 환경변수

### 기본 설정
```bash
# 관리자 계정
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

# 보안 설정
GF_USERS_ALLOW_SIGN_UP=false
GF_SECURITY_DISABLE_GRAVATAR=true

# 서버 설정
GF_SERVER_DOMAIN=localhost
GF_SERVER_ROOT_URL=http://localhost:3000
```

### 데이터소스 설정
```bash
# Loki 연결
GF_DATASOURCES_DEFAULT_URL=http://loki:3100
GF_DATASOURCES_DEFAULT_TYPE=loki

# 대시보드 설정
GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/logs-overview.json
```

### 플러그인 설정
```bash
# 설치할 플러그인
GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel

# 플러그인 디렉토리
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=grafana-piechart-panel
```

## 📈 모니터링

### 접속 정보
- **URL**: http://localhost:3000
- **계정**: admin / admin (기본값)

### 주요 기능
1. **데이터소스 자동 등록**: Loki 데이터소스 자동 연결
2. **대시보드 자동 로드**: logs-overview 대시보드 자동 생성
3. **실시간 로그 스트림**: LogQL 쿼리로 실시간 로그 확인

### LogQL 쿼리 예시
```logql
# 모든 로그
{job="logs"}

# 에러 로그
{job="logs"} |= "error"

# 서비스별 로그
{service="api"}

# JSON 로그 파싱
{job="logs"} | json | level="ERROR"

# 메트릭 쿼리
sum(rate({job="logs"}[5m])) by (service)
```

## 🔍 문제 해결

### 일반적인 문제
1. **데이터소스 연결 실패**: Loki 서비스 상태 확인
2. **대시보드 로드 실패**: 파일 권한 및 경로 확인
3. **로그 표시 안됨**: LogQL 쿼리 문법 확인

### 디버깅
```bash
# Grafana 로그 확인
docker logs grafana

# 설정 파일 검증
curl http://localhost:3000/api/health

# 데이터소스 테스트
curl -u admin:admin http://localhost:3000/api/datasources
```

### 권한 설정
```bash
# 폴더 권한 설정
chmod -R 755 provisioning/
chmod -R 755 dashboards/
chmod -R 755 data/
```

## 🎨 커스터마이징

### 새로운 대시보드 추가
1. `dashboards/` 폴더에 JSON 파일 추가
2. Grafana에서 대시보드 내보내기
3. JSON 파일을 `dashboards/` 폴더에 저장

### 데이터소스 추가
1. `provisioning/datasources/` 폴더에 YAML 파일 추가
2. 필요한 데이터소스 설정 작성
3. Grafana 재시작

### 알림 설정
```yaml
# provisioning/alerting/
alerting:
  enabled: true
  contactpoints:
    - name: webhook
      type: webhook
      settings:
        url: http://webhook:8080/alert
```
