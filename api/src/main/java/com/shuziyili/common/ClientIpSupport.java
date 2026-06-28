package com.shuziyili.common;

import javax.servlet.http.HttpServletRequest;

public final class ClientIpSupport {

  private ClientIpSupport() {}

  public static String resolveClientIp(HttpServletRequest request) {
    if (request == null) {
      return "";
    }
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      String first = forwarded.split(",")[0].trim();
      if (!first.isEmpty()) {
        return first;
      }
    }
    String realIp = request.getHeader("X-Real-IP");
    if (realIp != null && !realIp.isBlank()) {
      return realIp.trim();
    }
    return request.getRemoteAddr() == null ? "" : request.getRemoteAddr();
  }
}
