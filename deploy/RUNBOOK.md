# 数字伊犁 · 生产运维总表（Runbook）

本文与 [`deploy/README.md`](./README.md) 配套：**README 偏首次装机**，**本文件偏日常发版、排障、目录约定**。服务器上的具体操作须在 **OrcaTerm / SSH** 中执行。

**当前团队采用的唯一发版方式：本机构建 → `scp` 上传产物 → 服务器解压/安装依赖/重启。** 不靠服务器 `git pull`，暂不使用 `./deploy/sync-web.sh --push`（见文末注释块）。

---

## 1. 服务器目录约定（权威）

**生产 CVM**

| 项 | 值 |
|----|-----|
| 公网 IP | `45.40.243.131` |
| 上传（scp） | `root@45.40.243.131` |
| OrcaTerm | 腾讯云控制台 → CVM → 选中该实例 → 登录 |

| 路径 | 用途 | systemd / Nginx |
|------|------|-----------------|
| `/opt/shuziyili/web` | **门户 Next.js 运行目录**（含 `.next`、`package.json`、`.env.production.local`、`node_modules`） | `shuziyili-web` 的 `WorkingDirectory` **必须指向这里** |
| `/opt/shuziyili/admin/dist` | 管理后台静态文件 | `admin.shuziyili.com` 的 `root` |
| `/opt/shuziyili/api/shuziyili-api.jar` | API 可执行包 | `shuziyili-api` |
| `/opt/shuziyili/config/api.env` | API 环境变量（`chmod 600`） | `EnvironmentFile=` |

**反模式（已踩坑）：**

- `WorkingDirectory=/opt/shuziyili/repo/web` 与 `/opt/shuziyili/web` 混用 → 线上跑的不是上传的那份构建。
- 只上传 `.next`、缺少 `package.json` / `node_modules` → `next start` 异常。
- macOS 打的 tgz 解压时出现 `LIBARCHIVE.xattr.com.apple.provenance` 警告 → **可忽略**，不影响文件内容。

---

## 2. 域名与 API

- **门户**：`https://shuziyili.com`
- **管理后台**：`https://admin.shuziyili.com`
- **API**：`https://shuziyili.com/api/v1/...`（Nginx `location /api/` 反代本机 API 端口，常见 **8081**）

构建期变量见 [`deploy/env/web.env.example`](./env/web.env.example)、[`deploy/env/admin.build.env.example`](./env/admin.build.env.example)。

---

## 3. 日常发版（本机构建 → 上传 → 服务器）

> **Git 只做源码管理，不参与发版。**

### 3.0 门户 Web

**① 本机构建**（仓库根目录）：

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh
```

生成 `deploy/shuziyili-web-dist-时间戳.tgz`（已 `.gitignore`）。  
构建前确认 `web/.env.production.local` 含：

```env
NEXT_PUBLIC_SITE_URL=https://shuziyili.com
NEXT_PUBLIC_API_BASE_URL=https://shuziyili.com
```

**② 本机上传到服务器 `/tmp/`**：

```bash
latest="$(ls -t deploy/shuziyili-web-dist-*.tgz | head -n 1)"
scp "$latest" root@45.40.243.131:/tmp/
```

也可用 OrcaTerm **文件上传** 把 tgz 传到 `/tmp/`。

**③ 服务器解压、装依赖、重启**（`/tmp/` 下文件名换成实际上传的）：

```bash
sudo mkdir -p /opt/shuziyili/web
sudo tar xzf /tmp/shuziyili-web-dist-XXXXXXXX.tgz -C /opt/shuziyili/web
cd /opt/shuziyili/web && sudo env PATH="/usr/local/bin:$PATH" /usr/local/bin/npm install --omit=dev
sudo systemctl restart shuziyili-web
```

> **说明：** 发版包不含 `node_modules`；改了 `package.json`（如新增 `leaflet`）时必须跑 `npm install --omit=dev`。  
> **说明：** 本机 `sudo npm` 常因 PATH 找不到 node，故用 `env PATH="/usr/local/bin:$PATH"`（见 §3.4 排障）。

**④ 验收**（服务器）：

```bash
sudo systemctl is-active shuziyili-web
curl -fsSI http://127.0.0.1:3000 | head -n 5
cat /opt/shuziyili/web/.next/BUILD_ID
```

浏览器强刷：`https://shuziyili.com/…`

---

### 3.1 API（jar）

**① 本机构建：**

```bash
cd /path/to/shuziyili/api
./mvnw -DskipTests package
```

**② 本机上传：**

```bash
scp target/shuziyili-api.jar root@45.40.243.131:/opt/shuziyili/api/shuziyili-api.jar
```

**③ 服务器重启并验收**（端口以 `api.env` 的 `SERVER_PORT` 为准，示例 8081）：

```bash
sudo systemctl restart shuziyili-api
for i in $(seq 1 15); do curl -fsS http://127.0.0.1:8081/api/v1/health && break; sleep 1; done
```

`api.env` 须含完整 **`SPRING_DATASOURCE_URL`**，见 [`deploy/env/api.env.example`](./env/api.env.example)。Flyway 新迁移在重启时自动执行。

---

### 3.2 Admin（静态）

**① 本机构建：**

```bash
cd /path/to/shuziyili/admin
npm ci
VITE_API_BASE_URL=https://shuziyili.com VITE_SITE_BASE_URL=https://shuziyili.com npm run build
```

**② 本机上传** `dist/` 内全部文件到 `/opt/shuziyili/admin/dist/`（可用 `scp -r dist/* root@45.40.243.131:/opt/shuziyili/admin/dist/`）。

**③ 服务器：**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

### 3.3 发版排障

| 现象 | 处理 |
|------|------|
| 发布后页面无数据 / 白屏 | 检查 `web/.env.production.local`；改后须重新 `./deploy/sync-web.sh` 再上传。 |
| `502 Bad Gateway` | `systemctl status shuziyili-web`；`127.0.0.1:3000` 是否在监听。 |
| 门户像「没更新」 | 强刷；确认解压目标是 `/opt/shuziyili/web`；看 `BUILD_ID` 是否变化。 |
| 服务器 `sudo npm: command not found` | 使用：`sudo env PATH="/usr/local/bin:$PATH" /usr/local/bin/npm install --omit=dev` |
| `Connection closed by 127.0.0.1 port 7890`（本机） | 本机代理；脚本已 `unset` 常见变量，仍异常则检查 Shell 代理。 |
| API 刚重启 `Connection refused` | 冷启动约 **9～12 秒**；用 health 轮询，勿只 `sleep 8`。 |
| `news/headlines` 404、`health` 正常 | 上传含该模块的新 `shuziyili-api.jar` 并重启。 |
| 日志 `jdbcUrl, ${SPRING_DATASOURCE_URL}` | `api.env` 补全 `SPRING_DATASOURCE_URL=` 后重启。 |
| admin 登录 CORS 报错 | `CORS_ALLOWED_ORIGINS` 含 `https://admin.shuziyili.com` |

---

## 4. 验收清单（发版后可选勾一遍）

```bash
curl -sS https://shuziyili.com/api/v1/health
curl -sS -I https://shuziyili.com/travel/sayram-lake
curl -sS -I https://admin.shuziyili.com
systemctl is-active shuziyili-web shuziyili-api nginx
```

---

## 5. 安全提醒

- `api.env`、各类 Secret：**chmod 600**，泄露后在云平台轮换。
- 公网只开 **80/443**；**不要**对公网暴露 3000、8081、3306。

---

## 8. 命令速查（与 §3 相同，便于复制）

### 8.1 门户 Web

**本机**

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh
latest="$(ls -t deploy/shuziyili-web-dist-*.tgz | head -n 1)"
scp "$latest" root@45.40.243.131:/tmp/
```

**服务器**

```bash
sudo mkdir -p /opt/shuziyili/web
sudo tar xzf /tmp/shuziyili-web-dist-XXXXXXXX.tgz -C /opt/shuziyili/web
cd /opt/shuziyili/web && sudo env PATH="/usr/local/bin:$PATH" /usr/local/bin/npm install --omit=dev
sudo systemctl restart shuziyili-web
sudo systemctl is-active shuziyili-web
curl -fsSI http://127.0.0.1:3000 | head -n 5
```

### 8.2 API

**本机**

```bash
cd /path/to/shuziyili/api && ./mvnw -DskipTests package
scp target/shuziyili-api.jar root@45.40.243.131:/opt/shuziyili/api/shuziyili-api.jar
```

**服务器**

```bash
sudo systemctl restart shuziyili-api
curl -fsS http://127.0.0.1:8081/api/v1/health
```

### 8.3 Admin

**本机**

```bash
cd /path/to/shuziyili/admin
npm ci && VITE_API_BASE_URL=https://shuziyili.com VITE_SITE_BASE_URL=https://shuziyili.com npm run build
scp -r dist/* root@45.40.243.131:/opt/shuziyili/admin/dist/
```

**服务器**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

<!-- 以下为暂不使用的发版方式，保留备查

### `./deploy/sync-web.sh --push`（SSH 免密一键推送）

前提：本机 `ssh-copy-id root@45.40.243.131`，且 `deploy/ssh-target.env` 中 `DEPLOY=root@45.40.243.131`。

```bash
cd /path/to/shuziyili
./deploy/sync-web.sh --push
```

### 服务器 `git pull` 发版

不参与日常发版。`/opt/shuziyili/repo` 仅可选作源码对照，运行目录始终是 `/opt/shuziyili/web`。

### 从 `repo/web` 迁到 `/opt/shuziyili/web`（一次性）

若 systemd 曾指向 `repo/web`：停服务 → rsync 或按 §3.0 上传覆盖 → 改 `WorkingDirectory=/opt/shuziyili/web` → `daemon-reload` → 启动。

-->

更细的首次装机步骤见 [`deploy/README.md`](./README.md)。
