#!/usr/bin/env bash
# 复制为 run-dev-with-cos.sh（已在 .gitignore 中忽略）后可自行增加 export 环境变量。
set -euo pipefail
cd "$(dirname "$0")/.."
export SPRING_PROFILES_ACTIVE=dev,local
exec ./mvnw spring-boot:run
