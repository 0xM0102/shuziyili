package com.shuziyili.module.weather;

public class WeatherRegionDto {

  private final String adcode;
  private final String name;
  private final String province;
  private final boolean featured;

  public WeatherRegionDto(String adcode, String name, String province, boolean featured) {
    this.adcode = adcode;
    this.name = name;
    this.province = province;
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

  public boolean isFeatured() {
    return featured;
  }

  static WeatherRegionDto from(WeatherRegion region) {
    return new WeatherRegionDto(
        region.getAdcode(), region.getName(), region.getProvince(), region.isFeatured());
  }
}
