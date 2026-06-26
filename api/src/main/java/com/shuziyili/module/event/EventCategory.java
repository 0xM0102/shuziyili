package com.shuziyili.module.event;

/** 与门户 {@code web/lib/events-data.ts} 分类一致。 */
public final class EventCategory {
  public static final String MARKET = "market";
  public static final String EXHIBITION = "exhibition";
  public static final String SHOW = "show";
  public static final String FAMILY = "family";
  public static final String SPORTS = "sports";

  private EventCategory() {}

  public static boolean isValid(String value) {
    return MARKET.equals(value)
        || EXHIBITION.equals(value)
        || SHOW.equals(value)
        || FAMILY.equals(value)
        || SPORTS.equals(value);
  }
}
