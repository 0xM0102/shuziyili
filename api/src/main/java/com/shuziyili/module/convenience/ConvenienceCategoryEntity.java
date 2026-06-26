package com.shuziyili.module.convenience;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "convenience_categories")
public class ConvenienceCategoryEntity {

  @Id
  @Column(length = 64)
  private String slug;

  @Column(nullable = false, length = 120)
  private String title;

  @Column(name = "short_title", nullable = false, length = 64)
  private String shortTitle = "";

  @Column(nullable = false, length = 500)
  private String description = "";

  @Column(nullable = false, length = 64)
  private String icon = "convenience";

  @Column(name = "keywords_json", nullable = false, columnDefinition = "TEXT")
  private String keywordsJson = "[]";

  @Column(nullable = false)
  private boolean enabled = true;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "created_at", nullable = false)
  private long createdAt;

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getShortTitle() {
    return shortTitle;
  }

  public void setShortTitle(String shortTitle) {
    this.shortTitle = shortTitle;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getIcon() {
    return icon;
  }

  public void setIcon(String icon) {
    this.icon = icon;
  }

  public String getKeywordsJson() {
    return keywordsJson;
  }

  public void setKeywordsJson(String keywordsJson) {
    this.keywordsJson = keywordsJson;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
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
