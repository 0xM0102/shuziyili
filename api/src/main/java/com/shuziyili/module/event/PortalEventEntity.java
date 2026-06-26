package com.shuziyili.module.event;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "portal_events")
public class PortalEventEntity {

  @Id
  @Column(length = 64)
  private String id;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(nullable = false, length = 800)
  private String summary = "";

  @Column(name = "cover_url", nullable = false, length = 1024)
  private String coverUrl = "";

  @Column(nullable = false, length = 500)
  private String location = "";

  @Column(nullable = false, length = 32)
  private String category;

  @Column(name = "starts_at", nullable = false)
  private long startsAt;

  @Column(name = "ends_at", nullable = false)
  private long endsAt;

  @Column(nullable = false, length = 500)
  private String organizer = "";

  @Column(name = "register_url", length = 1024)
  private String registerUrl;

  @Column(name = "highlights_json", nullable = false, columnDefinition = "TEXT")
  private String highlightsJson = "[]";

  @Column(nullable = false)
  private boolean published = true;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "created_at", nullable = false)
  private long createdAt;

  @Column(name = "updated_at", nullable = false)
  private long updatedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getCoverUrl() {
    return coverUrl;
  }

  public void setCoverUrl(String coverUrl) {
    this.coverUrl = coverUrl;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public long getStartsAt() {
    return startsAt;
  }

  public void setStartsAt(long startsAt) {
    this.startsAt = startsAt;
  }

  public long getEndsAt() {
    return endsAt;
  }

  public void setEndsAt(long endsAt) {
    this.endsAt = endsAt;
  }

  public String getOrganizer() {
    return organizer;
  }

  public void setOrganizer(String organizer) {
    this.organizer = organizer;
  }

  public String getRegisterUrl() {
    return registerUrl;
  }

  public void setRegisterUrl(String registerUrl) {
    this.registerUrl = registerUrl;
  }

  public String getHighlightsJson() {
    return highlightsJson;
  }

  public void setHighlightsJson(String highlightsJson) {
    this.highlightsJson = highlightsJson;
  }

  public boolean isPublished() {
    return published;
  }

  public void setPublished(boolean published) {
    this.published = published;
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
