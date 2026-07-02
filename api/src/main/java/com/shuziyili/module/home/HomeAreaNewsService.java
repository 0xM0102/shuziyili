package com.shuziyili.module.home;

import com.shuziyili.module.news.NewsAttributions;
import com.shuziyili.module.news.NewsChannelTypes;
import com.shuziyili.module.news.NewsHeadlinesPayload;
import com.shuziyili.module.news.NewsItemDto;
import com.shuziyili.module.news.TianAreaNewsProvider;
import com.shuziyili.module.settings.PortalSettingsService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/** 首页「地区资讯」：天聚地区新闻，Provider/地区名由 {@link PortalSettingsService} 控制。 */
@Service
public class HomeAreaNewsService {

  private static final int HOME_LIMIT = 6;

  private final TianAreaNewsProvider tianAreaNewsProvider;
  private final PortalSettingsService portalSettingsService;

  public HomeAreaNewsService(
      TianAreaNewsProvider tianAreaNewsProvider, PortalSettingsService portalSettingsService) {
    this.tianAreaNewsProvider = tianAreaNewsProvider;
    this.portalSettingsService = portalSettingsService;
  }

  public Map<String, Object> publicAreaNews() {
    String regionName = portalSettingsService.effectiveTianapiAreaname();
    if (!portalSettingsService.isHomeAreaNewsEnabled()) {
      return buildPayload(false, regionName, List.of(), false, null, "");
    }

    NewsHeadlinesPayload payload = tianAreaNewsProvider.headlines(NewsChannelTypes.TOP);
    List<Map<String, Object>> rows =
        payload.getItems().stream()
            .limit(HOME_LIMIT)
            .map(this::toRow)
            .collect(Collectors.toList());

    return buildPayload(
        true,
        regionName,
        rows,
        payload.isUpstreamConfigured(),
        payload.getCachedAtEpochMs(),
        NewsAttributions.TIANAPI);
  }

  private static Map<String, Object> buildPayload(
      boolean enabled,
      String regionName,
      List<Map<String, Object>> items,
      boolean upstreamConfigured,
      Long cachedAtEpochMs,
      String attribution) {
    Map<String, Object> body = new LinkedHashMap<>(6);
    body.put("enabled", enabled);
    body.put("items", items);
    body.put("regionName", regionName);
    body.put("upstreamConfigured", upstreamConfigured);
    body.put("cachedAtEpochMs", cachedAtEpochMs);
    body.put("attribution", attribution);
    return body;
  }

  private Map<String, Object> toRow(NewsItemDto item) {
    Map<String, Object> row = new LinkedHashMap<>(8);
    row.put("uniquekey", item.getUniquekey());
    row.put("title", item.getTitle());
    row.put("date", item.getDate());
    row.put("category", item.getCategory());
    row.put("authorName", item.getAuthorName());
    row.put("url", item.getUrl());
    row.put("thumbnailUrl", item.getThumbnailUrl());
    row.put("summary", tianAreaNewsProvider.summaryFor(item.getUniquekey()));
    return row;
  }
}
