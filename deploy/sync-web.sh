#!/usr/bin/env bash
# 门户发版：默认「本机构建 + 打 tgz」，上传由你在腾讯云控制台 / OrcaTerm 完成。
# 可选「--push」：免密 SSH + rsync + 远端重启（需 deploy/ssh-target.env 或 deploy.local.env）。
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
WEB_DIR="${REPO_ROOT}/web"

SITE_URL="${SITE_URL:-https://shuziyili.com}"
WEB_REMOTE_DIR="${WEB_REMOTE_DIR:-/opt/shuziyili/web}"
WEB_SERVICE_NAME="${WEB_SERVICE_NAME:-shuziyili-web}"
API_SERVICE_NAME="${API_SERVICE_NAME:-shuziyili-api}"
WEB_LOCAL_PORT="${WEB_LOCAL_PORT:-3000}"
API_LOCAL_PORT="${API_LOCAL_PORT:-8081}"

TARGET=""

usage() {
  cat <<'EOF'
门户 Web 发版脚本（deploy/sync-web.sh）

  ./deploy/sync-web.sh              默认：本机 npm ci + build，生成 deploy/shuziyili-web-dist-*.tgz，自行上传服务器
  ./deploy/sync-web.sh --pack-only  同上（显式别名）
  ./deploy/sync-web.sh --push       可选：免密 SSH + rsync 到服务器并重启（需 deploy/ssh-target.env 等）

环境变量（仅 --push 会用到 DEPLOY；默认打包模式不需要）：
  DEPLOY=user@host           覆盖 ssh 目标（优先于 deploy/deploy.local.env、deploy/ssh-target.env）
  SITE_URL                   公网验收域名（默认 https://shuziyili.com）
  WEB_REMOTE_DIR             远端 web 目录（默认 /opt/shuziyili/web）
  WEB_SERVICE_NAME / API_SERVICE_NAME / WEB_LOCAL_PORT / API_LOCAL_PORT  见脚本内默认值
  SYNC_WEB_SKIP_SSH_CHECK=1  --push 时跳过免密 SSH 预检（不推荐）

服务器解压与重启步骤见 deploy/RUNBOOK.md §3「门户 Web」。
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

load_push_target() {
  local cli_deploy="${DEPLOY:-}"
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
  if [[ -n "${cli_deploy}" ]]; then
    DEPLOY="${cli_deploy}"
  fi
  TARGET="${DEPLOY:-}"
}

validate_target() {
  [[ -n "${TARGET}" ]] || die "未得到 SSH 目标：请设置 DEPLOY=user@host，或配置 deploy/ssh-target.env / deploy/deploy.local.env（仅 --push 需要）"
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
  die "无法免密 SSH 到 ${TARGET}。请改用默认方式：./deploy/sync-web.sh（只打 tgz，再控制台上传），见 deploy/RUNBOOK.md。
若坚持使用 --push：配置 ssh-copy-id 或改 deploy/ssh-target.env 中的用户；或 SYNC_WEB_SKIP_SSH_CHECK=1（rsync 会交互要密码）。"
}

validate_web_env() {
  local env_file="${WEB_DIR}/.env.production.local"
  [[ -f "${env_file}" ]] || die "缺少文件：${env_file}"
  [[ -s "${env_file}" ]] || die "${env_file} 为空，已终止"

  grep -qE '^NEXT_PUBLIC_SITE_URL=' "${env_file}" || die "缺少 NEXT_PUBLIC_SITE_URL"
  grep -qE '^NEXT_PUBLIC_API_BASE_URL=' "${env_file}" || die "缺少 NEXT_PUBLIC_API_BASE_URL"

  local site_url api_base_url
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

pack_web_dist() {
  local out="${SCRIPT_DIR}/shuziyili-web-dist-$(date +%Y%m%d-%H%M%S).tgz"
  log "打包 web 产物：${out}"
  cd "${WEB_DIR}"
  tar czf "${out}" \
    .next package.json package-lock.json next.config.ts public .env.production.local
  printf '\n已生成发版包。请将 tgz 上传到服务器后，按 deploy/RUNBOOK.md §3「门户 Web」解压到 %s 并执行 npm install 与 systemctl restart。\n' "${WEB_REMOTE_DIR}"
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

main_pack() {
  require_cmd npm
  require_cmd grep
  require_cmd tar

  log "临时关闭代理环境变量"
  unset ALL_PROXY HTTP_PROXY HTTPS_PROXY all_proxy http_proxy https_proxy

  validate_web_env
  build_web
  pack_web_dist
  log "本机构建 + 打包完成（默认发版方式）。"
}

main_push() {
  load_push_target
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

  log "web --push 完成：${SITE_URL}"
}

main() {
  case "${1:-}" in
    -h | --help)
      usage
      exit 0
      ;;
    --push)
      main_push
      ;;
    "" | --pack-only)
      main_pack
      ;;
    *)
      die "未知参数：${1}。使用 --help 查看用法。"
      ;;
  esac
}

main "$@"
