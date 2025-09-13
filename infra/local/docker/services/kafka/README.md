# Kafka 설정

Apache Kafka KRaft 모드 설정 및 토픽 관리입니다.

## 📁 폴더 구조

```
kafka/
├── kafka.env          # 환경변수 설정
├── init-topics.sh     # 토픽 초기화 스크립트
└── data/              # Kafka 데이터 볼륨 마운트
```

## 🔧 환경변수 (kafka.env)

### KRaft 설정
```bash
KAFKA_NODE_ID=1
KAFKA_PROCESS_ROLES=broker,controller
KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093
```

### 리스너 설정
```bash
KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
```

### 클러스터 설정
```bash
KAFKA_CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk
KAFKA_LOG_DIRS=/kafka/kafka-logs
```

### 토픽 설정
```bash
KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
KAFKA_NUM_PARTITIONS=3
KAFKA_DEFAULT_REPLICATION_FACTOR=1
```

### 로그 보존 설정
```bash
KAFKA_LOG_RETENTION_HOURS=168        # 7일
KAFKA_LOG_RETENTION_BYTES=1073741824 # 1GB
KAFKA_LOG_SEGMENT_BYTES=1073741824   # 1GB
```

### JVM 설정
```bash
KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
```

## 🚀 토픽 초기화 (init-topics.sh)

### 생성되는 토픽
1. **logs** (3 파티션)
   - 용도: 애플리케이션 로그
   - 보존기간: 7일
   - 정책: delete

2. **metrics** (6 파티션)
   - 용도: 메트릭 데이터
   - 보존기간: 3일
   - 정책: delete

3. **traces** (3 파티션)
   - 용도: 분산 추적 데이터
   - 보존기간: 3일
   - 정책: delete

### 스크립트 실행
```bash
# 실행 권한 부여
chmod +x init-topics.sh

# 스크립트 실행
./init-topics.sh
```

## 🐳 Docker Compose 예시

```yaml
services:
  kafka:
    image: apache/kafka:3.6.0
    container_name: kafka
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      - KAFKA_NODE_ID=1
      - KAFKA_PROCESS_ROLES=broker,controller
      - KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093
      - KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      - KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      - KAFKA_CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk
      - KAFKA_LOG_DIRS=/kafka/kafka-logs
      - KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
      - KAFKA_NUM_PARTITIONS=3
      - KAFKA_DEFAULT_REPLICATION_FACTOR=1
      - KAFKA_LOG_RETENTION_HOURS=168
      - KAFKA_LOG_RETENTION_BYTES=1073741824
      - KAFKA_LOG_SEGMENT_BYTES=1073741824
      - KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
    volumes:
      - ./data:/kafka/kafka-logs
      - ./kafka.env:/etc/kafka/kafka.env
    command: kafka-server-start.sh /etc/kafka/kafka.env

  kafka-init:
    image: apache/kafka:3.6.0
    depends_on:
      - kafka
    volumes:
      - ./init-topics.sh:/init-topics.sh
    command: /bin/bash -c "sleep 30 && /init-topics.sh"
```

## 📊 모니터링

### 토픽 확인
```bash
# 토픽 목록
kafka-topics.sh --bootstrap-server kafka:9092 --list

# 토픽 상세 정보
kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic logs

# 컨슈머 그룹 확인
kafka-consumer-groups.sh --bootstrap-server kafka:9092 --list
```

### 로그 확인
```bash
# Kafka 로그
docker logs kafka

# 토픽 메시지 확인
kafka-console-consumer.sh --bootstrap-server kafka:9092 --topic logs --from-beginning
```

## 🔍 문제 해결

### 일반적인 문제
1. **클러스터 ID 충돌**: `KAFKA_CLUSTER_ID` 변경
2. **포트 충돌**: 9092, 9093 포트 확인
3. **디스크 공간 부족**: `KAFKA_LOG_RETENTION_*` 설정 조정

### 성능 튜닝
- **배치 크기**: `batch.size=16384`
- **지연 시간**: `linger.ms=5`
- **압축**: `compression.type=lz4`
