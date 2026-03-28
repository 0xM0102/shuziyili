-- 支持邮箱作为验证码接收端（原 phone 列实际存规范化后的手机号或邮箱）
ALTER TABLE sms_codes MODIFY phone VARCHAR(255) NOT NULL;
