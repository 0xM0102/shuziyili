package com.shuziyili.module.settings;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "portal_settings")
public class PortalSettingEntity {

  @Id
  @Column(name = "setting_key", nullable = false, length = 64)
  private String settingKey;

  @Column(name = "setting_value", nullable = false, length = 512)
  private String settingValue = "";

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  public String getSettingKey() {
    return settingKey;
  }

  public void setSettingKey(String settingKey) {
    this.settingKey = settingKey;
  }

  public String getSettingValue() {
    return settingValue;
  }

  public void setSettingValue(String settingValue) {
    this.settingValue = settingValue;
  }

  public long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(long updatedAt) {
    this.updatedAt = updatedAt;
  }
}
