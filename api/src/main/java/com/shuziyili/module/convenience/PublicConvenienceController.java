package com.shuziyili.module.convenience;

import com.shuziyili.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/convenience")
public class PublicConvenienceController {

  private final ConvenienceQueryService queryService;

  public PublicConvenienceController(ConvenienceQueryService queryService) {
    this.queryService = queryService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<ConvenienceQueryService.PublicPayload>> list() {
    return ResponseEntity.ok(ApiResponse.success(queryService.load()));
  }
}
