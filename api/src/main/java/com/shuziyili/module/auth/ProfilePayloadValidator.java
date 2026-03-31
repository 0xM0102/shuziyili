package com.shuziyili.module.auth;

/** 资料字段校验与写入（后台账号表 / 门户用户表共用规则） */
public final class ProfilePayloadValidator {

  private ProfilePayloadValidator() {}

  /** @return 错误码或 null */
  public static String validate(String nickname, String avatarUrl, String bio) {
    if (nickname != null && nickname.length() > 64) return "invalid_profile";
    if (avatarUrl != null && avatarUrl.length() > 1024) return "invalid_profile";
    if (bio != null && bio.length() > 500) return "invalid_profile";
    String av = avatarUrl == null ? "" : avatarUrl.trim();
    if (!av.isEmpty() && !(av.startsWith("http://") || av.startsWith("https://"))) {
      return "invalid_profile";
    }
    return null;
  }

  public static void applyToStaff(
      StaffUserEntity u, String nickname, String avatarUrl, String bio, long now) {
    u.setNickname(trim(nickname, 64));
    u.setAvatarUrl(trim(avatarUrl, 1024));
    u.setBio(trim(bio, 500));
    u.setUpdatedAt(now);
  }

  public static void applyToPortal(
      PortalUserEntity u, String nickname, String avatarUrl, String bio, long now) {
    u.setNickname(trim(nickname, 64));
    u.setAvatarUrl(trim(avatarUrl, 1024));
    u.setBio(trim(bio, 500));
    u.setUpdatedAt(now);
  }

  private static String trim(String raw, int maxLen) {
    if (raw == null) return "";
    String t = raw.trim();
    if (t.length() > maxLen) return t.substring(0, maxLen);
    return t;
  }
}
