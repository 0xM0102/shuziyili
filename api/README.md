# shuziyili-api

数字伊犁 **Spring Boot** 后端，`/api/v1` 前缀；与 [`../web`](../web) 分开部署。

## 运行

开发与生产统一使用 **MySQL**；默认 `dev` profile 连接 `127.0.0.1:3306`，库名 `shuziyili`，用户 `root`，密码 `root`（可用环境变量 `SPRING_DATASOURCE_*` 覆盖）。

**Navicat / 本机 MySQL 里看不到 `shuziyili`？**  
这是正常的：库要不存在，**第一次启动 API** 时，开发环境默认连接串里的 `createDatabaseIfNotExist=true` 会自动建库；刷新 Navicat 即可。也可在 Navicat 里手动执行：

```sql
CREATE DATABASE shuziyili CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

若你本机 root 密码不是 `root`，在 `application-local.yml` 里改 `spring.datasource.password`（或设环境变量 `SPRING_DATASOURCE_PASSWORD`）。

**方式一：Docker 起 MySQL（推荐）**

```bash
cd api && docker compose up -d
```

**方式二：本机已安装 MySQL 8（沿用你现有的 3306 实例）**  
保证账号密码与配置一致即可；无需事先建库也可直接 `./mvnw spring-boot:run`（会自动建 `shuziyili`）。

然后启动 API：

```bash
./mvnw spring-boot:run
```

首次启动会由 **Flyway** 执行 `db/migration` 建表；若无操作员，启动脚本会写入初始管理员（见 `BootstrapAdminRunner`）。

### 从旧 H2 文件库迁到 MySQL（一次性）

若你曾用默认 `dev` H2（数据在 `api/data/*.mv.db`），可导入本机 MySQL 后删除 H2 文件：

```bash
cd api
export MYSQL_PASSWORD=你的MySQL密码   # 与 application-local.yml 中 root 密码一致
./scripts/migrate-h2-to-mysql.sh
```

脚本会：导出 H2 → 跑 Flyway（可设 `SKIP_FLYWAY=1` 跳过）→ 清空业务表并插入 → 清空 `api/data` 下 H2 文件。`flyway_schema_history` 不删。

若无 Wrapper：

```bash
mvn -N wrapper:wrapper   # 生成 mvnw（需本机 Maven）
./mvnw spring-boot:run
```

## 环境

- **Java 11+**（Maven 编译目标为 11；升级 JDK 17 后可考虑迁到 Spring Boot 3）
- Spring Boot **2.7.x**
- **MySQL 8**（本地开发 + 生产）

## 接口

| 说明 | 路径 |
|------|------|
| 健康检查 | `GET /api/v1/health` |
| OpenAPI JSON | `/api/v1/docs/openapi` |
| Swagger UI | `/api/v1/docs/swagger-ui` |

## 配置

- 默认：`application.yml`（端口 8080、默认 profile `dev`）
- `application-dev.yml`：本地 MySQL + Flyway + 文档接口
- `application-prod.yml`：生产 MySQL + Flyway + `ddl-auto: validate`
- 复制 `application-local.yml.example` 为 `application-local.yml` 覆盖 COS 密钥、数据库密码等（勿提交）

## 包结构（与前期方案一致）

- `config` — 跨域等
- `common` — 统一响应体等
- `module.system` — 系统级接口（健康检查）
- `module.auth` / `user` / `article` / `event` / `directory` / `tourism` / `nomad` — 业务预留包
- `module.news` — 门户资讯（Juhe / TianAPI / 腾讯新闻，见下）

## 门户资讯数据源（三选一）

公开接口不变：`GET /api/v1/news/headlines`、`GET /api/v1/news/headlines/{id}`。

| 方案 | `NEWS_PROVIDER` | 配置前缀 | 文档 |
|------|-----------------|----------|------|
| A 聚合数据 Juhe（默认） | `juhe` | `JUHE_NEWS_*` / `shuziyili.juhe.news` | [Juhe 235](https://www.juhe.cn/docs/api/id/235) |
| B 天聚数行地区新闻 | `tianapi` | `TIANAPI_NEWS_*` / `shuziyili.tianapi.news` | [TianAPI 154](https://www.tianapi.com/apiview/154) |
| C 腾讯新闻 Skills | `tencent` | `TENCENT_NEWS_*` / `shuziyili.tencent.news` | [获取 API Key](https://news.qq.com/exchange?scene=appkey) |

切换腾讯新闻示例（`application-local.yml` 或 `api.env`）：

```yaml
shuziyili:
  news:
    provider: tencent
  juhe:
    news:
      enabled: false
  tianapi:
    news:
      enabled: false
  tencent:
    news:
      enabled: true
      key: "在 news.qq.com/exchange 登录后生成的 API Key"
```

实现类：`JuheNewsProvider`、`TianAreaNewsProvider`、`TencentNewsProvider`，由 `NewsService` 按 `shuziyili.news.provider` 择一调用。
