package com.shuziyili.module.media;

/**
 * COS 对象键在全局 {@code keyPrefix}（如 {@code uploads/}）下的子目录，用于区分用途、便于生命周期与排查。
 *
 * <p>完整路径形如：{@code uploads/cms/2026/03/31/<uuid>.jpg}、{@code uploads/staff/avatars/...}、{@code uploads/portal/avatars/...}
 */
public enum CosUploadScope {
  /** 文章封面、Banner、媒体库等通用运营素材 */
  CMS("cms/"),
  /** 管理后台操作员头像（个人设置等） */
  STAFF_AVATAR("staff/avatars/"),
  /** 门户注册用户头像 */
  PORTAL_AVATAR("portal/avatars/");

  private final String folderUnderBasePrefix;

  CosUploadScope(String folderUnderBasePrefix) {
    this.folderUnderBasePrefix = folderUnderBasePrefix;
  }

  /** 位于 {@code keyPrefix} 之后的相对目录，已含末尾 {@code /} */
  public String folderUnderBasePrefix() {
    return folderUnderBasePrefix;
  }

  /**
   * 管理端上传 query：{@code cms}（默认）、{@code staff_avatar}。
   *
   * @throws IllegalArgumentException 无法解析时
   */
  public static CosUploadScope fromAdminQuery(String raw) {
    if (raw == null || raw.isBlank()) {
      return CMS;
    }
    String s = raw.trim().toLowerCase();
    if ("cms".equals(s)) {
      return CMS;
    }
    if ("staff_avatar".equals(s)) {
      return STAFF_AVATAR;
    }
    throw new IllegalArgumentException("invalid_upload_scope");
  }
}
