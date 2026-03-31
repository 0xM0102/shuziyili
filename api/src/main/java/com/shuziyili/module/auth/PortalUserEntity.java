package com.shuziyili.module.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/** 门户注册用户（C 端个人中心；无 admin/editor 角色） */
@Entity
@Table(
    name = "portal_users",
    uniqueConstraints =
        @UniqueConstraint(name = "uk_portal_users_identifier", columnNames = "identifier"))
public class PortalUserEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 190)
  private String identifier;

  @Column(nullable = false, length = 200)
  private String passwordHash;

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
