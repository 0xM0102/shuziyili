-- 可选：开发/联调时在库中保留验证码明文，供管理后台查看；生产建议配合应用配置关闭写入并勿展示
ALTER TABLE sms_codes ADD COLUMN plain_code VARCHAR(8) NULL;
