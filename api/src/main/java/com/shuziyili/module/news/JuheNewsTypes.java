package com.shuziyili.module.news;

import java.util.List;

/**
 * 聚合「新闻头条」接口的 type 参数（与文档一致）。非法或空值归一为 {@code top}。
 */
public final class JuheNewsTypes {

  /** 与 Juhe 文档顺序一致的频道列表，供前端 Tab 与后端校验共用。 */
  public static final List<String> ORDERED =
      List.of(
          "top",
          "shehui",
          "guonei",
          "guoji",
          "yule",
          "tiyu",
          "junshi",
          "keji",
          "caijing",
          "shishang");

  private JuheNewsTypes() {}

  public static String normalize(String raw) {
    if (raw == null || raw.isBlank()) {
      return "top";
    }
    String t = raw.trim().toLowerCase();
    return ORDERED.contains(t) ? t : "top";
  }
}
