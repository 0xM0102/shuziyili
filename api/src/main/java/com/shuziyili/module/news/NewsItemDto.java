package com.shuziyili.module.news;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class NewsItemDto {

  private final String uniquekey;
  private final String title;
  private final String date;
  private final String category;
  private final String authorName;
  private final String url;
  private final String thumbnailUrl;

  public NewsItemDto(
      String uniquekey,
      String title,
      String date,
      String category,
      String authorName,
      String url,
      String thumbnailUrl) {
    this.uniquekey = uniquekey;
    this.title = title;
    this.date = date;
    this.category = category;
    this.authorName = authorName;
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
  }

  public String getUniquekey() {
    return uniquekey;
  }

  public String getTitle() {
    return title;
  }

  public String getDate() {
    return date;
  }

  public String getCategory() {
    return category;
  }

  public String getAuthorName() {
    return authorName;
  }

  public String getUrl() {
    return url;
  }

  public String getThumbnailUrl() {
    return thumbnailUrl;
  }
}
