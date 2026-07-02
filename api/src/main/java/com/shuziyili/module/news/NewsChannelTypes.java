package com.shuziyili.module.news;

import java.util.List;
import java.util.Map;

/**
 * 资讯侧栏频道 slug（与门户 {@code web/lib/news-channels.ts} 一致）。
 *
 * <ul>
 *   <li>Juhe 头条：{@code type} 与侧栏 slug 一致（top、guonei…）
 *   <li>TianAPI 地区：{@code top} 仅按地区；其余频道映射为 {@code word}
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
  private static String nonTopKeyword(String normalized) {
    if (TOP.equals(normalized)) {
      return null;
    }
    return CHANNEL_LABELS.get(normalized);
  }

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
    String keyword = nonTopKeyword(normalized);
    if (NewsJsonSupport.notBlank(keyword)) {
      return keyword;
    }
    return labelForChannel(normalized);
  }

  /** TianAPI 地区新闻 {@code word}：头条不传，其余频道传中文检索词。 */
  public static String tianAreaNewsKeywordForChannel(String channel) {
    return nonTopKeyword(normalize(channel));
  }

  private NewsChannelTypes() {}
}
