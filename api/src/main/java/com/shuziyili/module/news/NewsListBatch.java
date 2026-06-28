package com.shuziyili.module.news;

import java.util.List;
import java.util.Map;

/** 上游列表解析结果：条目 + 按 {@code uniquekey} 索引的补充字段（正文 HTML、摘要等）。 */
final class NewsListBatch {

  final List<NewsItemDto> items;
  final Map<String, String> extraByKey;

  NewsListBatch(List<NewsItemDto> items, Map<String, String> extraByKey) {
    this.items = items;
    this.extraByKey = extraByKey;
  }

  static NewsListBatch empty() {
    return new NewsListBatch(List.of(), Map.of());
  }
}
