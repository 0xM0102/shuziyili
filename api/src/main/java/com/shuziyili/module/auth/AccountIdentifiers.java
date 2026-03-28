package com.shuziyili.module.auth;

/**
 * 门户与后台共用的登录标识规则：邮箱或手机号，统一 trim / 规范化。
 */
public final class AccountIdentifiers {

  private AccountIdentifiers() {}

  public static String normalize(String raw) {
    if (raw == null) {
      return "";
    }
    String s = raw.trim();
    if (s.contains("@")) {
      return s.toLowerCase();
    }
    return s.replaceAll("\\s+", "");
  }

  /** @return {@code null} 表示合法；否则为错误码 {@code empty} / {@code invalid} */
  public static String validate(String identifier) {
    if (identifier == null || identifier.isBlank()) {
      return "empty";
    }
    if (isEmail(identifier) || isPhone(identifier)) {
      return null;
    }
    return "invalid";
  }

  public static boolean isEmail(String v) {
    return v.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
  }

  public static boolean isPhone(String v) {
    return v.matches("^\\+?\\d{6,20}$");
  }
}
