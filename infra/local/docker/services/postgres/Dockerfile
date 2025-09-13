FROM postgres:16-alpine

# 초기화 스크립트 복사
COPY docker/services/postgres/init.sql /docker-entrypoint-initdb.d/
COPY docker/services/postgres/init/ /docker-entrypoint-initdb.d/

# 포트 노출
EXPOSE 5432

# PostgreSQL 서버 실행
CMD ["postgres"]
