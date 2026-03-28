#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[dev] 项目根目录：$ROOT"
echo "[dev] 说明：密钥不要写进仓库。COS 密钥可用两种方式提供："
echo "      A) 环境变量：SHUZIYILI_COS_SECRET_ID / SHUZIYILI_COS_SECRET_KEY"
echo "      B) 本机文件：api/src/main/resources/application-local.yml（已在 .gitignore）"
echo

echo "[dev] 1) 数据库：开发与生产均为 MySQL。可先：cd api && docker compose up -d"
echo "[dev] 2) 启动 API（Spring Boot，端口 8080）"
echo "   - 默认已加载 dev+local（见 application.yml profile group）；COS 等放 application-local.yml"
echo "   - 该脚本只负责输出启动命令，不会在后台保持进程"
echo

cat <<'EOF'
cd api
docker compose up -d
./mvnw spring-boot:run

# 另开一个终端启动管理后台：
cd admin
npm run dev

# （可选）另开一个终端启动门户前端：
cd web
npm run dev
EOF

