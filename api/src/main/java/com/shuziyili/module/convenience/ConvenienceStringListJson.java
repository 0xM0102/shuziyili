package com.shuziyili.module.convenience;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

final class ConvenienceStringListJson {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private ConvenienceStringListJson() {}

  static String encode(List<String> items) {
    try {
      return MAPPER.writeValueAsString(normalize(items));
    } catch (Exception e) {
      return "[]";
    }
  }

  static List<String> decode(String json) {
    if (json == null || json.isBlank()) {
      return List.of();
    }
    try {
      String[] values = MAPPER.readValue(json, String[].class);
      return normalize(Arrays.asList(values));
    } catch (Exception e) {
      return List.of();
    }
  }

  static List<String> fromMultilineText(String text) {
    if (text == null || text.isBlank()) {
      return List.of();
    }
    return normalize(Arrays.asList(text.split("\\R")));
  }

  private static List<String> normalize(List<String> items) {
    if (items == null || items.isEmpty()) {
      return List.of();
    }
    return items.stream()
        .filter(v -> v != null && !v.isBlank())
        .map(String::trim)
        .distinct()
        .collect(Collectors.toList());
  }
}
