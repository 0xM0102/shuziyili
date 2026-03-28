package com.shuziyili.module.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "sessions")
public class SessionEntity {

  @Id
  @Column(length = 64)
  private String token;

  @Column(nullable = false, length = 190)
  private String identifier;

  @Column(nullable = false)
  private long expiresAt;

  @Column(nullable = false)
  private long createdAt;

  /** {@link SessionScope#name()}，区分后台会话与门户会话 */
  @Column(nullable = false, length = 16)
  private String scope = SessionScope.STAFF.name();

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getIdentifier() {
    return identifier;
  }

  public void setIdentifier(String identifier) {
    this.identifier = identifier;
  }

  public long getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(long expiresAt) {
    this.expiresAt = expiresAt;
  }

  public long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(long createdAt) {
    this.createdAt = createdAt;
  }

  public String getScope() {
    return scope;
  }

  public void setScope(String scope) {
    this.scope = scope;
  }
}
