#!/usr/bin/env bash
# 将 api/data 下旧 H2 文件库中的业务数据导入本机 MySQL 库 shuziyili，并删除 H2 文件。
# 用法（在 api/ 目录）：
#   MYSQL_PASSWORD=root123456 ./scripts/migrate-h2-to-mysql.sh
# 可选：MYSQL_USER（默认 root）、MYSQL_DATABASE（默认 shuziyili）、SKIP_FLYWAY=1（若你已跑过迁移）

set -euo pipefail

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
H2_DB_FILE="$API_DIR/data/shuziyili.mv.db"
WORK="$(mktemp -d)"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-root}"
MYSQL_DATABASE="${MYSQL_DATABASE:-shuziyili}"

cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

if [[ ! -f "$H2_DB_FILE" ]]; then
  echo "[migrate] 未找到 H2 库文件：$H2_DB_FILE（可能已清理过），退出。"
  exit 0
fi

echo "[migrate] 工作目录：$WORK"
cp "$H2_DB_FILE" "$WORK/h2copy.mv.db"

echo "[migrate] 下载 H2 JAR（若本地无）…"
mkdir -p "$API_DIR/target/h2-migrate"
(cd "$API_DIR" && ./mvnw -q dependency:copy -Dartifact=com.h2database:h2:2.1.214 -DoutputDirectory=target/h2-migrate -DstripVersion=false)
H2JAR=$(ls "$API_DIR"/target/h2-migrate/h2-*.jar | head -1)

CSV_DIR="$WORK/csv"
mkdir -p "$CSV_DIR"

export H2JAR
h2sql() {
  java -cp "$H2JAR" org.h2.tools.Shell -url "jdbc:h2:file:$WORK/h2copy;ACCESS_MODE_DATA=r" -user sa -password "" -sql "$1"
}

echo "[migrate] 从 H2 导出 CSV…"
h2sql "CALL CSVWRITE('$CSV_DIR/staff_users.csv', 'SELECT * FROM STAFF_USERS');" || true
h2sql "CALL CSVWRITE('$CSV_DIR/sessions.csv', 'SELECT TOKEN, IDENTIFIER, EXPIRES_AT, CREATED_AT FROM SESSIONS');" || true
h2sql "CALL CSVWRITE('$CSV_DIR/articles.csv', 'SELECT * FROM ARTICLES');" || true
h2sql "CALL CSVWRITE('$CSV_DIR/banners.csv', 'SELECT * FROM BANNERS');" || true

if [[ ! -f "$CSV_DIR/staff_users.csv" ]]; then
  echo "[migrate] H2 中无 STAFF_USERS 导出（可能表不存在），尝试 USERS 表…"
  h2sql "CALL CSVWRITE('$CSV_DIR/users_legacy.csv', 'SELECT * FROM USERS');" || true
fi

if [[ "${SKIP_FLYWAY:-0}" != "1" ]]; then
  echo "[migrate] 执行 Flyway（确保 MySQL 表结构最新）…"
  (cd "$API_DIR" && ./mvnw -q flyway:migrate \
    "-Dflyway.url=jdbc:mysql://127.0.0.1:3306/${MYSQL_DATABASE}?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false" \
    "-Dflyway.user=${MYSQL_USER}" \
    "-Dflyway.password=${MYSQL_PASSWORD}")
fi

SQL_FILE="$WORK/migrate.sql"
echo "[migrate] 生成 SQL…"
python3 "$API_DIR/scripts/migrate-h2-to-mysql.py" "$CSV_DIR" "$SQL_FILE"

echo "[migrate] 写入 MySQL ${MYSQL_DATABASE}…"
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" <"$SQL_FILE"

echo "[migrate] 删除 H2 数据文件（api/data 下 *.mv.db / *.lock.db / *.trace.db）…"
find "$API_DIR/data" -maxdepth 1 -type f \( -name "*.mv.db" -o -name "*.lock.db" -o -name "*.trace.db" \) -delete 2>/dev/null || true

echo "[migrate] 完成。请重启 API（若正在运行）。"
echo "[migrate] 说明：AUTO_INCREMENT 会从已有最大 id 继续；flyway_schema_history 未改动。"
