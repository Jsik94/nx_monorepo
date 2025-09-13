# Alloy 설정

Grafana Alloy를 사용한 로그 수집 및 전처리 파이프라인입니다.

## 📁 폴더 구조

```
alloy/
├── producer/           # 로그 수집 및 Kafka 전송
│   ├── config.alloy   # 메인 설정 파일
│   └── pipelines/     # 파이프라인 분리 파일들 (선택사항)
└── consumer/          # Kafka 소비 및 Loki 전송
    ├── config.alloy   # 메인 설정 파일
    └── pipelines/     # 파이프라인 분리 파일들 (선택사항)
```

## 🔧 Producer 설정 (config.alloy)

### 주요 기능
- 로그 파일 스크래핑 (`/var/log/*.log`, `/app/logs/*.log`)
- JSON 파싱 및 라벨링
- Kafka로 로그 전송

### 환경변수
```bash
# Kafka 연결 정보
KAFKA_BROKERS=kafka:9092
KAFKA_TOPIC=logs

# 로그 파일 경로
LOG_PATHS=/var/log/*.log,/app/logs/*.log
```

### 설정된 라벨
- `level`: 로그 레벨
- `service`: 서비스명
- `timestamp`: 타임스탬프
- `message`: 로그 메시지

## 🔧 Consumer 설정 (config.alloy)

### 주요 기능
- Kafka에서 로그 소비
- 로그 포맷팅 및 메트릭 추출
- Loki로 로그 전송

### 환경변수
```bash
# Kafka 연결 정보
KAFKA_BROKERS=kafka:9092
KAFKA_TOPIC=logs
KAFKA_CONSUMER_GROUP=loki-consumer-group

# Loki 연결 정보
LOKI_ENDPOINT=http://loki:3100/loki/api/v1/push
```

### 배치 설정
- `batch_wait`: 1초
- `batch_size`: 1MB
- `max_retries`: 5회

## 🚀 실행 방법

### Docker Compose 예시
```yaml
services:
  alloy-producer:
    image: grafana/alloy:latest
    volumes:
      - ./producer/config.alloy:/etc/alloy/config.alloy
      - /var/log:/var/log:ro
    command: run --config.file=/etc/alloy/config.alloy

  alloy-consumer:
    image: grafana/alloy:latest
    volumes:
      - ./consumer/config.alloy:/etc/alloy/config.alloy
    command: run --config.file=/etc/alloy/config.alloy
    depends_on:
      - kafka
      - loki
```

## 📊 모니터링

### 메트릭
- `alloy_log_lines_total`: 처리된 로그 라인 수
- `alloy_kafka_producer_records_sent_total`: Kafka 전송 레코드 수
- `alloy_loki_writes_total`: Loki 쓰기 요청 수

### 로그 레벨
- `info`: 일반 정보
- `debug`: 디버그 정보
- `warn`: 경고
- `error`: 오류

## 🔍 문제 해결

### 일반적인 문제
1. **Kafka 연결 실패**: `KAFKA_BROKERS` 환경변수 확인
2. **Loki 쓰기 실패**: `LOKI_ENDPOINT` URL 확인
3. **로그 파일 접근 불가**: 볼륨 마운트 권한 확인

### 로그 확인
```bash
# Alloy 로그 확인
docker logs alloy-producer
docker logs alloy-consumer

# 설정 검증
alloy run --config.file=config.alloy --dry-run
```
