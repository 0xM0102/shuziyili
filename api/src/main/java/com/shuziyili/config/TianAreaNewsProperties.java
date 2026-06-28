package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 天聚数行「地区新闻」接口配置。
 *
 * @see <a href="https://www.tianapi.com/apiview/154">地区新闻 API（ID 154）</a>
 */
@ConfigurationProperties(prefix = "shuziyili.tianapi.news")
public class TianAreaNewsProperties {

  /** 为 true 且配置了 key 时，{@code provider=tianapi} 才会请求上游。 */
  private boolean enabled = false;

  private String key = "";

  /** 默认官方接入点；一般无需修改。 */
  private String listUrl = "https://apis.tianapi.com/areanews/index";

  /**
   * 省级行政区名称，勿带「省」「市」，例如 {@code 新疆}、{@code 湖北}。
   * 侧栏非 {@code top} 频道会映射为 Tian {@code word} 关键词（见 {@code NewsChannelTypes}）。
   */
  private String areaname = "新疆";

  private int pageSize = 20;

  /** 两次真实请求上游之间的最短间隔（秒），默认 3600。 */
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

  public String getAreaname() {
    return areaname;
  }

  public void setAreaname(String areaname) {
    this.areaname = areaname;
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
