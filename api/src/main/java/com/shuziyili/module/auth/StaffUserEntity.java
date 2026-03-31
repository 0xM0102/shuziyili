package com.shuziyili.module.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/** 管理后台操作员（与门户客户 {@link PortalUserEntity} 数据隔离） */
@Entity
@Table(
    name = "staff_users",
    uniqueConstraints =
        @UniqueConstraint(name = "uk_staff_users_identifier", columnNames = "identifier"))
public class StaffUserEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 190)
  private String identifier;

  @Column(nullable = false, length = 200)
  private String passwordHash;

  /** admin / editor */
  @Column(length = 32)
  private String role;

  @Column(nullable = false, length = 64)
  private String nickname = "";

  @Column(name = "avatar_url", nullable = false, length = 1024)
  private String avatarUrl = "";

  @Column(nullable = false, length = 500)
  private String bio = "";

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  @Column(nullable = false)
  private long createdAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getIdentifier() {
    return identifier;
  }

  public void setIdentifier(String identifier) {
    this.identifier = identifier;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(long createdAt) {
    this.createdAt = createdAt;
  }

  public String getNickname() {
    return nickname;
  }

  public void setNickname(String nickname) {
    this.nickname = nickname;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(long updatedAt) {
    this.updatedAt = updatedAt;
  }
}
