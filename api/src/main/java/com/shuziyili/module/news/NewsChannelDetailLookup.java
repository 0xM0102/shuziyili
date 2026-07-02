package com.shuziyili.module.news;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** 在分频道缓存中查找详情条目：优先刷新来源频道，再兜底刷新头条与侧栏频道。 */
final class NewsChannelDetailLookup {

  interface Refresher {
    void refreshIfStale(String channel);
  }

  static NewsItemDto findIndexedItem(
      String uniquekey,
      Map<String, NewsItemDto> index,
      Refresher refresher,
      String preferredChannel) {
    Set<String> checked = new LinkedHashSet<>();
    if (NewsJsonSupport.notBlank(preferredChannel)) {
      NewsItemDto item = refreshAndFind(
          uniquekey, index, refresher, NewsChannelTypes.normalize(preferredChannel), checked);
      if (item != null) {
        return item;
      }
    }
    NewsItemDto item = refreshAndFind(
        uniquekey, index, refresher, NewsChannelTypes.TOP, checked);
    if (item != null) {
      return item;
    }
    for (String channel : NewsChannelTypes.ORDERED) {
      item = refreshAndFind(uniquekey, index, refresher, channel, checked);
      if (item != null) {
        return item;
      }
    }
    return null;
  }

  /** 列表缓存 + 副文本 Map 的详情（天聚 / 腾讯：无独立正文接口）。 */
  static Optional<NewsDetailResult> detailFromListCache(
      String uniquekey,
      String channelType,
      Map<String, NewsItemDto> index,
      Map<String, String> htmlByKey,
      Refresher refresher) {
    if (!NewsJsonSupport.notBlank(uniquekey)) {
      return Optional.empty();
    }
    String key = uniquekey.trim();
    NewsItemDto item = findIndexedItem(key, index, refresher, channelType);
    if (item == null) {
      return Optional.empty();
    }
    return Optional.of(new NewsDetailResult(item, htmlByKey.getOrDefault(key, "")));
  }

  private static NewsItemDto refreshAndFind(
      String uniquekey,
      Map<String, NewsItemDto> index,
      Refresher refresher,
      String channel,
      Set<String> checked) {
    if (!checked.add(channel)) {
      return null;
    }
    refresher.refreshIfStale(channel);
    return index.get(uniquekey);
  }

  private NewsChannelDetailLookup() {}
}
