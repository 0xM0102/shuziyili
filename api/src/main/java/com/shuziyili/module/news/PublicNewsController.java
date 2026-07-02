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

  private final NewsService newsService;

  public PublicNewsController(NewsService newsService) {
    this.newsService = newsService;
  }

  /**
   * 新闻列表（进程内缓存）。{@code type} 为侧栏频道 slug（如 top、guonei）；Juhe 作头条 type，TianAPI 作地区 word，腾讯作热点榜或搜索。
   */
  @GetMapping("/headlines")
  public ResponseEntity<ApiResponse<NewsHeadlinesPayload>> headlines(
      @RequestParam(value = "type", required = false) String type) {
    return ResponseEntity.ok(ApiResponse.success(newsService.headlines(type)));
  }

  @GetMapping("/headlines/{uniquekey:.+}")
  public ResponseEntity<ApiResponse<Map<String, Object>>> headlineDetail(
      @PathVariable("uniquekey") String uniquekey,
      @RequestParam(value = "type", required = false) String type) {
    return newsService
        .headlineDetail(uniquekey, type)
        .map((d) -> ResponseEntity.ok(ApiResponse.success(toDetailJson(d))))
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  private Map<String, Object> toDetailJson(NewsDetailResult detail) {
    Map<String, Object> m = new LinkedHashMap<>(4);
    m.put("item", detail.getItem());
    m.put("contentHtml", detail.getContentHtml());
    m.put("attribution", newsService.attribution());
    return m;
  }
}
