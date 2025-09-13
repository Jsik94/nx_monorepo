#!/bin/bash
# Kafka 토픽 초기화 스크립트

# Kafka 클러스터가 준비될 때까지 대기
echo "Kafka 클러스터 준비 대기 중..."
until kafka-topics.sh --bootstrap-server kafka:9092 --list >/dev/null 2>&1; do
    echo "Kafka 연결 대기 중... (5초 후 재시도)"
    sleep 5
done

echo "Kafka 클러스터가 준비되었습니다. 토픽 생성을 시작합니다."

# 로그 토픽 생성
echo "로그 토픽 생성 중..."
kafka-topics.sh --bootstrap-server kafka:9092 \
    --create \
    --topic logs \
    --partitions 3 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=604800000 \
    --if-not-exists

# 메트릭 토픽 생성 (선택사항)
echo "메트릭 토픽 생성 중..."
kafka-topics.sh --bootstrap-server kafka:9092 \
    --create \
    --topic metrics \
    --partitions 6 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=259200000 \
    --if-not-exists

# 트레이스 토픽 생성 (선택사항)
echo "트레이스 토픽 생성 중..."
kafka-topics.sh --bootstrap-server kafka:9092 \
    --create \
    --topic traces \
    --partitions 3 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=259200000 \
    --if-not-exists

echo "토픽 생성이 완료되었습니다."

# 생성된 토픽 목록 출력
echo "생성된 토픽 목록:"
kafka-topics.sh --bootstrap-server kafka:9092 --list

echo "토픽 상세 정보:"
for topic in logs metrics traces; do
    echo "=== $topic 토픽 정보 ==="
    kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic $topic
    echo ""
done
