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

### 3.1 Web（Next.js）

```bash
cd web
npm ci
npm run build
```

上传到服务器 **`/opt/shuziyili/web/`**（示例，请改 IP/用户）：

```bash
rsync -avz --delete \
  .next/ package.json package-lock.json next.config.ts public/ .env.production.local \
  user@SERVER:/opt/shuziyili/web/
```

服务器：

```bash
cd /opt/shuziyili/web
npm install --omit=dev
sudo systemctl restart shuziyili-web
```

修改 **`NEXT_PUBLIC_*` 后必须重新 `npm run build`** 再上传。

### 3.2 Admin（Vue 静态）

```bash
cd admin
npm ci
npm run build
rsync -avz --delete dist/ user@SERVER:/opt/shuziyili/admin/dist/
```

服务器（权限与 Nginx）：

```bash
sudo chown -R root:root /opt/shuziyili/admin
sudo find /opt/shuziyili/admin -type d -exec chmod 755 {} \;
sudo find /opt/shuziyili/admin -type f -exec chmod 644 {} \;
sudo nginx -t && sudo systemctl reload nginx
```

### 3.3 API（Spring Boot）

```bash
cd api
./mvnw -DskipTests package
scp target/shuziyili-api.jar user@SERVER:/opt/shuziyili/api/
```

服务器：

```bash
sudo systemctl restart shuziyili-api
curl -sS http://127.0.0.1:8081/api/v1/health
```

端口以 `api.env` / `SERVER_PORT` 为准，Nginx `proxy_pass` 须一致。

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
