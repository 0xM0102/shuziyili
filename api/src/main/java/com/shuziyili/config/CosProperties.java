package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "shuziyili.cos")
public class CosProperties {

  /** 未配置密钥时接口返回提示，不抛异常 */
  private boolean enabled = true;

  private String secretId = "";
  private String secretKey = "";
  private String region = "ap-chengdu";
  private String bucket = "shuziyili-1322855353";

  /** 访问 URL 前缀，不含末尾 / */
  private String publicBaseUrl = "https://shuziyili-1322855353.cos.ap-chengdu.myqcloud.com";

  /** 对象键前缀，如 uploads/ */
  private String keyPrefix = "uploads/";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getSecretId() {
    return secretId;
  }

  public void setSecretId(String secretId) {
    this.secretId = secretId;
  }

  public String getSecretKey() {
    return secretKey;
  }

  public void setSecretKey(String secretKey) {
    this.secretKey = secretKey;
  }

  public String getRegion() {
    return region;
  }

  public void setRegion(String region) {
    this.region = region;
  }

  public String getBucket() {
    return bucket;
  }

  public void setBucket(String bucket) {
    this.bucket = bucket;
  }

  public String getPublicBaseUrl() {
    return publicBaseUrl;
  }

  public void setPublicBaseUrl(String publicBaseUrl) {
    this.publicBaseUrl = publicBaseUrl;
  }

  public String getKeyPrefix() {
    return keyPrefix;
  }

  public void setKeyPrefix(String keyPrefix) {
    this.keyPrefix = keyPrefix;
  }

  public boolean isConfigured() {
    if (!enabled) {
      return false;
    }
    return secretId != null
        && !secretId.isBlank()
        && secretKey != null
        && !secretKey.isBlank()
        && bucket != null
        && !bucket.isBlank()
        && region != null
        && !region.isBlank();
  }
}
