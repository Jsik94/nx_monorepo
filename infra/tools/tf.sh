#!/bin/bash
# terraform remote state backend.tf 생성용 스크립트
# https://vntg.atlassian.net/wiki/spaces/RND/pages/edit-v2/1605271685

# Git 레포지토리의 루트 디렉토리부터 현재 작업 디렉토리까지의 상대 경로를 가져옵니다.
# 예시: infra/apps/sample/dev
# sed 명령어를 사용하여 전체 경로($PWD)에서 Git 루트 경로 부분을 제거합니다.
REL_PATH=$(echo $PWD | sed "s|$(git rev-parse --show-toplevel)/||")

# backend.tf 파일을 생성할 것임을 알리고, 사용될 prefix 값을 출력합니다.
echo "==> Generating backend.tf with prefix: ${REL_PATH}"

# cat과 Heredoc(EOF)을 사용하여 backend.tf 파일을 생성합니다.
# 파일 내용 중 ${REL_PATH} 부분은 위에서 계산된 변수 값으로 자동 치환됩니다.
cat << EOF > backend.tf
terraform {
  backend "gcs" {
    bucket = "infra-common-dev-gcp-terraform-remote-backend"
    prefix = "${REL_PATH}"
  }
}
EOF

# 파일 생성이 완료되었음을 알립니다.
echo "==> backend.tf has been created successfully."
