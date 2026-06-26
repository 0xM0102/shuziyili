-- 验证码发送审计：记录 HTTP 请求来源（Origin / Referer / 反代 Host），便于区分门户与其它调用方。
ALTER TABLE sms_codes ADD COLUMN request_origin VARCHAR(255) NULL;
