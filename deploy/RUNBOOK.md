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
| `/opt/shuziyili/repo` | **可选**：Git 源码副本，用于 `git pull` 或参考 | **不要**把 `WorkingDirectory` 长期设为 `repo/web`，否则易与 `/opt/shuziyili/web` 形成两套 `.next` |

**反模式（已踩坑）：**

- `WorkingDirectory=/opt/shuziyili/repo/web` 与 `rsync` 到 `/opt/shuziyili/web` 混用 → 线上跑的不是你以为的那份构建。
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

## 3. 本机发版（推荐：构建在本地，上传产物）

### 3.0 Web 一键发版（推荐）

仓库已提供脚本：[`deploy/sync-web.sh`](./sync-web.sh)。

```bash
cd /path/to/shuziyili
chmod +x deploy/sync-web.sh
./deploy/sync-web.sh
```

默认 SSH 目标见仓库内 [`deploy/ssh-target.env`](./ssh-target.env)（当前约定 `ubuntu@45.40.243.131`）。本机若要覆盖，可复制 [`deploy/deploy.local.env.example`](./deploy.local.env.example) 为 `deploy/deploy.local.env`（已 gitignore）。临时一次发版仍可用 `DEPLOY=user@host ./deploy/sync-web.sh`。

#### 本机 SSH 公钥（发版前一次性）

脚本在 **`npm ci` 之前**会检查能否 **免密** `ssh` 到目标机；`rsync`/`ssh` 在非交互下无法用密码完成。

在本机终端执行（把用户与 IP 换成你的 `DEPLOY`，默认即 `ubuntu@45.40.243.131`）：

```bash
ssh-copy-id ubuntu@45.40.243.131
```

成功后应能 **`ssh ubuntu@45.40.243.131`** 直接进入、不再要密码。若服务器禁用了密码、只能由运维手工写入公钥，请把你的 **`~/.ssh/id_ed25519.pub`** 或 **`id_rsa.pub`** 内容追加到服务器 **`~/.ssh/authorized_keys`**（注意权限 `chmod 600 ~/.ssh/authorized_keys`）。

**`ssh-copy-id` 一直提示密码错误**：多半是 **SSH 用户名与腾讯云控制台不一致**（例如机器实际是 **`root`** 登录，而仓库写的是 `ubuntu`）。请在控制台确认「登录名」，并修改 [`deploy/ssh-target.env`](./ssh-target.env) 的 `DEPLOY=` 后再执行 `ssh-copy-id`。若服务器 **`PasswordAuthentication no`**，则无法靠密码装公钥，只能在已能登录的渠道里手工写入 `authorized_keys`。

#### 不用 SSH/rsync：本机打包 + 控制台上传（与「HTTPS 传文件」同类）

若你习惯用 **腾讯云 OrcaTerm 上传文件**、或没有可用的 SSH 密码：

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh --pack-only
```

会在本机生成 **`deploy/shuziyili-web-dist-时间戳.tgz`**（已 `.gitignore`）。把该文件通过控制台上传到服务器（如 `/tmp/`），再在 **OrcaTerm / SSH 已能登录的会话里**执行：

```bash
sudo mkdir -p /opt/shuziyili/web
sudo tar xzf /tmp/shuziyili-web-dist-XXXXXXXX.tgz -C /opt/shuziyili/web
cd /opt/shuziyili/web && sudo npm install --omit=dev
sudo systemctl restart shuziyili-web
```

将 `/tmp/` 与文件名换成你实际上传的路径。`git clone https://...` 只解决**拿代码**，不会替代把 **`.next` 构建产物** 放到服务器；上述 tgz 才是与 `rsync` 等价的产物投递方式。

脚本内置以下保护：

- 自动 `unset ALL_PROXY/HTTP_PROXY/HTTPS_PROXY`，避免被本地代理劫持；
- 强校验 `web/.env.production.local` 非空，且必须包含 `NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_API_BASE_URL`；
- 固定执行 `npm ci && npm run build`；
- 固定用正确 rsync 形态上传（`.next` 不用尾斜杠）；
- 远端自动 `npm install --omit=dev` + `systemctl restart shuziyili-web`；
- 自动执行远端与公网健康检查，任一步失败立即退出。

### 3.1 常见错误与处理

| 现象 | 常见原因 / 处理 |
|------|------------------|
| `hostname contains invalid characters` | `DEPLOY` 不是纯 ASCII 的 `user@host`（含中文、空格、未替换占位符） |
| `Connection closed by 127.0.0.1 port 7890` | 本地代理劫持 SSH；使用脚本（已自动 `unset`）或手动取消代理 |
| 发布后页面无数据 | `web/.env.production.local` 为空或内容错误；脚本会在构建前拦截 |
| `502 Bad Gateway` | `shuziyili-web` 未成功启动；先看 `systemctl status shuziyili-web` 和端口 `127.0.0.1:3000` |
| `Permission denied (publickey,...)` | 未配置公钥或 `DEPLOY` 用户错误；见上节。密码总错先试 **`ssh-copy-id root@IP`** 等与控制台一致的账号。 |
| 不想用 SSH 发门户 | 使用 `./deploy/sync-web.sh --pack-only` 再打 tgz 上传，见上节「控制台发版」。 |

### 3.2 Admin 发版（静态）

```bash
cd admin
npm ci
npm run build
rsync -avz --delete dist/ ubuntu@45.40.243.131:/opt/shuziyili/admin/dist/
```

必要时修权限并重载 Nginx：

```bash
ssh ubuntu@45.40.243.131
sudo chown -R root:root /opt/shuziyili/admin
sudo find /opt/shuziyili/admin -type d -exec chmod 755 {} \;
sudo find /opt/shuziyili/admin -type f -exec chmod 644 {} \;
sudo nginx -t && sudo systemctl reload nginx
```

### 3.3 API 发版（jar）

```bash
cd api
./mvnw -DskipTests package
rsync -avz target/shuziyili-api.jar ubuntu@45.40.243.131:/opt/shuziyili/api/shuziyili-api.jar
ssh ubuntu@45.40.243.131 "sudo systemctl restart shuziyili-api && curl -fsS http://127.0.0.1:8081/api/v1/health"
```

端口以 `api.env` / `SERVER_PORT` 为准，Nginx `proxy_pass` 必须一致。

---

## 4. 从 `repo/web` 迁到官方 `/opt/shuziyili/web`（一次性）

若当前 `systemd` 仍指向 `repo/web`，按顺序做：

1. `sudo systemctl stop shuziyili-web`
2. `sudo mkdir -p /opt/shuziyili/web`
3. `sudo rsync -a /opt/shuziyili/repo/web/ /opt/shuziyili/web/`（或按 §3 从本机 rsync 覆盖）
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
| 两套 `.next` BUILD_ID 不一致 | 统一 `WorkingDirectory` 与 rsync 目标为 `/opt/shuziyili/web` |
| 后台接口返回 `forbidden` 以前显示成 `unauthorized` | 升级 API 后已统一为 `requireStaffPermission` 的真实 message；前端若写死判断需改为同时认 `unauthorized` 与 `forbidden` |

---

## 7. 安全提醒（与发版无关但必须做）

- `api.env`、各类 Secret：**chmod 600**，密钥泄露后在云平台轮换。
- SSH 失败登录增多：检查 `authorized_keys`、考虑 `fail2ban`、关闭密码登录（仅 key）。

更细的首次装机步骤仍以 [`deploy/README.md`](./README.md) 为准。
