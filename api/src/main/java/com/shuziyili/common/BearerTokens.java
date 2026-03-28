package com.shuziyili.common;

/**
 * 从 HTTP {@code Authorization} 头解析 Bearer token（各 Controller 共用，避免复制粘贴）。
 */
public final class BearerTokens {

  private BearerTokens() {}

  /** @return token 字符串；无法解析时返回 {@code null} */
  public static String extract(String authorization) {
    if (authorization == null) {
      return null;
    }
    String s = authorization.trim();
    if (!s.startsWith("Bearer ")) {
      return null;
    }
    String token = s.substring("Bearer ".length()).trim();
    return token.isEmpty() ? null : token;
  }
}
