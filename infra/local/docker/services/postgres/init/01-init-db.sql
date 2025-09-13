-- PostgreSQL 기본 권한 설정
-- Prisma가 모든 스키마와 테이블을 관리합니다

-- 기본 권한 설정
GRANT ALL PRIVILEGES ON DATABASE rnd_nx_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
