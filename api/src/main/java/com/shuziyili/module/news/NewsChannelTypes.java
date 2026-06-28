package com.shuziyili.module.news;

import java.util.List;
import java.util.Map;

/**
 * 资讯侧栏频道 slug（与门户 {@code web/lib/news-channels.ts} 一致）。
 *
 * <ul>
 *   <li>Juhe：列表 {@code type} 参数
 *   <li>TianAPI：{@code top} 仅按地区；其余频道映射为 {@code word}
 *   <li>腾讯：{@code top} 走热点榜；其余频道走搜索关键词
 * </ul>
 */
public final class NewsChannelTypes {

  public static final String TOP = "top";

  public static final List<String> ORDERED =
      List.of(
          TOP,
          "shehui",
          "guonei",
          "guoji",
          "yule",
          "tiyu",
          "junshi",
          "keji",
          "caijing",
          "shishang");

  private static final Map<String, String> CHANNEL_LABELS =
      Map.ofEntries(
          Map.entry(TOP, "头条"),
          Map.entry("shehui", "社会"),
          Map.entry("guonei", "国内"),
          Map.entry("guoji", "国际"),
          Map.entry("yule", "娱乐"),
          Map.entry("tiyu", "体育"),
          Map.entry("junshi", "军事"),
          Map.entry("keji", "科技"),
          Map.entry("caijing", "财经"),
          Map.entry("shishang", "时尚"));

  /** 非头条频道的中文检索词（TianAPI {@code word}、腾讯 {@code search} 共用）。 */
  private static final Map<String, String> CHANNEL_KEYWORDS =
      Map.ofEntries(
          Map.entry("shehui", "社会"),
          Map.entry("guonei", "国内"),
          Map.entry("guoji", "国际"),
          Map.entry("yule", "娱乐"),
          Map.entry("tiyu", "体育"),
          Map.entry("junshi", "军事"),
          Map.entry("keji", "科技"),
          Map.entry("caijing", "财经"),
          Map.entry("shishang", "时尚"));

  private NewsChannelTypes() {}

  public static String normalize(String raw) {
    if (raw == null || raw.isBlank()) {
      return TOP;
    }
    String t = raw.trim().toLowerCase();
    return ORDERED.contains(t) ? t : TOP;
  }

  public static String labelForChannel(String channel) {
    return CHANNEL_LABELS.getOrDefault(normalize(channel), "头条");
  }

  /** 腾讯 {@code search} 检索词：无匹配时回退为频道中文名。 */
  public static String tencentSearchQueryForChannel(String channel) {
    String normalized = normalize(channel);
    if (TOP.equals(normalized)) {
      return "";
    }
    String keyword = CHANNEL_KEYWORDS.get(normalized);
    if (NewsJsonSupport.notBlank(keyword)) {
      return keyword;
    }
    return labelForChannel(normalized);
  }

  /** TianAPI {@code word}：无映射时不传关键词。 */
  public static String tianKeywordForChannel(String channel) {
    String normalized = normalize(channel);
    if (TOP.equals(normalized)) {
      return "";
    }
    return CHANNEL_KEYWORDS.getOrDefault(normalized, "");
  }
}
