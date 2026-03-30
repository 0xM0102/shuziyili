package com.shuziyili.module.banner;

/** 前端板块：同一套 Banner 表用 scope 区分展示位置。 */
public enum BannerScope {
  HOME("home"),
  TRAVEL("travel");

  public final String code;

  BannerScope(String code) {
    this.code = code;
  }

  /** 非法或空时返回空串，由调用方决定是否默认 home。 */
  public static String normalize(String value) {
    if (value == null || value.trim().isEmpty()) {
      return "";
    }
    String v = value.trim().toLowerCase();
    for (BannerScope s : values()) {
      if (s.code.equals(v)) {
        return s.code;
      }
    }
    return "";
  }
}
