package com.shuziyili.module.auth;

/** 后台权限码常量（与 db/migration/V16__staff_roles_permissions.sql 保持一致）。 */
public final class StaffPermissionCodes {

  private StaffPermissionCodes() {}

  public static final String DASHBOARD_VIEW = "dashboard.view";
  public static final String STAFF_MANAGE = "staff.manage";
  public static final String PORTAL_USERS_MANAGE = "portal_users.manage";
  public static final String VERIFICATION_RECORDS_MANAGE = "verification_records.manage";
  public static final String ARTICLES_MANAGE = "articles.manage";
  public static final String BANNERS_MANAGE = "banners.manage";
  public static final String FLASH_LINKS_MANAGE = "flash_links.manage";
  public static final String FLASH_TAGS_MANAGE = "flash_tags.manage";
  public static final String EVENTS_MANAGE = "events.manage";
  public static final String CONVENIENCE_MANAGE = "convenience.manage";
  public static final String MEDIA_MANAGE = "media.manage";
  public static final String PERMISSIONS_MANAGE = "permissions.manage";
}
