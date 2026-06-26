# 短信模版说明（登录 / 注册）

面向 **腾讯云短信（SMS）** 或其它国内短信平台申报时使用。变量占位按各平台要求替换为 `{1}`、`{code}` 等。

---

## 一、登录验证码

**用途**：已注册用户登录时下发一次性验证码。

**建议签名**：`干撒深圳信息科技`（以短信平台控制台审核通过的签名为准）

**模版名称（自建）**：`登录验证码`

**模版正文（推荐，单变量）**：

```
【干撒深圳信息科技】您的登录验证码为{1}，5分钟内有效。请勿向他人泄露。如非本人操作请忽略。
```

**变量说明**：

| 序号 | 含义   | 示例   |
| ---- | ------ | ------ |
| {1}  | 6 位数字验证码 | `482913` |

**有效期**：与后端一致，当前为 **5 分钟**（可在 `PortalAuthService` 中调整）。

---

## 二、注册验证码

**用途**：在允许「公开注册」的场景下（当前项目逻辑为：**系统内尚无用户时**可完成首次注册），向新手机号下发验证码，校验后再设置密码完成注册。

**模版名称（自建）**：`注册验证码`

**模版正文（推荐，单变量）**：

```
【干撒深圳信息科技】您的注册验证码为{1}，5分钟内有效。如非本人操作请忽略。
```

**变量说明**：

| 序号 | 含义   | 示例   |
| ---- | ------ | ------ |
| {1}  | 6 位数字验证码 | `482913` |

---

## 三、与后端代码的对应关系

- 登录发码 / 校验：`scene = login`（见 `SmsScene.LOGIN`）
- 注册发码 / 校验：`scene = register`（见 `SmsScene.REGISTER`）

接入第三方时，在 `SmsSender#sendVerificationCode(phone, scene, code)` 内按 `scene` 选择不同的 **短信模版 ID** 即可。

---

## 四、开发环境（未接腾讯云）

未配置真实短信通道时，验证码会输出到 **API 日志**，形如：

`[SMS DEV] scene=login phone=... code=...`

便于本地联调；上线前请替换为实现 `SmsSender` 的腾讯云（或其它）实现类。

---

## 五、相关 HTTP 接口（后端已实现）

门户注册须验证码；登录支持「密码」或「验证码」。`identifier` 为规范化后的手机号或邮箱。

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| POST | `/api/v1/auth/register/send` | 发送注册验证码，body：`{ "identifier": "…" }` |
| POST | `/api/v1/auth/register` | 注册，body：`{ "identifier", "code", "password" }` |
| POST | `/api/v1/auth/login/send` | 发送登录验证码（账号须已存在） |
| POST | `/api/v1/auth/login/code` | 验证码登录，body：`{ "identifier", "code" }` |
| POST | `/api/v1/auth/login` | 密码登录，body：`{ "identifier", "password" }` |

手机走 `SmsSender` 发短信；邮箱走 `EmailSender`（默认 `LogEmailSender` 打日志，生产请接 SMTP/邮件服务）。

发码时会将 HTTP 来源写入 `sms_codes.request_origin`（`Origin` → `Referer` → 反代 `Host`），管理后台「验证发送记录」可查看。

---

## 六、接入第三方时的实现要点

项目已内置 **腾讯云短信** 实现：`com.shuziyili.module.sms.TencentSmsSender`。

### 环境变量（服务器 / 本机，勿提交仓库）

| 变量 | 说明 |
| ---- | ---- |
| `SHUZIYILI_SMS_ENABLED` | `true` 时走腾讯云；未设或 `false` 时仍为日志兜底 `LogSmsSender` |
| `SHUZIYILI_SMS_SECRET_ID` | API 密钥 SecretId |
| `SHUZIYILI_SMS_SECRET_KEY` | API 密钥 SecretKey |
| `SHUZIYILI_SMS_SDK_APP_ID` | 短信应用 SdkAppId（默认 `1401102717`，可按控制台覆盖） |
| `SHUZIYILI_SMS_SIGN_NAME` | 已审核签名（默认 `干撒深圳信息科技`） |
| `SHUZIYILI_SMS_TEMPLATE_LOGIN` | 登录验证码模板 ID（控制台数字） |
| `SHUZIYILI_SMS_TEMPLATE_REGISTER` | 注册验证码模板 ID |
| `SHUZIYILI_SMS_REGION` | 可选，默认 `ap-guangzhou` |

启用腾讯云且缺少 Secret/模板时，应用**启动会失败**并提示缺哪项，避免静默不发短信。

### 历史说明（自定义实现）

若不用腾讯云，可自行实现 `SmsSender` 并关闭 `SHUZIYILI_SMS_ENABLED`。

邮箱验证码：实现 `com.shuziyili.module.sms.EmailSender` 并替代 `LogEmailSender`（与短信独立）。
