# Loki 설정

Grafana Loki 단일/모놀리식 구성으로 로그 수집 및 저장을 담당합니다.

## 📁 폴더 구조

```
loki/
├── loki-config.yaml   # Loki 메인 설정 파일
└── data/              # 볼륨 마운트 (인덱스/청크 데이터)
```

## 🔧 설정 파일 (loki-config.yaml)

### 서버 설정
```yaml
server:
  http_listen_port: 3100
  grpc_listen_port: 9096
```

### 스토리지 설정
- **스키마**: v11 (2020-10-24부터)
- **스토어**: boltdb-shipper
- **오브젝트 스토어**: filesystem
- **인덱스 주기**: 24시간

### 경로 설정
```yaml
common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
```

### 제한 설정
```yaml
limits_config:
  ingestion_rate_mb: 64              # 수집 속도: 64MB/s
  ingestion_burst_size_mb: 128       # 버스트 크기: 128MB
  max_line_size: 256000              # 최대 라인 크기: 256KB
  max_streams_per_user: 10000        # 사용자당 최대 스트림: 10K
  max_entries_limit_per_query: 5000  # 쿼리당 최대 엔트리: 5K
```

### 보존 설정
```yaml
table_manager:
  retention_deletes_enabled: false   # 자동 삭제 비활성화
  retention_period: 0s               # 보존 기간 무제한
```

## 🚀 Docker Compose 예시

```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - ./data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    environment:
      - LOKI_CONFIG_FILE=/etc/loki/local-config.yaml
```

## 📊 API 엔드포인트

### 주요 엔드포인트
- **로그 푸시**: `POST /loki/api/v1/push`
- **로그 쿼리**: `GET /loki/api/v1/query`
- **로그 범위 쿼리**: `GET /loki/api/v1/query_range`
- **라벨 쿼리**: `GET /loki/api/v1/labels`
- **라벨 값 쿼리**: `GET /loki/api/v1/label/{name}/values`

### 헬스 체크
```bash
# 헬스 체크
curl http://localhost:3100/ready

# 메트릭
curl http://localhost:3100/metrics
```

## 🔍 쿼리 예시

### LogQL 쿼리
```logql
# 모든 로그
{job="logs"}

# 특정 서비스 로그
{service="api"}

# 에러 로그 필터링
{job="logs"} |= "error"

# JSON 로그 파싱
{job="logs"} | json | level="ERROR"

# 시간 범위 쿼리
{job="logs"} |= "error" | json | level="ERROR" [5m]
```

### 메트릭 쿼리
```logql
# 로그 라인 수
sum(rate({job="logs"}[5m]))

# 서비스별 로그 수
sum(rate({job="logs"}[5m])) by (service)

# 에러율
sum(rate({job="logs"} |= "error" [5m])) / sum(rate({job="logs"}[5m]))
```

## 📈 모니터링

### 주요 메트릭
- `loki_distributor_samples_received_total`: 수신된 샘플 수
- `loki_ingester_memory_chunks`: 메모리 청크 수
- `loki_querier_request_duration_seconds`: 쿼리 응답 시간
- `loki_storage_chunks_downloaded_total`: 다운로드된 청크 수

### 로그 확인
```bash
# Loki 로그
docker logs loki

# 설정 검증
loki -config.file=loki-config.yaml -dry-run
```

## 🔧 성능 튜닝

### 메모리 설정
```yaml
# JVM 힙 크기 (환경변수)
LOKI_HEAP_OPTS=-Xmx2G -Xms2G
```

### 배치 설정
```yaml
# 배치 크기 조정
batch_wait: 1s
batch_size: 1048576  # 1MB
```

### 압축 설정
```yaml
# 청크 압축
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1000000000  # 1GB
```

## 🔍 문제 해결

### 일반적인 문제
1. **디스크 공간 부족**: `data/` 폴더 용량 확인
2. **메모리 부족**: JVM 힙 크기 증가
3. **쿼리 타임아웃**: `max_entries_limit_per_query` 조정

### 디버깅
```bash
# 설정 파일 검증
loki -config.file=loki-config.yaml -print-config-stderr

# 로그 레벨 변경
LOKI_LOG_LEVEL=debug
```
