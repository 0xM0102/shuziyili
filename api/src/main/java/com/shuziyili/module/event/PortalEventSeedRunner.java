package com.shuziyili.module.event;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 首次启动写入原门户硬编码活动，便于联调与迁移。 */
@Component
public class PortalEventSeedRunner implements ApplicationRunner {

  private final PortalEventRepository repository;
  private final Clock clock = Clock.systemUTC();

  public PortalEventSeedRunner(PortalEventRepository repository) {
    this.repository = repository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (repository.count() > 0) {
      return;
    }
    long now = clock.millis();
    seed(
        "yili-marathon-2026",
        "2026 伊犁河谷马拉松",
        "设全程、半程与欢乐跑三个组别，串联城市与河谷景观，是本季重点赛事活动。",
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80",
        "伊宁市滨河大道（市民广场起终点）",
        EventCategory.SPORTS,
        "2026-05-01T07:30:00+08:00",
        "2026-05-01T13:30:00+08:00",
        "伊犁州文旅局 / 伊宁市体育局",
        "https://example.com/yili-marathon-2026",
        List.of("全程/半程/欢乐跑分组", "官方补给站与医疗点全程覆盖", "赛事包与完赛纪念奖牌"),
        0,
        now);
    seed(
        "yili-reading-fair",
        "伊宁城市阅读周",
        "围绕阅读推广与地方文化设置主题展区，含作者分享与亲子阅读活动。",
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        "伊宁市图书馆 主会场",
        EventCategory.EXHIBITION,
        "2026-04-28T10:00:00+08:00",
        "2026-05-02T18:00:00+08:00",
        "伊宁市图书馆",
        null,
        List.of("城市阅读论坛", "亲子共读活动", "地方文化主题展区"),
        1,
        now);
    seed(
        "liuxing-street-weekend-market",
        "六星街周末创意市集",
        "聚焦本地文创、手作与特色轻食，面向游客与本地居民开放。",
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
        "伊宁市 六星街步行区",
        EventCategory.MARKET,
        "2026-05-16T11:00:00+08:00",
        "2026-05-17T21:00:00+08:00",
        "六星街街区运营中心",
        null,
        List.of("文创摊位集合", "街头演出联动", "夜间延时营业"),
        2,
        now);
  }

  private void seed(
      String id,
      String title,
      String summary,
      String coverUrl,
      String location,
      String category,
      String startsIso,
      String endsIso,
      String organizer,
      String registerUrl,
      List<String> highlights,
      int sortOrder,
      long now) {
    PortalEventEntity e = new PortalEventEntity();
    e.setId(id);
    e.setTitle(title);
    e.setSummary(summary);
    e.setCoverUrl(coverUrl);
    e.setLocation(location);
    e.setCategory(category);
    e.setStartsAt(OffsetDateTime.parse(startsIso).toInstant().toEpochMilli());
    e.setEndsAt(OffsetDateTime.parse(endsIso).toInstant().toEpochMilli());
    e.setOrganizer(organizer);
    e.setRegisterUrl(registerUrl);
    e.setHighlightsJson(EventHighlightsJson.encode(highlights));
    e.setPublished(true);
    e.setSortOrder(sortOrder);
    e.setCreatedAt(now);
    e.setUpdatedAt(now);
    repository.save(e);
  }
}
