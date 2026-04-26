# 数字伊犁（shuziyili）

民间便民门户：**前端**与**后端 API** 分目录存放、**可分开部署**；域名生产环境为 **https://shuziyili.com**。

生产发版与服务器目录约定见 **[`deploy/RUNBOOK.md`](./deploy/RUNBOOK.md)**；首次装机步骤见 **[`deploy/README.md`](./deploy/README.md)**。  
**发版与 Git 无关**：Git 只做源码维护；上线为 **本机构建 → 上传产物 → 服务器 `restart`**（详见 **[`deploy/RUNBOOK.md`](./deploy/RUNBOOK.md) §3.0**，§8 为同内容速查）。门户打包：**[`deploy/sync-web.sh`](./deploy/sync-web.sh)**；可选 `--push`。

## 目录结构

| 目录 | 说明 |
|------|------|
| [`web/`](./web/) | Next.js 站点：SSR/SEO、顶栏一级 + 旅游侧栏二级、伊犁蓝与明暗主题 |
| [`admin/`](./admin/) | Vue + Vite 管理后台（操作员登录，默认端口 5174） |
| [`api/`](./api/) | Spring Boot：`/api/v1` REST，供 `web` / `admin` 调用 |
| [`.cursor/`](./.cursor/) | Cursor / Agent 约定（`AGENTS.md` 等）；根目录 `AGENTS.md` 仅作跳转 |

可选：将 `web/`、`api/` 分别推到独立 Git 仓库（`shuziyili-web` / `shuziyili-api`），与「分仓」策略一致；本仓库作为**本地一体开发**的父目录亦可。

## 本地开发

### 一键启动（推荐顺序）

为避免每次都“手动记命令”，仓库提供了启动说明脚本：

```bash
cp scripts/dev.example.sh scripts/dev.sh
chmod +x scripts/dev.sh
./scripts/dev.sh
```

注意：`scripts/dev.sh` 已在 `.gitignore` 中忽略，你可以在里面写 `export`（例如 COS 密钥），不会提交到仓库。

### 前端（web）

```bash
cd web
npm install
npm run dev
```

默认 <http://localhost:3000>。生产 canonical 见 `web/.env.example` 中的 `NEXT_PUBLIC_SITE_URL`。

### 后端（api）

需 **JDK 11+**、**MySQL 8**（开发与生产统一用 MySQL + Flyway，见 `api/README.md`）。

```bash
cd api
docker compose up -d   # 可选：起本机 MySQL（root/root，库 shuziyili）
./mvnw spring-boot:run
```

默认 <http://localhost:8080>，健康检查：<http://localhost:8080/api/v1/health>。

首次使用若无 `mvnw`，可在 `api` 目录执行：`mvn -N wrapper:wrapper`（需本机已装 Maven），或直接用 IDE 导入 Maven 项目运行 `ShuziyiliApplication`。

本地覆盖（COS 密钥、数据库密码等）：复制 `api/src/main/resources/application-local.yml.example` 为 `application-local.yml`（已在 `.gitignore`）。默认 profile 已包含 `dev` + `local`，一般无需再设 `SPRING_PROFILES_ACTIVE`。

## 部署关系（概念）

- 浏览器访问 **`www.shuziyili.com`** → 部署 **web**
- **web** 服务端请求 **`api.shuziyili.com`**（或同域反代 `/api`）→ 部署 **api**

具体网关、CORS 与 `NEXT_PUBLIC_SITE_URL` / 服务端 `API_BASE_URL` 在上线前在各自环境变量中配置。
