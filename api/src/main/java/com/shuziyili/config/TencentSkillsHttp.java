package com.shuziyili.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.module.news.NewsJsonSupport;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

/** 腾讯 Skills OpenAPI 共用 POST JSON（新闻 / 天气）。 */
public final class TencentSkillsHttp {

  private TencentSkillsHttp() {}

  public static String postJson(
      RestTemplate restTemplate,
      ObjectMapper objectMapper,
      String baseUrl,
      String apiKey,
      String callerSkill,
      String path,
      Map<String, Object> body)
      throws Exception {
    String base = baseUrl == null ? "" : baseUrl.trim();
    if (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(apiKey.trim());
    if (NewsJsonSupport.notBlank(callerSkill)) {
      headers.set("Caller-Skill", callerSkill.trim());
    }
    String json = objectMapper.writeValueAsString(body);
    HttpEntity<String> entity = new HttpEntity<>(json, headers);
    return restTemplate.postForObject(base + path, entity, String.class);
  }
}
