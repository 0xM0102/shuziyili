package com.shuziyili.module.banner;

public enum BannerSlot {
  HOME_MAIN("home_main"),
  HOME_SIDE_TOP("home_side_top"),
  HOME_SIDE_BOTTOM("home_side_bottom");

  private final String code;

  BannerSlot(String code) {
    this.code = code;
  }

  public String code() {
    return code;
  }

  public static String normalize(String value) {
    if (value == null || value.trim().isEmpty()) return HOME_MAIN.code;
    String v = value.trim().toLowerCase();
    for (BannerSlot s : values()) {
      if (s.code.equals(v)) return s.code;
    }
    return "";
  }
}

