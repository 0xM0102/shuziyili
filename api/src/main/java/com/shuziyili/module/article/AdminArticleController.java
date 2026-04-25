package com.shuziyili.module.article;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.auth.StaffPermissionCodes;
import com.shuziyili.module.auth.StaffAuthService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/articles")
public class AdminArticleController {

  private final AdminArticleService articleService;
  private final StaffAuthService staffAuthService;

  public AdminArticleController(AdminArticleService articleService, StaffAuthService staffAuthService) {
    this.articleService = articleService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminArticleService.Article> items = articleService.list();
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminArticleService.Article>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminArticleService.Article created = articleService.create(req);
    return ResponseEntity.ok(ApiResponse.success(created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminArticleService.Article>> update(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminArticleService.UpdateResult r = articleService.update(id, req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.article));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    boolean ok = articleService.delete(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }

  public static class UpsertReq {
    public String title;
    public String summary;
    public String content;
    public String coverUrl;
    public String status; // draft | published
  }
}

