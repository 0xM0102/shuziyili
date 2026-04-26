# 数字伊犁上线指南（域名：shuziyili.com）

面向 **腾讯云 CVM**（或同类 Linux 服务器）。若机上已有 **mtt** 等项目：只 **新增** 本项目的目录、数据库、Nginx 站点，**不要改** mtt 原有配置。

约定域名（请先在 DNS 里配好，见步骤 2）：

| 用途 | 域名 |
|------|------|
| 门户（Next.js） | `https://shuziyili.com`（可与 `www` 二选一或做 301 跳转） |
| 管理后台（静态） | `https://admin.shuziyili.com` |
| API（推荐） | **同域** `https://shuziyili.com/api/v1/...`（Nginx `location /api/` 反代到本机 API 端口，免 `api.` 子域证书） |
| API（可选） | `https://api.shuziyili.com`（需单独 DNS、证书与 `server` 块） |

日常发版路径与排障见 **[`deploy/RUNBOOK.md`](./RUNBOOK.md)**。

对内只监听本机：**API 常用 `127.0.0.1:8080`（若被占用可改 8081）**、**门户 `127.0.0.1:3000`**，由 Nginx 对外提供 **443**。

---

## 使用腾讯云 OrcaTerm 登录

若你用 **OrcaTerm**（腾讯云网页终端）进服务器，和本机用 SSH 登录 **是同一类环境**：下面所有要在「服务器上执行」的命令，都 **在 OrcaTerm 里逐条敲或粘贴执行** 即可。

- **怎么打开**：控制台 → **云服务器 CVM** → 选中你的实例 → **登录** → 选 **OrcaTerm**（界面文案可能写作「标准登录」「WebShell」等，以控制台为准）。
- **粘贴**：常见是 **Ctrl+Shift+V**，或终端区域 **右键**；多行脚本建议仍 **拆成一条条执行**，方便看哪一步报错。
- **耗时命令**：`./mvnw package`、`npm run build` 可能跑几分钟，期间 **不要关浏览器标签页**，避免连接断开把构建打断。
- **传文件**：可用 OrcaTerm 自带的 **文件上传**（若有）；或在本机用 `scp` / `rsync` 传到服务器。小配置文件也可以直接在服务器上用 `nano` / `vim` 编辑。

以下步骤里写「在服务器上」时，**OrcaTerm 即算已登录服务器**。

---

## 步骤 1：确认服务器与权限

**建议先做下面「1.1 自检」**，看清系统版本、内存磁盘、端口是否冲突，再进入后续安装与部署。

### 1.1 部署前自检（在 OrcaTerm 里逐条执行）

```bash
# 系统与内核（判断是 Ubuntu / Debian / CentOS 等）
cat /etc/os-release
uname -a

# 当前用户与能否提权
whoami
sudo -n true 2>/dev/null && echo "sudo 可用" || echo "sudo 可能需密码，下面命令前自行加 sudo"

# 内存与磁盘（构建 Java/Node 建议内存 ≥ 2G，磁盘剩余 ≥ 10G）
free -h
df -h /

# 本机已监听端口（重点看 80、443、3000、8080、3306 是否已被占用）
sudo ss -tlnp | head -1
sudo ss -tlnp | grep -E ':80|:443|:3000|:8080|:3306' || echo "上述端口当前无监听（或未匹配到）"

# 常见软件是否已安装（未安装会提示 command not found）
command -v nginx && nginx -v
command -v java && java -version
command -v node && node -v
command -v mysql && mysql --version
command -v git && git --version
```

**怎么解读：**

| 检查项 | 说明 |
|--------|------|
| **8080 已被占用** | 多半是别的 Java/API；本项目可改 `SERVER_PORT`（如 8081）并同步改 Nginx `proxy_pass`。 |
| **3000 已被占用** | 需换门户端口或停掉占用进程，并改 Nginx 里门户的 `proxy_pass`。 |
| **80 / 443 已有 nginx** | 正常；说明机上已有 Web 服务（例如 mtt），你只需 **新增** `sites-enabled` 里的 `shuziyili` 配置，不要删原站点。 |
| **内存偏小** | `mvn package`、`npm run build` 可能很慢或 OOM，可考虑临时升配或在本地构建后只上传产物。 |

可选：看当前有哪些 Nginx 站点（路径因系统略有差异）：

```bash
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || ls -la /etc/nginx/conf.d/
```

### 1.2 你需要满足的条件

1. 有一台 Linux 服务器（Ubuntu 22.04 / CentOS 等均可），记下 **公网 IP**。
2. 已用 **OrcaTerm 或任意 SSH 客户端** 登录，且具备 **sudo**（或用 root）。

以下命令默认在服务器上执行；需要在你自己电脑上操作时，文中会单独说明。

---

## 步骤 2：解析域名（DNS）

在 **shuziyili.com** 的 DNS 管理里（腾讯云 DNSPod 或域名注册商）添加 **A 记录**（值填服务器公网 IP）：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `@` | A | 你的服务器 IP |
| `www` | A | 同上 |
| `admin` | A | 同上 |
| `api` | A | 同上（**若采用主站 `/api/` 反代，可不解析 `api` 子域**） |

保存后等几分钟到几小时生效。可用 `ping shuziyili.com` 看是否指向正确 IP。

---

## 步骤 3：安全组 / 防火墙

在 **腾讯云控制台 → 云服务器 → 安全组** 中，对这台机器放行：

- **22**（SSH）
- **80**（HTTP，证书申请或跳转 HTTPS 用）
- **443**（HTTPS）

**不要**对公网放行 **3000、8080、3306**（避免门户、API、数据库直接暴露）。

服务器内若开了 `ufw`：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable   # 若尚未启用
```

---

## 步骤 4：安装运行环境

以 **Ubuntu** 为例（其它发行版用对应包管理器即可）：

```bash
sudo apt update
sudo apt install -y openjdk-11-jre-headless nginx mysql-server git
```

安装 **Node.js 20 LTS**（建议用 [NodeSource](https://github.com/nodesource/distributions) 或 nvm，使 `node -v` 为 v20.x）。

验证：

```bash
java -version   # 11+
node -v
nginx -v
mysql --version
```

---

## 步骤 5：创建部署目录（与 mtt 隔离）

```bash
sudo mkdir -p /opt/shuziyili/{api,web,admin/dist,config,repo}
sudo chown -R $USER:$USER /opt/shuziyili
```

代码可放在 `/opt/shuziyili/repo`，构建产物分别拷到 `api`、`web`、`admin/dist`（下面步骤会写具体命令）。

---

## 步骤 6：MySQL 独立库（勿与 mtt 共用库名）

```bash
sudo mysql -u root
```

在 MySQL 里执行（**把密码改成强密码**）：

```sql
CREATE DATABASE shuziyili CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shuziyili'@'localhost' IDENTIFIED BY '这里改成强密码';
GRANT ALL PRIVILEGES ON shuziyili.* TO 'shuziyili'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 步骤 7：拉取代码

```bash
cd /opt/shuziyili/repo
git clone https://github.com/0xM0102/shuziyili.git .
# 或你实际使用的仓库地址；若在其它分支如 dev：git checkout dev
```

---

## 步骤 8：配置 API 环境变量

```bash
cp /opt/shuziyili/repo/deploy/env/api.env.example /opt/shuziyili/config/api.env
nano /opt/shuziyili/config/api.env   # 或用 vim
```

至少确认：

- `SPRING_DATASOURCE_PASSWORD` 与步骤 6 一致。
- `CORS_ALLOWED_ORIGINS` 已为（与仓库示例一致即可）：
  - `https://www.shuziyili.com,https://shuziyili.com,https://admin.shuziyili.com`

```bash
chmod 600 /opt/shuziyili/config/api.env
```

---

## 步骤 9：编译并安装 API

```bash
cd /opt/shuziyili/repo/api
./mvnw -DskipTests package
cp target/shuziyili-api.jar /opt/shuziyili/api/
```

注册 **systemd**（路径按你仓库里的示例调整）：

```bash
sudo cp /opt/shuziyili/repo/deploy/systemd/shuziyili-api.service.example /etc/systemd/system/shuziyili-api.service
sudo nano /etc/systemd/system/shuziyili-api.service
```

确认：

- `User` / `Group` 是否用 `www-data` 或你专用的 Linux 用户（该用户需能读 `api.env` 与 `shuziyili-api.jar`）。
- `WorkingDirectory=/opt/shuziyili/api`
- `ExecStart=... java -jar /opt/shuziyili/api/shuziyili-api.jar`
- `EnvironmentFile=/opt/shuziyili/config/api.env`

可选：让 Spring 只监听本机（若与文档一致可不加）：

在 `EnvironmentFile` 中增加一行：`SERVER_ADDRESS=127.0.0.1`  
（Spring Boot 2.x 常用 `server.address`，需在配置里支持；若未配置，仅靠防火墙不暴露 8080 也可。）

启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shuziyili-api
sudo systemctl status shuziyili-api
```

本机探活（此时还未配 HTTPS，可先测端口）：

```bash
curl -sS http://127.0.0.1:8080/actuator/health
```

应看到包含 `"status":"UP"` 的 JSON。

---

## 步骤 10：构建门户（Next.js）并配置环境变量

**运行目录只能是 `/opt/shuziyili/web`**（与 `deploy/systemd/shuziyili-web.service.example` 一致）。  
不要在 `systemd` 里把 `WorkingDirectory` 写成 `/opt/shuziyili/repo/web`，否则易与 `/opt/shuziyili/web` 形成两套 `.next`，发版看起来像「没更新」。

环境变量（**不要提交到 Git**），复制示例后编辑：

```bash
sudo mkdir -p /opt/shuziyili/web
sudo cp /opt/shuziyili/repo/deploy/env/web.env.example /opt/shuziyili/web/.env.production.local
sudo nano /opt/shuziyili/web/.env.production.local
```

同域反代时内容示例：

```env
NEXT_PUBLIC_SITE_URL=https://shuziyili.com
NEXT_PUBLIC_API_BASE_URL=https://shuziyili.com
```

推荐：**在本机构建后 rsync 到 `/opt/shuziyili/web/`**（服务器只保留运行目录，不依赖 git）。  
日常发布请直接使用 [`deploy/sync-web.sh`](./sync-web.sh)，详见 [`deploy/RUNBOOK.md`](./RUNBOOK.md) §3。

**注意**：`NEXT_PUBLIC_*` 在 **`npm run build` 时** 会打进产物；若改动了这两个变量，需要 **重新 `npm run build`** 再部署。

注册 systemd：

```bash
sudo cp /opt/shuziyili/repo/deploy/systemd/shuziyili-web.service.example /etc/systemd/system/shuziyili-web.service
sudo nano /etc/systemd/system/shuziyili-web.service
```

将 **`WorkingDirectory=/opt/shuziyili/web`**（不要用 `repo/web`），`User` 能读该目录。

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shuziyili-web
sudo systemctl status shuziyili-web
curl -sS -I http://127.0.0.1:3000 | head -3
```

---

## 步骤 11：构建管理后台（静态文件）

```bash
cd /opt/shuziyili/repo/admin
npm ci
# 与主站同域 /api/ 反代时（推荐）：
VITE_API_BASE_URL=https://shuziyili.com VITE_SITE_BASE_URL=https://shuziyili.com npm run build
rsync -a --delete dist/ /opt/shuziyili/admin/dist/
```

之后仅更新后台时，重复 `npm run build` + `rsync` 即可。

---

## 步骤 12：申请 SSL 证书（HTTPS）

任选其一：

**A. 腾讯云免费证书**  
在 SSL 证书控制台申请 `shuziyili.com` 及子域（或使用多域名证书），下载 **Nginx** 格式，上传到服务器例如：

- `/etc/nginx/ssl/shuziyili/fullchain.crt`
- `/etc/nginx/ssl/shuziyili/privkey.key`  
（路径自定，与下一步 Nginx 里一致即可。）

**B. Let’s Encrypt（certbot）**  
适合能自动续期的环境；需 80 端口可访问。

---

## 步骤 13：配置 Nginx

```bash
sudo cp /opt/shuziyili/repo/deploy/nginx/shuziyili.conf.example /etc/nginx/sites-available/shuziyili
sudo nano /etc/nginx/sites-available/shuziyili
```

1. 取消注释并填写 **`ssl_certificate`** / **`ssl_certificate_key`**（步骤 12 的路径）。
2. 确认 `server_name`、`root /opt/shuziyili/admin/dist` 与示例一致（已为 **shuziyili.com**）。
3. 若证书是 **单域名** 只签了 `www`，则 **admin / api** 的 `server` 块需各自证书或换 **多域名/泛域名** 证书。

启用站点：

```bash
sudo ln -sf /etc/nginx/sites-available/shuziyili /etc/nginx/sites-enabled/shuziyili
sudo nginx -t
sudo systemctl reload nginx
```

**与 mtt 共存**：mtt 的配置文件不要删；只要 **server_name 不冲突**，多个 `server` 可同时监听 443。

---

## 步骤 14：HTTP 跳转 HTTPS（建议）

在 `shuziyili` 配置最上方可增加仅监听 80 的 `server`，把  
`shuziyili.com`、`www`、`admin`、`api` 统一 **301** 到对应 `https://`（或只用 certbot 的写法）。  
改完后再次 `sudo nginx -t && sudo systemctl reload nginx`。

---

## 步骤 15：验收

在浏览器与命令行检查：

1. `curl -sS https://shuziyili.com/api/v1/health` → `ok: true`。
2. `https://shuziyili.com` → 门户打开；开发者工具里接口为 **`https://shuziyili.com/api/v1/...`**（同域），无 CORS 错误。
3. `https://admin.shuziyili.com` → 登录页能打开，登录后请求仍指向 **`VITE_API_BASE_URL`** 且成功。
4. 再打开 **mtt 原站点**，确认 **不受影响**。

---

## 以后更新版本（推荐流程）

优先采用“本地构建 + 上传产物”：

```bash
# Web（一键脚本；默认 SSH 见 deploy/ssh-target.env，当前 ubuntu@45.40.243.131）
cd /path/to/shuziyili
./deploy/sync-web.sh

# API（改后端时）
cd api && ./mvnw -DskipTests package
rsync -avz target/shuziyili-api.jar ubuntu@45.40.243.131:/opt/shuziyili/api/shuziyili-api.jar
ssh ubuntu@45.40.243.131 "sudo systemctl restart shuziyili-api"

# Admin（改后台时）
cd ../admin && npm ci && npm run build
rsync -avz --delete dist/ ubuntu@45.40.243.131:/opt/shuziyili/admin/dist/
ssh ubuntu@45.40.243.131 "sudo nginx -t && sudo systemctl reload nginx"
```

---

## 常见问题

- **8080 被占用**：`sudo ss -tlnp | grep 8080`；在 `api.env` 设 `SERVER_PORT=8081`，并把 Nginx 里 `proxy_pass` 改成 `8081`。
- **门户接口 404**：检查 `NEXT_PUBLIC_API_BASE_URL` 是否 **不含** `/api/v1`，且 API 已启动。
- **管理后台登录后全红 / CORS**：检查 `CORS_ALLOWED_ORIGINS` 是否包含 **`https://admin.shuziyili.com`**（含 `https`，无尾斜杠）。

更通用的架构说明仍见上文「与 mtt 隔离」表；本文件按 **shuziyili.com** 写死示例，便于一步步照做。
