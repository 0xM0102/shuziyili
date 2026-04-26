package com.shuziyili.module.news;

import com.shuziyili.common.ApiResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/news")
public class PublicNewsController {

  private static final String ATTRIBUTION =
      "头条资讯数据来自聚合数据「新闻头条」列表与「新闻详情」接口（https://www.juhe.cn/docs/api/id/235），"
          + "正文 HTML 由上游返回，本站已做基础过滤；完整内容亦可查看原文链接。数据按服务端缓存展示并计入上游配额。";

  private final JuheNewsCacheService juheNewsCacheService;

  public PublicNewsController(JuheNewsCacheService juheNewsCacheService) {
    this.juheNewsCacheService = juheNewsCacheService;
  }

  /**
   * 新闻列表（进程内缓存）。{@code type} 与聚合「新闻头条」接口一致（如 top、guonei）；缺省或非法值按 {@code top}。
   */
  @GetMapping("/headlines")
  public ResponseEntity<ApiResponse<NewsHeadlinesPayload>> headlines(
      @RequestParam(value = "type", required = false) String type) {
    return ResponseEntity.ok(ApiResponse.success(juheNewsCacheService.headlines(type)));
  }

  @GetMapping("/headlines/{uniquekey:.+}")
  public ResponseEntity<ApiResponse<Map<String, Object>>> headlineDetail(
      @PathVariable("uniquekey") String uniquekey) {
    return juheNewsCacheService
        .headlineDetail(uniquekey)
        .map((d) -> ResponseEntity.ok(ApiResponse.success(toDetailJson(d))))
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  private Map<String, Object> toDetailJson(NewsDetailResult detail) {
    Map<String, Object> m = new LinkedHashMap<>(4);
    m.put("item", detail.getItem());
    m.put("contentHtml", detail.getContentHtml());
    m.put("attribution", ATTRIBUTION);
    return m;
  }
}
