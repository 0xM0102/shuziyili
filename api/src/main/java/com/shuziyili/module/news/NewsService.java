package com.shuziyili.module.news;

import com.shuziyili.module.settings.PortalSettingsService;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** 门户资讯门面：Provider 由 {@link PortalSettingsService}（DB）或 env 决定。 */
@Service
public class NewsService {

  private final Map<NewsProviderId, NewsProvider> providers;
  private final PortalSettingsService portalSettingsService;

  public NewsService(
      PortalSettingsService portalSettingsService,
      JuheNewsProvider juheNewsProvider,
      TianAreaNewsProvider tianAreaNewsProvider,
      TencentNewsProvider tencentNewsProvider) {
    this.portalSettingsService = portalSettingsService;
    this.providers =
        Map.of(
            NewsProviderId.JUHE, juheNewsProvider,
            NewsProviderId.TIANAPI, tianAreaNewsProvider,
            NewsProviderId.TENCENT, tencentNewsProvider);
  }

  public NewsHeadlinesPayload headlines(String channelType) {
    return activeProvider().headlines(channelType);
  }

  public Optional<NewsDetailResult> headlineDetail(String uniquekey, String channelType) {
    return activeProvider().headlineDetail(uniquekey, channelType);
  }

  public String attribution() {
    return activeProvider().attribution();
  }

  private NewsProvider activeProvider() {
    NewsProviderId id = portalSettingsService.resolveNewsProviderId();
    return providers.getOrDefault(id, providers.get(NewsProviderId.JUHE));
  }
}
