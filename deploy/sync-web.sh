#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
WEB_DIR="${REPO_ROOT}/web"

# 默认 SSH 见 deploy/ssh-target.env；可选 deploy/deploy.local.env 覆盖；命令行 DEPLOY= 仍优先。
CLI_DEPLOY="${DEPLOY:-}"
if [[ -f "${SCRIPT_DIR}/deploy.local.env" ]]; then
  set -a
  # shellcheck disable=1090
  source "${SCRIPT_DIR}/deploy.local.env"
  set +a
elif [[ -f "${SCRIPT_DIR}/ssh-target.env" ]]; then
  set -a
  # shellcheck disable=1090
  source "${SCRIPT_DIR}/ssh-target.env"
  set +a
fi
if [[ -n "${CLI_DEPLOY}" ]]; then
  DEPLOY="${CLI_DEPLOY}"
fi

TARGET="${DEPLOY:-}"
SITE_URL="${SITE_URL:-https://shuziyili.com}"
WEB_REMOTE_DIR="${WEB_REMOTE_DIR:-/opt/shuziyili/web}"
WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-shuziyili-web}"
API_SERVICE_NAME="${API_SERVICE_NAME:-shuziyili-api}"
WEB_LOCAL_PORT="${WEB_LOCAL_PORT:-3000}"
API_LOCAL_PORT="${API_LOCAL_PORT:-8081}"

usage() {
  cat <<'EOF'
用法：
  ./deploy/sync-web.sh
  DEPLOY=user@host ./deploy/sync-web.sh   # 临时覆盖默认目标（见 deploy/ssh-target.env）

可选环境变量：
  SITE_URL                   验收域名（默认 https://shuziyili.com）
  WEB_REMOTE_DIR             远端 web 目录（默认 /opt/shuziyili/web）
  WEB_SERVICE_NAME           远端 web systemd 名称（默认 shuziyili-web）
  API_SERVICE_NAME           远端 api systemd 名称（默认 shuziyili-api）
  WEB_LOCAL_PORT             远端 web 本地监听端口（默认 3000）
  API_LOCAL_PORT             远端 api 本地监听端口（默认 8081）
  SYNC_WEB_SKIP_SSH_CHECK=1 跳过「免密 SSH」预检（不推荐；仅密码登录时可临时用）

发版前须能免密 ssh 到目标机（见 deploy/ssh-target.env 中的 DEPLOY）。首次请执行：ssh-copy-id <同上 user@host>
EOF
}

log() {
  printf '\n[%s] %s\n' "$(date '+%F %T')" "$*"
}

die() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令：$1"
}

validate_target() {
  [[ -n "${TARGET}" ]] || die "未得到 SSH 目标：请设置 DEPLOY=user@host，或配置 deploy/ssh-target.env / deploy/deploy.local.env"
  [[ "${TARGET}" =~ ^[A-Za-z0-9._-]+@[A-Za-z0-9._:-]+$ ]] || die "DEPLOY 格式非法：${TARGET}"
}

precheck_ssh() {
  if [[ "${SYNC_WEB_SKIP_SSH_CHECK:-0}" == "1" ]]; then
    log "已跳过 SSH 预检（SYNC_WEB_SKIP_SSH_CHECK=1）"
    return 0
  fi
  log "检查免密 SSH：${TARGET}"
  if ssh -o BatchMode=yes -o ConnectTimeout=12 -o StrictHostKeyChecking=accept-new "${TARGET}" "echo ok" >/dev/null 2>&1; then
    return 0
  fi
  die "无法免密 SSH 到 ${TARGET}。请在本机执行一次：ssh-copy-id ${TARGET}
若登录用户不是 ubuntu，先改 deploy/ssh-target.env（或 deploy/deploy.local.env）里的 DEPLOY=。
若服务器仅允许密码、暂不能配公钥，可：SYNC_WEB_SKIP_SSH_CHECK=1 ./deploy/sync-web.sh（rsync 仍会提示输密码）。"
}

validate_web_env() {
  local env_file="${WEB_DIR}/.env.production.local"
  local site_url
  local api_base_url
  [[ -f "${env_file}" ]] || die "缺少文件：${env_file}"
  [[ -s "${env_file}" ]] || die "${env_file} 为空，已终止"

  grep -qE '^NEXT_PUBLIC_SITE_URL=' "${env_file}" || die "缺少 NEXT_PUBLIC_SITE_URL"
  grep -qE '^NEXT_PUBLIC_API_BASE_URL=' "${env_file}" || die "缺少 NEXT_PUBLIC_API_BASE_URL"

  site_url="$(sed -n 's/^NEXT_PUBLIC_SITE_URL=//p' "${env_file}" | tail -n 1 | tr -d '[:space:]')"
  api_base_url="$(sed -n 's/^NEXT_PUBLIC_API_BASE_URL=//p' "${env_file}" | tail -n 1 | tr -d '[:space:]')"

  [[ -n "${site_url}" ]] || die "NEXT_PUBLIC_SITE_URL 不能为空"
  [[ -n "${api_base_url}" ]] || die "NEXT_PUBLIC_API_BASE_URL 不能为空"
}

build_web() {
  log "检查并构建 web"
  cd "${WEB_DIR}"
  npm ci
  npm run build
  [[ -d ".next" ]] || die "构建后未生成 .next 目录"
}

sync_web_files() {
  log "rsync 上传 web 产物"
  cd "${WEB_DIR}"
  rsync -avz --delete \
    ".next" "package.json" "package-lock.json" "next.config.ts" "public" ".env.production.local" \
    "${TARGET}:${WEB_REMOTE_DIR}/"
}

restart_remote_services() {
  log "远端安装依赖并重启服务"
  ssh "${TARGET}" "set -euo pipefail; \
    cd '${WEB_REMOTE_DIR}'; \
    npm install --omit=dev; \
    sudo systemctl restart '${WEB_SERVICE_NAME}'; \
    sudo systemctl is-active '${WEB_SERVICE_NAME}' '${API_SERVICE_NAME}' nginx >/dev/null"
}

verify_remote() {
  log "远端健康检查"
  ssh "${TARGET}" "set -euo pipefail; \
    curl -fsS 'http://127.0.0.1:${WEB_LOCAL_PORT}' >/dev/null; \
    curl -fsS 'http://127.0.0.1:${API_LOCAL_PORT}/api/v1/health' >/dev/null; \
    test -s '${WEB_REMOTE_DIR}/.env.production.local'"
}

verify_public() {
  log "公网验收"
  curl -fsS "${SITE_URL}/api/v1/health" >/dev/null
  curl -fsS "${SITE_URL}/api/v1/travel/banners" >/dev/null
}

main() {
  [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && {
    usage
    exit 0
  }

  require_cmd npm
  require_cmd rsync
  require_cmd ssh
  require_cmd curl
  require_cmd grep

  validate_target
  precheck_ssh

  log "临时关闭代理环境变量"
  unset ALL_PROXY HTTP_PROXY HTTPS_PROXY all_proxy http_proxy https_proxy

  validate_web_env
  build_web
  sync_web_files
  restart_remote_services
  verify_remote
  verify_public

  log "web 部署完成：${SITE_URL}"
}

main "$@"
