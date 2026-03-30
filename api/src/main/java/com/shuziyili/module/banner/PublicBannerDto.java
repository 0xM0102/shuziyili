package com.shuziyili.module.banner;

/**
 * 门户/频道前台使用的 Banner 结构（与 {@link BannerEntity} 对应字段，slot/scope 已规范化）。
 */
public class PublicBannerDto {
  public Long id;
  public String title;
  public String imageUrl;
  public String linkUrl;
  public String slot;
  public String scope;
  public int sortOrder;
}
