package com.shuziyili.module.news;

import com.shuziyili.config.NewsProperties;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** 门户资讯门面：根据 {@link NewsProperties#resolveProviderId()} 委托具体上游 Provider。 */
@Service
public class NewsService {

  private final Map<NewsProviderId, NewsProvider> providers;
  private final NewsProperties newsProperties;

  public NewsService(
      NewsProperties newsProperties,
      JuheNewsProvider juheNewsProvider,
      TianAreaNewsProvider tianAreaNewsProvider,
      TencentNewsProvider tencentNewsProvider) {
    this.newsProperties = newsProperties;
    this.providers =
        Map.of(
            NewsProviderId.JUHE, juheNewsProvider,
            NewsProviderId.TIANAPI, tianAreaNewsProvider,
            NewsProviderId.TENCENT, tencentNewsProvider);
  }

  public NewsHeadlinesPayload headlines(String channelType) {
    return activeProvider().headlines(channelType);
  }

  public Optional<NewsDetailResult> headlineDetail(String uniquekey) {
    return activeProvider().headlineDetail(uniquekey);
  }

  public Optional<NewsDetailResult> headlineDetail(String uniquekey, String channelType) {
    return activeProvider().headlineDetail(uniquekey, channelType);
  }

  public String attribution() {
    return activeProvider().attribution();
  }

  public NewsProviderId activeProviderId() {
    return activeProvider().id();
  }

  private NewsProvider activeProvider() {
    NewsProviderId id = newsProperties.resolveProviderId();
    return providers.getOrDefault(id, providers.get(NewsProviderId.JUHE));
  }
}
