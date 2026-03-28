# shuziyili-api

数字伊犁 **Spring Boot** 后端，`/api/v1` 前缀；与 [`../web`](../web) 分开部署。

## 运行

```bash
./mvnw spring-boot:run
```

若无 Wrapper：

```bash
mvn -N wrapper:wrapper   # 生成 mvnw（需本机 Maven）
./mvnw spring-boot:run
```

## 环境

- **Java 11+**（Maven 编译目标为 11；升级 JDK 17 后可考虑迁到 Spring Boot 3）
- Spring Boot **2.7.x**

## 接口

| 说明 | 路径 |
|------|------|
| 健康检查 | `GET /api/v1/health` |
| OpenAPI JSON | `/api/v1/docs/openapi` |
| Swagger UI | `/api/v1/docs/swagger-ui` |

## 配置

- 默认：`src/main/resources/application.yml`（端口 8080、CORS）
- 本地数据库：复制 `application-local.yml.example` 为 `application-local.yml`（勿提交），并在 `pom.xml` 中自行加入 JPA + MySQL 依赖后使用 `--spring.profiles.active=local`

## 包结构（与前期方案一致）

- `config` — 跨域等
- `common` — 统一响应体等
- `module.system` — 系统级接口（健康检查）
- `module.auth` / `user` / `article` / `event` / `directory` / `tourism` / `nomad` — 业务预留包
