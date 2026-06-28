package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** 资讯 / 腾讯 OpenAPI 适配器共用的 JSON 字段读取、HTML 片段与缓存冷却判断。 */
public final class NewsJsonSupport {

  private NewsJsonSupport() {}

  public static String text(JsonNode node, String field) {
    JsonNode value = node.path(field);
    return value.isMissingNode() || value.isNull() ? "" : value.asText("").trim();
  }

  public static boolean notBlank(String s) {
    return s != null && !s.isBlank();
  }

  public static String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value.trim();
      }
    }
    return "";
  }

  public static boolean refreshCooldownElapsed(Instant lastAttempt, Instant now, int refreshSeconds) {
    if (lastAttempt == null) {
      return true;
    }
    return Duration.between(lastAttempt, now).getSeconds() >= refreshSeconds;
  }

  /** 纯文本摘要包一层 {@code <p>}；已是 HTML 则原样返回。 */
  static String abstractToHtml(String abstractText) {
    if (!notBlank(abstractText)) {
      return "";
    }
    if (abstractText.contains("<") && abstractText.contains(">")) {
      return abstractText;
    }
    return "<p>" + escapeMinimalHtml(abstractText) + "</p>";
  }

  static String escapeMinimalHtml(String text) {
    return text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
  }

  /** 合并各频道槽中的条目索引；同 key 保留先出现的条目。 */
  static Map<String, NewsItemDto> indexItemsFirstWins(Iterable<Iterable<NewsItemDto>> slotItemLists) {
    Map<String, NewsItemDto> index = new LinkedHashMap<>();
    for (Iterable<NewsItemDto> slotItems : slotItemLists) {
      for (NewsItemDto item : slotItems) {
        index.putIfAbsent(item.getUniquekey(), item);
      }
    }
    return Collections.unmodifiableMap(index);
  }

  /** 合并各频道槽中的补充字段（正文、摘要等）。 */
  static Map<String, String> mergeStringMaps(Iterable<Map<String, String>> maps) {
    Map<String, String> merged = new LinkedHashMap<>();
    for (Map<String, String> map : maps) {
      merged.putAll(map);
    }
    return Collections.unmodifiableMap(merged);
  }
}
