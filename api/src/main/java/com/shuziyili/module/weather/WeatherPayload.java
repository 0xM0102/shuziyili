package com.shuziyili.module.weather;

import java.util.List;

public class WeatherPayload {

  private final String adcode;
  private final String cityName;
  private final String updatedAt;
  private final int currentTemp;
  private final String weatherText;
  private final String humidity;
  private final String windText;
  private final String travelTip;
  private final List<WeatherForecastDayDto> forecast;
  private final List<WeatherHourlyDto> hourly;
  private final List<WeatherLifeIndexDto> lifeIndices;
  private final boolean upstreamConfigured;

  public WeatherPayload(
      String adcode,
      String cityName,
      String updatedAt,
      int currentTemp,
      String weatherText,
      String humidity,
      String windText,
      String travelTip,
      List<WeatherForecastDayDto> forecast,
      List<WeatherHourlyDto> hourly,
      List<WeatherLifeIndexDto> lifeIndices,
      boolean upstreamConfigured) {
    this.adcode = adcode;
    this.cityName = cityName;
    this.updatedAt = updatedAt;
    this.currentTemp = currentTemp;
    this.weatherText = weatherText;
    this.humidity = humidity;
    this.windText = windText;
    this.travelTip = travelTip;
    this.forecast = forecast;
    this.hourly = hourly;
    this.lifeIndices = lifeIndices;
    this.upstreamConfigured = upstreamConfigured;
  }

  static WeatherPayload unconfigured(String defaultAdcode, String defaultName) {
    return new WeatherPayload(
        defaultAdcode,
        defaultName,
        "",
        0,
        "",
        "",
        "",
        "",
        List.of(),
        List.of(),
        List.of(),
        false);
  }

  public String getAdcode() {
    return adcode;
  }

  public String getCityName() {
    return cityName;
  }

  public String getUpdatedAt() {
    return updatedAt;
  }

  public int getCurrentTemp() {
    return currentTemp;
  }

  public String getWeatherText() {
    return weatherText;
  }

  public String getHumidity() {
    return humidity;
  }

  public String getWindText() {
    return windText;
  }

  public String getTravelTip() {
    return travelTip;
  }

  public List<WeatherForecastDayDto> getForecast() {
    return forecast;
  }

  public List<WeatherHourlyDto> getHourly() {
    return hourly;
  }

  public List<WeatherLifeIndexDto> getLifeIndices() {
    return lifeIndices;
  }

  public boolean isUpstreamConfigured() {
    return upstreamConfigured;
  }
}
