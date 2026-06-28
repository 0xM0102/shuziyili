package com.shuziyili.module.weather;

/** 可选天气地区（adcode + 省份 + 近似中心坐标，用于 GPS 就近匹配）。 */
public final class WeatherRegion {

  private final String adcode;
  private final String name;
  private final String province;
  private final double latitude;
  private final double longitude;
  private final boolean featured;

  public WeatherRegion(
      String adcode,
      String name,
      String province,
      double latitude,
      double longitude,
      boolean featured) {
    this.adcode = adcode;
    this.name = name;
    this.province = province;
    this.latitude = latitude;
    this.longitude = longitude;
    this.featured = featured;
  }

  public String getAdcode() {
    return adcode;
  }

  public String getName() {
    return name;
  }

  public String getProvince() {
    return province;
  }

  public double getLatitude() {
    return latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public boolean isFeatured() {
    return featured;
  }
}
