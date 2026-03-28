CREATE TABLE sms_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(32) NOT NULL,
  scene VARCHAR(32) NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  used BOOLEAN NOT NULL,
  used_at BIGINT NOT NULL
);

CREATE INDEX idx_sms_phone_scene_created ON sms_codes(phone, scene, created_at);
CREATE INDEX idx_sms_expires ON sms_codes(expires_at);

