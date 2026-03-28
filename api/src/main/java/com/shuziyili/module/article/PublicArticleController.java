package com.shuziyili.module.article;

import com.shuziyili.common.ApiResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/articles")
public class PublicArticleController {

  private final ArticleRepository articleRepository;

  public PublicArticleController(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable("id") String id) {
    if (id == null || id.isBlank()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    return articleRepository
        .findByIdAndStatus(id, "published")
        .map(
            (a) ->
                ResponseEntity.ok(ApiResponse.success(toMap(a))))
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  private Map<String, Object> toMap(ArticleEntity a) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", a.getId());
    m.put("title", a.getTitle());
    m.put("summary", a.getSummary());
    m.put("content", a.getContent());
    m.put("coverUrl", a.getCoverUrl());
    m.put("updatedAt", a.getUpdatedAt());
    return m;
  }
}

