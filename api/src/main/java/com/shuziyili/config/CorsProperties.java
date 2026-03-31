package com.shuziyili.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "shuziyili.cors")
public class CorsProperties {

  /** 逗号分隔，便于生产环境用单个环境变量注入（如 CORS_ALLOWED_ORIGINS）。 */
  private String allowedOriginPatternsCsv;

  private List<String> allowedOriginPatterns = new ArrayList<>();

  public List<String> getAllowedOriginPatterns() {
    if (allowedOriginPatternsCsv != null && !allowedOriginPatternsCsv.isBlank()) {
      List<String> fromCsv =
          Arrays.stream(allowedOriginPatternsCsv.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .collect(Collectors.toList());
      // 避免 CORS_ALLOWED_ORIGINS="," 等解析成空列表时误放行「无 Origin」
      if (!fromCsv.isEmpty()) {
        return fromCsv;
      }
    }
    if (allowedOriginPatterns != null && !allowedOriginPatterns.isEmpty()) {
      return allowedOriginPatterns;
    }
    return defaultLocalOriginPatterns();
  }

  private static List<String> defaultLocalOriginPatterns() {
    return List.of(
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://localhost:5174",
        "http://127.0.0.1:5174");
  }

  public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
    this.allowedOriginPatterns = allowedOriginPatterns;
  }

  public String getAllowedOriginPatternsCsv() {
    return allowedOriginPatternsCsv;
  }

  public void setAllowedOriginPatternsCsv(String allowedOriginPatternsCsv) {
    this.allowedOriginPatternsCsv = allowedOriginPatternsCsv;
  }
}
