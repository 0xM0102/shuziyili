package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 聚合数据「新闻头条」配置（方案 A）。
 *
 * @see <a href="https://www.juhe.cn/docs/api/id/235">Juhe 新闻头条 API</a>
 * @see com.shuziyili.module.news.JuheNewsProvider
 */
@ConfigurationProperties(prefix = "shuziyili.juhe.news")
public class JuheNewsProperties {

  /** 关闭时不请求聚合接口，仅返回空列表。 */
  private boolean enabled = false;

  private String key = "";

  /** 聚合「新闻头条」列表地址（文档 ID 235）。 */
  private String listUrl = "http://v.juhe.cn/toutiao/index";

  /** 聚合「新闻详情」地址（同文档「新闻详情查询」）。 */
  private String contentUrl = "https://v.juhe.cn/toutiao/content";

  /** 列表 type 参数，如 top、guonei、yule 等。 */
  private String type = "top";

  private int pageSize = 30;

  /** 两次真实请求聚合之间的最短间隔（秒），默认 3600 = 一小时。 */
  private int refreshSeconds = 3600;

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public String getListUrl() {
    return listUrl;
  }

  public void setListUrl(String listUrl) {
    this.listUrl = listUrl;
  }

  public String getContentUrl() {
    return contentUrl;
  }

  public void setContentUrl(String contentUrl) {
    this.contentUrl = contentUrl;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public int getPageSize() {
    return pageSize;
  }

  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  public int getRefreshSeconds() {
    return refreshSeconds;
  }

  public void setRefreshSeconds(int refreshSeconds) {
    this.refreshSeconds = refreshSeconds;
  }
}
