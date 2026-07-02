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

## 门户资讯与天气（默认聚合 Juhe）

与 `deploy/env/api.env.example`、`application-local.yml.example` 一致：

| 能力 | Provider | 配置 | 文档 |
|------|----------|------|------|
| 主资讯 `/news` | `juhe`（默认） | `JUHE_NEWS_*` | [新闻头条 235](https://www.juhe.cn/docs/api/id/235) |
| 天气 `/weather` | `juhe`（默认） | `JUHE_WEATHER_*`（Key 可省略，共用 `JUHE_NEWS_KEY`） | [天气预报 73](https://www.juhe.cn/docs/api/id/73) |
| 首页新疆资讯 | 固定 TianAPI | `TIANAPI_NEWS_*` | [地区新闻 154](https://www.tianapi.com/apiview/154) |

公开接口：`GET /api/v1/news/headlines`、`GET /api/v1/news/headlines/{id}`、`GET /api/v1/weather`、`GET /api/v1/home/area-news`。

备选作主资讯或天气：

| 方案 | `NEWS_PROVIDER` / `WEATHER_PROVIDER` | 配置前缀 |
|------|----------------------------------------|----------|
| 天聚地区新闻 | `tianapi` | `TIANAPI_NEWS_*` |
| 腾讯 Skills | `tencent` | `TENCENT_NEWS_*` / `TENCENT_WEATHER_*` |

本地示例（`application-local.yml`）：

```yaml
shuziyili:
  news:
    provider: juhe
  weather:
    provider: juhe
  juhe:
    news:
      enabled: true
      key: "Juhe AppKey（须开通 235）"
      type: top
    weather:
      enabled: true
      # key 可省略，共用 news.key
  tianapi:
    news:
      enabled: true
      key: "天聚 Key"
      areaname: 新疆
  tencent:
    news:
      enabled: false
    weather:
      enabled: false
```

实现类：`JuheNewsProvider`、`JuheWeatherService`、`TianAreaNewsProvider`、`TencentNewsProvider`；资讯由 `NewsService`、天气由 `WeatherService` 按 `provider` 择一调用。
