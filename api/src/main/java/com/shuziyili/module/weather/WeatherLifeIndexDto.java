package com.shuziyili.module.weather;

public class WeatherLifeIndexDto {

  private final String key;
  private final String name;
  private final String info;
  private final String detail;

  public WeatherLifeIndexDto(String key, String name, String info, String detail) {
    this.key = key;
    this.name = name;
    this.info = info;
    this.detail = detail;
  }

  public String getKey() {
    return key;
  }

  public String getName() {
    return name;
  }

  public String getInfo() {
    return info;
  }

  public String getDetail() {
    return detail;
  }
}
