package com.shuziyili.module.sms;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;

@Entity
@Table(
    name = "sms_codes",
    indexes = {
      @Index(name = "idx_sms_phone_scene_created", columnList = "phone,scene,createdAt"),
      @Index(name = "idx_sms_expires", columnList = "expiresAt")
    })
public class SmsCodeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** 规范化后的手机号或邮箱（与 Flyway V10 列宽一致） */
  @Column(nullable = false, length = 255)
  private String phone;

  @Column(nullable = false, length = 32)
  private String scene;

  @Column(nullable = false, length = 64)
  private String codeHash;

  /** 验证码明文；仅当开启 {@code shuziyili.auth.store-plain-otp} 时写入，生产建议关闭。 */
  @Column(name = "plain_code", length = 8)
  private String plainCode;

  @Column(nullable = false)
  private long createdAt;

  @Column(nullable = false)
  private long expiresAt;

  @Column(nullable = false)
  private boolean used;

  @Column(nullable = false)
  private long usedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getScene() {
    return scene;
  }

  public void setScene(String scene) {
    this.scene = scene;
  }

  public String getCodeHash() {
    return codeHash;
  }

  public void setCodeHash(String codeHash) {
    this.codeHash = codeHash;
  }

  public String getPlainCode() {
    return plainCode;
  }

  public void setPlainCode(String plainCode) {
    this.plainCode = plainCode;
  }

  public long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(long createdAt) {
    this.createdAt = createdAt;
  }

  public long getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(long expiresAt) {
    this.expiresAt = expiresAt;
  }

  public boolean isUsed() {
    return used;
  }

  public void setUsed(boolean used) {
    this.used = used;
  }

  public long getUsedAt() {
    return usedAt;
  }

  public void setUsedAt(long usedAt) {
    this.usedAt = usedAt;
  }
}

