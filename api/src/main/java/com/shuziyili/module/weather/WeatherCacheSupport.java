package com.shuziyili.module.weather;

import com.shuziyili.module.news.NewsJsonSupport;
import java.time.Instant;
import java.util.Map;
import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 按 adcode 缓存天气 payload（腾讯 / Juhe 共用双重检查锁模板）。 */
final class WeatherCacheSupport {

  private static final Logger log = LoggerFactory.getLogger(WeatherCacheSupport.class);

  static final class Entry {
    final WeatherPayload payload;
    final Instant fetchedAt;

    Entry(WeatherPayload payload, Instant fetchedAt) {
      this.payload = payload;
      this.fetchedAt = fetchedAt;
    }
  }

  @FunctionalInterface
  interface RemoteFetcher {
    WeatherPayload fetch() throws Exception;
  }

  private WeatherCacheSupport() {}

  static WeatherPayload load(
      String adcode,
      int refreshSeconds,
      int maxCacheSize,
      Map<String, Entry> cacheByAdcode,
      Map<String, Object> adcodeLocks,
      RemoteFetcher fetchRemote,
      Function<String, WeatherPayload> emptyOnFail,
      String logTag) {
    Instant now = Instant.now();
    Entry cached = cacheByAdcode.get(adcode);
    if (cached != null
        && !NewsJsonSupport.refreshCooldownElapsed(cached.fetchedAt, now, refreshSeconds)) {
      return cached.payload;
    }

    Object adcodeLock = adcodeLocks.computeIfAbsent(adcode, ignored -> new Object());
    synchronized (adcodeLock) {
      cached = cacheByAdcode.get(adcode);
      if (cached != null
          && !NewsJsonSupport.refreshCooldownElapsed(cached.fetchedAt, now, refreshSeconds)) {
        return cached.payload;
      }
      try {
        WeatherPayload payload = fetchRemote.fetch();
        putEntry(cacheByAdcode, adcode, new Entry(payload, now), maxCacheSize);
        return payload;
      } catch (Exception e) {
        log.warn("{} weather fetch failed adcode={}: {}", logTag, adcode, e.getMessage());
        cached = cacheByAdcode.get(adcode);
        if (cached != null) {
          return cached.payload;
        }
        return emptyOnFail.apply(adcode);
      }
    }
  }

  static void putEntry(
      Map<String, Entry> cacheByAdcode, String adcode, Entry entry, int maxCacheSize) {
    cacheByAdcode.put(adcode, entry);
    while (cacheByAdcode.size() > maxCacheSize) {
      String eldest = cacheByAdcode.keySet().iterator().next();
      cacheByAdcode.remove(eldest);
    }
  }
}
