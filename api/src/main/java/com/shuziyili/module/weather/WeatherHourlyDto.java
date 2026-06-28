package com.shuziyili.module.weather;

public class WeatherHourlyDto {

  private final String time;
  private final String weatherText;
  private final int temp;

  public WeatherHourlyDto(String time, String weatherText, int temp) {
    this.time = time;
    this.weatherText = weatherText;
    this.temp = temp;
  }

  public String getTime() {
    return time;
  }

  public String getWeatherText() {
    return weatherText;
  }

  public int getTemp() {
    return temp;
  }
}
