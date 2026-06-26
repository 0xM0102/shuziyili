package com.shuziyili.module.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;

final class EventHighlightsJson {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final TypeReference<List<String>> LIST_STRING = new TypeReference<>() {};

  private EventHighlightsJson() {}

  static String encode(List<String> items) {
    List<String> safe = items == null ? List.of() : items;
    try {
      return MAPPER.writeValueAsString(safe);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  static List<String> decode(String json) {
    if (json == null || json.isBlank()) {
      return List.of();
    }
    try {
      List<String> parsed = MAPPER.readValue(json, LIST_STRING);
      return parsed == null ? List.of() : parsed;
    } catch (JsonProcessingException e) {
      return List.of();
    }
  }

  static List<String> fromMultilineText(String text) {
    if (text == null || text.isBlank()) {
      return List.of();
    }
    List<String> out = new ArrayList<>();
    for (String line : text.split("\\r?\\n")) {
      String t = line.trim();
      if (!t.isEmpty()) {
        out.add(t);
      }
    }
    return out;
  }
}
