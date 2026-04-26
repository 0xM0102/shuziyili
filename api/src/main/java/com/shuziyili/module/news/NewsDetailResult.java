package com.shuziyili.module.news;

/**
 * 资讯详情：列表/详情接口合并后的 {@link NewsItemDto}，以及聚合「新闻详情」返回的正文 HTML（可能为空）。
 */
public final class NewsDetailResult {

  private final NewsItemDto item;
  private final String contentHtml;

  public NewsDetailResult(NewsItemDto item, String contentHtml) {
    this.item = item;
    this.contentHtml = contentHtml == null ? "" : contentHtml;
  }

  public NewsItemDto getItem() {
    return item;
  }

  public String getContentHtml() {
    return contentHtml;
  }
}
