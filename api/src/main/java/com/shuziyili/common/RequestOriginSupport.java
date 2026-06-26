package com.shuziyili.common;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;

/** 从发码请求解析来源站点，供 {@code sms_codes.request_origin} 审计。 */
public final class RequestOriginSupport {

  private static final int MAX_LEN = 255;

  private RequestOriginSupport() {}

  /**
   * 优先 {@code Origin}，其次 {@code Referer} 的 scheme+host，再 {@code X-Forwarded-*} / {@code Host}。
   * 服务端直连无浏览器头时可能为 {@code null} 或 {@code localhost:8080}。
   */
  public static String resolve(HttpServletRequest request) {
    if (request == null) {
      return null;
    }
    String origin = trimHeader(request.getHeader("Origin"));
    if (origin != null) {
      return clamp(origin);
    }
    String fromReferer = originFromReferer(trimHeader(request.getHeader("Referer")));
    if (fromReferer != null) {
      return clamp(fromReferer);
    }
    String forwardedHost = firstCsv(trimHeader(request.getHeader("X-Forwarded-Host")));
    if (forwardedHost != null) {
      String proto = firstCsv(trimHeader(request.getHeader("X-Forwarded-Proto")));
      if (proto != null) {
        return clamp(proto + "://" + stripPort(forwardedHost));
      }
      return clamp(forwardedHost);
    }
    String host = trimHeader(request.getHeader("Host"));
    if (host != null) {
      return clamp(host);
    }
    return null;
  }

  private static String originFromReferer(String referer) {
    if (referer == null || referer.isBlank()) {
      return null;
    }
    try {
      URI uri = URI.create(referer);
      String scheme = uri.getScheme();
      String h = uri.getHost();
      if (h == null || h.isBlank()) {
        return null;
      }
      if (scheme != null && !scheme.isBlank()) {
        int port = uri.getPort();
        if (port > 0 && !isDefaultPort(scheme, port)) {
          return scheme + "://" + h + ":" + port;
        }
        return scheme + "://" + h;
      }
      return h;
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private static boolean isDefaultPort(String scheme, int port) {
    return ("http".equalsIgnoreCase(scheme) && port == 80)
        || ("https".equalsIgnoreCase(scheme) && port == 443);
  }

  private static String stripPort(String hostWithMaybePort) {
    int idx = hostWithMaybePort.indexOf(':');
    return idx > 0 ? hostWithMaybePort.substring(0, idx) : hostWithMaybePort;
  }

  private static String firstCsv(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    int comma = value.indexOf(',');
    return (comma > 0 ? value.substring(0, comma) : value).trim();
  }

  private static String trimHeader(String value) {
    if (value == null) {
      return null;
    }
    String t = value.trim();
    return t.isEmpty() ? null : t;
  }

  private static String clamp(String value) {
    if (value == null) {
      return null;
    }
    return value.length() <= MAX_LEN ? value : value.substring(0, MAX_LEN);
  }
}
