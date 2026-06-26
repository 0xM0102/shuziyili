package com.shuziyili.module.convenience;

import java.util.Set;

public final class ConvenienceServiceStatus {

  public static final String COMMON = "common";
  public static final String EXTERNAL = "external";
  public static final String PENDING = "pending";
  public static final String VERIFIED = "verified";

  private static final Set<String> VALUES = Set.of(COMMON, EXTERNAL, PENDING, VERIFIED);

  private ConvenienceServiceStatus() {}

  public static boolean isValid(String status) {
    return status != null && VALUES.contains(status);
  }
}
