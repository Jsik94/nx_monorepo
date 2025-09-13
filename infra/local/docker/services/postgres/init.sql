-- PostgreSQL 기본 초기화 스크립트
-- Prisma에서 모든 스키마와 데이터를 관리합니다

-- 기본 권한 설정
GRANT ALL PRIVILEGES ON DATABASE rnd_nx_dev TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
