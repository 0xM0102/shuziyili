<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `web/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 服务重启（Agent 约定）

当代码或配置变更**需要重启**才能生效时（例如 Spring Boot API、`web`/`admin` 的 dev server），Agent 应**自行在终端里重启或启动对应进程**，不要只写操作说明让用户再执行一遍，也不要等用户开口要求重启。

- 改 `api/`：在确认无重复占用端口后重启 API（如 `mvn spring-boot:run` 或项目既有启动方式）。**同一轮对话里只要改动了 `api/`，默认由 Agent 在终端完成重启（或启动），不要把「需要重启」留给用户操心**；除非用户明确说本次不必重启。
- 改 `web/`、`admin/`：若已有 dev 进程在跑，应结束旧进程再启动新的，避免用户手动处理。

若无法确定当前是否在跑、或端口冲突，可先查看 `terminals` 元数据再决定。

## 生产发版 SSH（约定）

门户一键脚本 `deploy/sync-web.sh` 在未设置 `DEPLOY` 时会读取 `deploy/ssh-target.env`（当前为 **`ubuntu@45.40.243.131`**）。发版前本机须已 **`ssh-copy-id`** 到该目标（免密）；否则脚本会在构建前失败并提示。若实机用户不同，改 `ssh-target.env` 或 `deploy/deploy.local.env`。
