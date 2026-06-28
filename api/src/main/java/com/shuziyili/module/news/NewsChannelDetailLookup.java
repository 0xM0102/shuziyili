package com.shuziyili.module.news;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** 在分频道缓存中查找详情条目：优先刷新来源频道，再兜底刷新头条与侧栏频道。 */
final class NewsChannelDetailLookup {

  interface Refresher {
    void refreshIfStale(String channel);
  }

  static NewsItemDto findIndexedItem(
      String uniquekey, Map<String, NewsItemDto> index, Refresher refresher) {
    return findIndexedItem(uniquekey, index, refresher, null);
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
    NewsItemDto item = index.get(uniquekey);
    if (item != null) {
      return item;
    }
    return null;
  }

  private NewsChannelDetailLookup() {}
}
