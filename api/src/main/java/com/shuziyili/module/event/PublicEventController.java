package com.shuziyili.module.event;

import com.shuziyili.common.ApiResponse;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
public class PublicEventController {

  private final PortalEventQueryService queryService;
  private final Clock clock = Clock.systemUTC();

  public PublicEventController(PortalEventQueryService queryService) {
    this.queryService = queryService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String category) {
    long now = clock.millis();
    List<Map<String, Object>> items =
        PortalEventMapper.toPublicDtos(queryService.listPublished(status, category, now));
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items, "updatedAt", now)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable("id") String id) {
    return queryService
        .findPublishedById(id)
        .map(e -> ResponseEntity.ok(ApiResponse.success(PortalEventMapper.toPublicDto(e))))
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }
}
