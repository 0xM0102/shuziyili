package com.shuziyili.module.banner;

/** 将 {@link BannerEntity} 转为前台 JSON，Home / Travel 等接口共用，避免各 Controller 重复拼装。 */
public final class BannerPublicMapper {

  private BannerPublicMapper() {}

  public static PublicBannerDto toPublicDto(BannerEntity e) {
    PublicBannerDto d = new PublicBannerDto();
    d.id = e.getId();
    d.title = e.getTitle();
    d.imageUrl = e.getImageUrl();
    d.linkUrl = e.getLinkUrl();
    String scopeRaw = e.getScope();
    String scope = scopeRaw != null ? BannerScope.normalize(scopeRaw) : "";
    if (scope.isEmpty()) {
      scope = BannerScope.HOME.code;
    }
    d.scope = scope;
    String slot = BannerSlot.normalize(e.getSlot());
    if (slot.isEmpty()) {
      slot = BannerSlot.defaultMainForScope(scope);
    }
    d.slot = slot;
    d.sortOrder = e.getSortOrder();
    return d;
  }
}
