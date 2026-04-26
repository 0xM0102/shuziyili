# 数字伊犁 · 生产运维总表（Runbook）

本文与 [`deploy/README.md`](./README.md) 配套：**README 偏首次装机**，**本文件偏日常发版、排障、目录约定**。服务器上的具体操作须由你在 SSH/OrcaTerm 中执行。

---

## 1. 服务器目录约定（权威）

| 路径 | 用途 | systemd / Nginx |
|------|------|-----------------|
| `/opt/shuziyili/web` | **门户 Next.js 运行目录**（含 `.next`、`package.json`、`.env.production.local`、`node_modules` 生产依赖） | `shuziyili-web` 的 `WorkingDirectory` **必须指向这里** |
| `/opt/shuziyili/admin/dist` | 管理后台静态文件 | `admin.shuziyili.com` 的 `root` |
| `/opt/shuziyili/api/shuziyili-api.jar` | API 可执行包 | `shuziyili-api` |
| `/opt/shuziyili/config/api.env` | API 环境变量（`chmod 600`） | `EnvironmentFile=` |
| `/opt/shuziyili/repo` | **可选**：服务器上留一份源码副本（与发版无必然关系）；勿与运行目录混用 | **不要**把 `WorkingDirectory` 长期设为 `repo/web`，否则易与 `/opt/shuziyili/web` 形成两套 `.next` |

**反模式（已踩坑）：**

- `WorkingDirectory=/opt/shuziyili/repo/web` 与实际上传/解压到的 `/opt/shuziyili/web` 混用 → 线上跑的不是你以为的那份构建。
- 只上传 `.next` 的一部分、缺少 `package.json` / 生产 `node_modules` → `next start` 异常。

---

## 2. 域名与 API 暴露方式（当前推荐）

- **门户**：`https://shuziyili.com`（及按需 `www`）。
- **管理后台**：`https://admin.shuziyili.com`。
- **API（推荐）**：浏览器请求 **`https://shuziyili.com/api/v1/...`**（主站 Nginx `location /api/` 反代到本机 `127.0.0.1:8081` 或你实际端口）。  
  - 这样 **主站证书**即可覆盖 API 路径，无需单独为 `api.` 子域签证书。  
  - 若仍使用 `https://api.shuziyili.com`，须 **DNS + 证书 + Nginx** 全套独立配置。

前端构建期变量须与上一致，见 [`deploy/env/web.env.example`](./env/web.env.example)、[`deploy/env/admin.build.env.example`](./env/admin.build.env.example)。

---

## 3. 发版与 Git（解耦）

- **Git** 只做本地/协作的**源码历史**，**不参与**默认发版；上线不靠服务器 `git pull`。  
- **发版** = **本机构建** → **上传产物** → **服务器端更新**（解压覆盖、`npm install` 同步依赖、**`systemctl restart`**，见 §3.0）。  
- **主流程命令写在 §3.0～3.2**；**§8** 为同一套命令的**速查副本**（方便复制），内容不替代 §3。

### 3.0 门户 Web（主流程：本机构建 → 上传 tgz → 服务器）

**本机**（在仓库根目录；生成 `deploy/shuziyili-web-dist-时间戳.tgz`，路径已 `.gitignore`）：

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh
```

脚本会校验 `web/.env.production.local` 里的 `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_API_BASE_URL`，并 `unset` 常见本机代理变量。

**服务器端更新**（把 tgz 传到如 `/tmp/`，文件名换成你实际上传的；在 **OrcaTerm / SSH** 里执行）：

发版包**不含** `node_modules`，服务器上必须用 **`npm install --omit=dev`** 按本次 `package-lock.json` 同步生产依赖，再重启进程，否则可能缺包或版本不一致。

```bash
sudo mkdir -p /opt/shuziyili/web
sudo tar xzf /tmp/shuziyili-web-dist-XXXXXXXX.tgz -C /opt/shuziyili/web
cd /opt/shuziyili/web && sudo npm install --omit=dev
sudo systemctl restart shuziyili-web
```

**（可选）发版后立刻验收**（仍在服务器上）：

```bash
sudo systemctl is-active shuziyili-web
curl -fsSI http://127.0.0.1:3000 | head -n 5
```

**说明：** 若你**非常确定**本次未改 `package.json` / `package-lock.json`、且线上 `node_modules` 已与 lock 一致，可临时省略 `npm install` 仅「解压 + `restart`」；拿不准时**建议保留**上面四步，与 `--push` 脚本在远端行为一致。

### 3.1 门户 `--push`（可选，与主流程二选一）

本机已对生产机 **`ssh-copy-id`**，且 [`deploy/ssh-target.env`](./ssh-target.env)（或 `deploy/deploy.local.env`）里 **`DEPLOY=user@IP`** 正确时：

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh --push
```

（等价于本机构建 + rsync + 远端 `npm install` + 重启 + 健康检查；仍与 Git 无关。）

### 3.2 Admin（静态）

**本机**：`cd admin && npm ci && npm run build`。将 **`dist/`** 内全部文件上传到 **`/opt/shuziyili/admin/dist/`**。

**服务器**：`sudo nginx -t && sudo systemctl reload nginx`（仅静态资源时一般**只需 reload**；若改过 Nginx 配置再按需调整）。

### 3.3 API（jar）

**本机**：`cd api && ./mvnw -DskipTests package`。将 **`target/shuziyili-api.jar`** 上传到 **`/opt/shuziyili/api/shuziyili-api.jar`**。

**服务器**（端口以 `SERVER_PORT` / `api.env` 为准，示例 **8081**）：`sudo systemctl restart shuziyili-api`；可选验收：`curl -fsS http://127.0.0.1:8081/api/v1/health`。

### 3.4 门户排障

| 现象 | 处理 |
|------|------|
| 发布后页面无数据 / 白屏 | 检查 `web/.env.production.local`；改后须重新 `./deploy/sync-web.sh` 再打 tgz 上传。 |
| `502 Bad Gateway` | `systemctl status shuziyili-web`；本机 `127.0.0.1:3000` 是否监听。 |
| `--push` 报 `Permission denied` | 改用 §3.0 打包上传；或配置免密 SSH 后再 `--push`。 |
| `Connection closed by 127.0.0.1 port 7890` | 本机代理劫持；脚本已 `unset` 常见变量，仍异常则检查 Shell 代理。 |

---

## 4. 从 `repo/web` 迁到官方 `/opt/shuziyili/web`（一次性）

若当前 `systemd` 仍指向 `repo/web`，按顺序做：

1. `sudo systemctl stop shuziyili-web`
2. `sudo mkdir -p /opt/shuziyili/web`
3. `sudo rsync -a /opt/shuziyili/repo/web/ /opt/shuziyili/web/`（或按 §3.0 上传产物覆盖）
4. `cd /opt/shuziyili/web && sudo npm install --omit=dev`
5. 编辑 `/etc/systemd/system/shuziyili-web.service`：`WorkingDirectory=/opt/shuziyili/web`
6. `sudo systemctl daemon-reload && sudo systemctl start shuziyili-web`
7. 验收通过后：`sudo rm -rf /opt/shuziyili/repo/web`（**勿**误删整个 `repo`，除非确认不再需要其中 api 源码等）

---

## 5. 验收清单（每次发版勾一遍）

```bash
curl -sS https://shuziyili.com/api/v1/health
curl -sS https://shuziyili.com/api/v1/travel/banners
curl -sS -I https://shuziyili.com/travel
curl -sS -I https://admin.shuziyili.com
systemctl is-active shuziyili-web shuziyili-api nginx
cat /opt/shuziyili/web/.next/BUILD_ID
```

---

## 6. 常见问题

| 现象 | 处理 |
|------|------|
| 门户像「没更新」 | 强刷；检查是否传错目录；静态页 `Cache-Control` 过长时收紧 HTML 缓存或刷 CDN |
| 接口 404 | 确认 Nginx `/api/` 反代端口与 API 监听一致；`NEXT_PUBLIC_API_BASE_URL` 为主域时路径为 `/api/v1` |
| admin 登录全红 | `api.env` 里 `CORS_ALLOWED_ORIGINS` 含 `https://admin.shuziyili.com` |
| 两套 `.next` BUILD_ID 不一致 | 统一 `WorkingDirectory` 与上传目标为 `/opt/shuziyili/web` |
| 后台接口返回 `forbidden` 以前显示成 `unauthorized` | 升级 API 后已统一为 `requireStaffPermission` 的真实 message；前端若写死判断需改为同时认 `unauthorized` 与 `forbidden` |

---

## 7. 安全提醒（与发版无关但必须做）

- `api.env`、各类 Secret：**chmod 600**，密钥泄露后在云平台轮换。
- SSH 失败登录增多：检查 `authorized_keys`、考虑 `fail2ban`、关闭密码登录（仅 key）。

---

## 8. 部署命令速查（与 §3 相同，便于复制）

路径 `/path/to/shuziyili` 换成本机仓库；服务器在 **OrcaTerm / 已登录会话** 执行。

### 8.1 门户 Web（本机构建 → 上传 tgz → 服务器）

**本机**

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh
```

**服务器**（与 §3.0 相同：解压 → **`npm install`** 服务端依赖 → **`restart`**）

```bash
sudo mkdir -p /opt/shuziyili/web
sudo tar xzf /tmp/shuziyili-web-dist-XXXXXXXX.tgz -C /opt/shuziyili/web
cd /opt/shuziyili/web && sudo npm install --omit=dev
sudo systemctl restart shuziyili-web
```

**（可选）** `sudo systemctl is-active shuziyili-web`；`curl -fsSI http://127.0.0.1:3000 | head -n 5`。

### 8.2 门户 Web（可选：`--push`）

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh --push
```

### 8.3 API（jar）

**本机**

```bash
cd /path/to/shuziyili/api
./mvnw -DskipTests package
```

将 **`target/shuziyili-api.jar`** 上传到服务器 **`/opt/shuziyili/api/shuziyili-api.jar`**。

**服务器**（端口以 `SERVER_PORT` / `api.env` 为准，示例 **8081**）

```bash
sudo systemctl restart shuziyili-api
curl -fsS http://127.0.0.1:8081/api/v1/health
```

### 8.4 Admin（静态）

**本机**

```bash
cd /path/to/shuziyili/admin
npm ci && npm run build
```

将 **`dist/`** 目录内全部文件上传到 **`/opt/shuziyili/admin/dist/`**。

**服务器**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

更细的首次装机步骤仍以 [`deploy/README.md`](./README.md) 为准。
