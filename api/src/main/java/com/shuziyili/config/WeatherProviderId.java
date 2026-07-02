package com.shuziyili.config;

public enum WeatherProviderId {
  JUHE,
  TENCENT;

  public static WeatherProviderId from(String raw) {
    if (raw == null) {
      return JUHE;
    }
    String normalized = raw.trim().toLowerCase();
    if ("tencent".equals(normalized)) {
      return TENCENT;
    }
    return JUHE;
  }
}
