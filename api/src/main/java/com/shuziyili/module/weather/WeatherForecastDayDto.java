package com.shuziyili.module.weather;

public class WeatherForecastDayDto {

  private final String date;
  private final String weatherText;
  private final String nightWeatherText;
  private final String windText;
  private final int hi;
  private final int lo;

  public WeatherForecastDayDto(
      String date,
      String weatherText,
      String nightWeatherText,
      String windText,
      int hi,
      int lo) {
    this.date = date;
    this.weatherText = weatherText;
    this.nightWeatherText = nightWeatherText;
    this.windText = windText;
    this.hi = hi;
    this.lo = lo;
  }

  public String getDate() {
    return date;
  }

  public String getWeatherText() {
    return weatherText;
  }

  public String getNightWeatherText() {
    return nightWeatherText;
  }

  public String getWindText() {
    return windText;
  }

  public int getHi() {
    return hi;
  }

  public int getLo() {
    return lo;
  }
}
