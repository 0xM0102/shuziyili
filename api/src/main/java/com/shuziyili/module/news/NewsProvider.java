package com.shuziyili.module.news;

import java.util.Optional;

/** 资讯列表/详情上游适配器；Juhe 与 TianAPI 各一实现，由 {@link NewsService} 按配置择一调用。 */
public interface NewsProvider {

  NewsProviderId id();

  NewsHeadlinesPayload headlines(String channelType);

  Optional<NewsDetailResult> headlineDetail(String uniquekey);

  default Optional<NewsDetailResult> headlineDetail(String uniquekey, String channelType) {
    return headlineDetail(uniquekey);
  }

  /** 详情页「数据来源」说明文案。 */
  String attribution();
}
