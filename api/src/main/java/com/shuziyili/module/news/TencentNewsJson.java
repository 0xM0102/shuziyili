package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 腾讯新闻 OpenAPI 响应解析（热点榜 / 搜索共用 {@code news_list} 结构）。 */
final class TencentNewsJson {

  private static final Logger log = LoggerFactory.getLogger(TencentNewsJson.class);

  static final String ARTICLE_URL_PATTERN = "https://view.inews.qq.com/a/%s";

  private TencentNewsJson() {}

  static NewsListBatch parseListResponse(
      ObjectMapper objectMapper, String body, String channelLabel) throws Exception {
    if (body == null || body.isBlank()) {
      return NewsListBatch.empty();
    }
    JsonNode root = objectMapper.readTree(body);
    JsonNode baseRsp = root.path("base_rsp");
    int code = baseRsp.path("code").asInt(-1);
    if (code != 0) {
      log.warn("tencent news code={} msg={}", code, baseRsp.path("msg").asText(""));
      return NewsListBatch.empty();
    }
    JsonNode listNode = extractNewsListNode(root);
    if (listNode == null || !listNode.isArray()) {
      return NewsListBatch.empty();
    }
    List<NewsItemDto> items = new ArrayList<>();
    Map<String, String> bodies = new LinkedHashMap<>();
    for (JsonNode node : listNode) {
      MappedNode mapped = mapNewsNode(node, channelLabel);
      if (mapped != null) {
        items.add(mapped.item);
        if (NewsJsonSupport.notBlank(mapped.bodyHtml)) {
          bodies.put(mapped.item.getUniquekey(), mapped.bodyHtml);
        }
      }
    }
    return new NewsListBatch(items, bodies);
  }

  /** 热点榜返回根级 {@code news_list}；搜索等接口可能在 {@code data.news_list}。 */
  static JsonNode extractNewsListNode(JsonNode root) {
    JsonNode atRoot = root.path("news_list");
    if (atRoot.isArray()) {
      return atRoot;
    }
    JsonNode inData = root.path("data").path("news_list");
    if (inData.isArray()) {
      return inData;
    }
    return null;
  }

  private static MappedNode mapNewsNode(JsonNode node, String categoryLabel) {
    String id = NewsJsonSupport.text(node, "id");
    String title = NewsJsonSupport.text(node, "title");
    if (id.isEmpty() || title.isEmpty()) {
      return null;
    }
    NewsItemDto item =
        new NewsItemDto(
            id,
            title,
            formatPublishedAt(node),
            categoryLabel,
            authorFromNode(node),
            articleUrl(node, id),
            NewsJsonSupport.text(node, "cover_image"));
    return new MappedNode(item, bodyHtmlFromNode(node));
  }

  private static String formatPublishedAt(JsonNode node) {
    String time = NewsJsonSupport.text(node, "time");
    if (NewsJsonSupport.notBlank(time)) {
      return time;
    }
    String timestamp = NewsJsonSupport.text(node, "timestamp");
    if (!NewsJsonSupport.notBlank(timestamp)) {
      return "";
    }
    try {
      long epochSeconds = Long.parseLong(timestamp.trim());
      return Instant.ofEpochSecond(epochSeconds)
          .atZone(ZoneId.of("Asia/Shanghai"))
          .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    } catch (NumberFormatException e) {
      return timestamp;
    }
  }

  private static String authorFromNode(JsonNode node) {
    String source = NewsJsonSupport.text(node, "source");
    if (NewsJsonSupport.notBlank(source)) {
      return source;
    }
    return NewsJsonSupport.text(node.path("user_info"), "nick");
  }

  private static String articleUrl(JsonNode node, String id) {
    String url = NewsJsonSupport.text(node, "url");
    if (NewsJsonSupport.notBlank(url)) {
      return url;
    }
    return String.format(ARTICLE_URL_PATTERN, id);
  }

  private static String bodyHtmlFromNode(JsonNode node) {
    String html = NewsJsonSupport.text(node, "news_content");
    if (NewsJsonSupport.notBlank(html)) {
      return html;
    }
    return NewsJsonSupport.abstractToHtml(NewsJsonSupport.text(node, "abstract"));
  }

  private static final class MappedNode {
    final NewsItemDto item;
    final String bodyHtml;

    MappedNode(NewsItemDto item, String bodyHtml) {
      this.item = item;
      this.bodyHtml = bodyHtml == null ? "" : bodyHtml;
    }
  }
}
