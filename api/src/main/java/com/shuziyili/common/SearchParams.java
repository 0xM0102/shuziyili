package com.shuziyili.common;

/**
 * 管理端列表接口的查询串归一化：{@code null} 与纯空白视为「不过滤」，与前端 {@code ?q=} 约定一致。
 */
public final class SearchParams {

  private SearchParams() {}

  public static String normalizedOrEmpty(String raw) {
    return raw == null ? "" : raw.trim();
  }
}
