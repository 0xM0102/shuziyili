package com.shuziyili.config;

import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties({
  CorsProperties.class,
  NewsProperties.class,
  JuheNewsProperties.class,
  TianAreaNewsProperties.class,
  TencentNewsProperties.class,
  TencentWeatherProperties.class
})
public class WebMvcConfig implements WebMvcConfigurer {

  private final CorsProperties corsProperties;

  public WebMvcConfig(CorsProperties corsProperties) {
    this.corsProperties = corsProperties;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    List<String> patterns = corsProperties.getAllowedOriginPatterns();
    if (patterns.isEmpty()) {
      patterns =
          List.of(
              "http://localhost:*",
              "http://127.0.0.1:*",
              "http://localhost:5174",
              "http://127.0.0.1:5174");
    }
    registry
        .addMapping("/api/**")
        .allowedOriginPatterns(patterns.toArray(String[]::new))
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
