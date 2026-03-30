package com.shuziyili.module.banner;

/** 展示位编码：home_* 对应门户首页，travel_* 对应旅游频道；须与 {@link BannerScope} 一致。 */
public enum BannerSlot {
  HOME_MAIN("home_main"),
  HOME_SIDE_TOP("home_side_top"),
  HOME_SIDE_BOTTOM("home_side_bottom"),
  TRAVEL_MAIN("travel_main"),
  TRAVEL_SIDE_TOP("travel_side_top"),
  TRAVEL_SIDE_BOTTOM("travel_side_bottom");

  private final String code;

  BannerSlot(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }

  public static String normalize(String value) {
    if (value == null || value.trim().isEmpty()) {
      return "";
    }
    String v = value.trim().toLowerCase();
    for (BannerSlot s : values()) {
      if (s.code.equals(v)) {
        return s.code;
      }
    }
    return "";
  }

  /** slot 是否属于该板块（与 {@link BannerScope} 一致）。 */
  public static boolean validForScope(String slotCode, String scopeCode) {
    String s = normalize(slotCode);
    if (s.isEmpty()) {
      return false;
    }
    if (BannerScope.HOME.code.equals(scopeCode)) {
      return HOME_MAIN.code.equals(s)
          || HOME_SIDE_TOP.code.equals(s)
          || HOME_SIDE_BOTTOM.code.equals(s);
    }
    if (BannerScope.TRAVEL.code.equals(scopeCode)) {
      return TRAVEL_MAIN.code.equals(s)
          || TRAVEL_SIDE_TOP.code.equals(s)
          || TRAVEL_SIDE_BOTTOM.code.equals(s);
    }
    return false;
  }

  public static String defaultMainForScope(String scopeCode) {
    if (BannerScope.TRAVEL.code.equals(scopeCode)) {
      return TRAVEL_MAIN.code;
    }
    return HOME_MAIN.code;
  }

  /** 副 Banner 位（每板块同一副位仅一条，应用层校验）。 */
  public static boolean isSingleSideSlot(String slot) {
    String s = normalize(slot);
    return HOME_SIDE_TOP.code.equals(s)
        || HOME_SIDE_BOTTOM.code.equals(s)
        || TRAVEL_SIDE_TOP.code.equals(s)
        || TRAVEL_SIDE_BOTTOM.code.equals(s);
  }
}
