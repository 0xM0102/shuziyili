#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[dev] 项目根目录：$ROOT"
echo "[dev] 说明：密钥不要写进仓库。COS 密钥可用两种方式提供："
echo "      A) 环境变量：SHUZIYILI_COS_SECRET_ID / SHUZIYILI_COS_SECRET_KEY"
echo "      B) 本机文件：api/src/main/resources/application-local.yml（已在 .gitignore）"
echo

echo "[dev] 1) 启动 API（Spring Boot，端口 8080）"
echo "   - 若你使用 application-local.yml，请确保启用 dev,local profile"
echo "   - 该脚本只负责输出启动命令，不会在后台保持进程"
echo

cat <<'EOF'
cd api
# 若你已在 application-local.yml 配置 COS 密钥：
export SPRING_PROFILES_ACTIVE=dev,local
./mvnw spring-boot:run

# 另开一个终端启动管理后台：
cd admin
npm run dev

# （可选）另开一个终端启动门户前端：
cd web
npm run dev
EOF

