package com.shuziyili.module.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "staff_permissions")
public class StaffPermissionEntity {

  @Id
  @Column(name = "permission_code", nullable = false, length = 64)
  private String permissionCode;

  @Column(name = "display_name", nullable = false, length = 120)
  private String displayName = "";

  @Column(nullable = false, length = 255)
  private String description = "";

  @Column(nullable = false)
  private boolean enabled;

  @Column(name = "created_at", nullable = false)
  private long createdAt;

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  public String getPermissionCode() {
    return permissionCode;
  }

  public void setPermissionCode(String permissionCode) {
    this.permissionCode = permissionCode;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(long createdAt) {
    this.createdAt = createdAt;
  }

  public long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(long updatedAt) {
    this.updatedAt = updatedAt;
  }
}

