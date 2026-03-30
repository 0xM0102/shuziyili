package com.shuziyili.module.flashlink;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "flash_links")
public class FlashLinkEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(nullable = false, length = 2048)
  private String url;

  /** EXTERNAL：http(s) 外链；INTERNAL：站内一句话快讯，不跳转第三方/站内文章。 */
  @Column(name = "link_kind", nullable = false, length = 16)
  private String linkKind = "EXTERNAL";

  @Column(name = "source_label", nullable = false, length = 120)
  private String sourceLabel = "";

  @Column(name = "tag_id")
  private Long tagId;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(nullable = false)
  private boolean enabled;

  @Column(name = "published_at", nullable = false)
  private long publishedAt;

  @Column(name = "created_at", nullable = false)
  private long createdAt;

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public String getLinkKind() {
    return linkKind;
  }

  public void setLinkKind(String linkKind) {
    this.linkKind = linkKind;
  }

  public String getSourceLabel() {
    return sourceLabel;
  }

  public void setSourceLabel(String sourceLabel) {
    this.sourceLabel = sourceLabel;
  }

  public Long getTagId() {
    return tagId;
  }

  public void setTagId(Long tagId) {
    this.tagId = tagId;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public long getPublishedAt() {
    return publishedAt;
  }

  public void setPublishedAt(long publishedAt) {
    this.publishedAt = publishedAt;
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
