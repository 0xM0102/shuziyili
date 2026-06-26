package com.shuziyili.module.convenience;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "convenience_services")
public class ConvenienceServiceEntity {

  @Id
  @Column(length = 64)
  private String id;

  @Column(name = "category_slug", nullable = false, length = 64)
  private String categorySlug;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 120)
  private String area = "";

  @Column(nullable = false, length = 500)
  private String address = "";

  @Column(nullable = false, length = 200)
  private String contact = "";

  @Column(nullable = false, length = 200)
  private String hours = "";

  @Column(nullable = false, length = 800)
  private String summary = "";

  @Column(name = "tags_json", nullable = false, columnDefinition = "TEXT")
  private String tagsJson = "[]";

  @Column(nullable = false, length = 32)
  private String status = ConvenienceServiceStatus.PENDING;

  @Column(name = "source_url", length = 1024)
  private String sourceUrl;

  @Column(name = "map_url", length = 1024)
  private String mapUrl;

  @Column(nullable = false)
  private boolean emergency;

  @Column(nullable = false)
  private boolean enabled = true;

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

  public String getCategorySlug() {
    return categorySlug;
  }

  public void setCategorySlug(String categorySlug) {
    this.categorySlug = categorySlug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getArea() {
    return area;
  }

  public void setArea(String area) {
    this.area = area;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getContact() {
    return contact;
  }

  public void setContact(String contact) {
    this.contact = contact;
  }

  public String getHours() {
    return hours;
  }

  public void setHours(String hours) {
    this.hours = hours;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getTagsJson() {
    return tagsJson;
  }

  public void setTagsJson(String tagsJson) {
    this.tagsJson = tagsJson;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getSourceUrl() {
    return sourceUrl;
  }

  public void setSourceUrl(String sourceUrl) {
    this.sourceUrl = sourceUrl;
  }

  public String getMapUrl() {
    return mapUrl;
  }

  public void setMapUrl(String mapUrl) {
    this.mapUrl = mapUrl;
  }

  public boolean isEmergency() {
    return emergency;
  }

  public void setEmergency(boolean emergency) {
    this.emergency = emergency;
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
