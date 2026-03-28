package com.shuziyili.module.banner;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBannerService {

  private final Clock clock = Clock.systemUTC();
  private final BannerRepository bannerRepository;

  public AdminBannerService(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @Transactional(readOnly = true)
  public List<Banner> list() {
    return bannerRepository.findAllByOrderBySortOrderAscUpdatedAtDesc().stream()
        .map(this::toBanner)
        .collect(Collectors.toList());
  }

  @Transactional
  public UpdateResult create(AdminBannerController.UpsertReq req) {
    String slot = BannerSlot.normalize(req == null ? null : req.slot);
    if (slot.isEmpty()) {
      return UpdateResult.fail("invalid_slot");
    }
    if (isSingleSlot(slot) && bannerRepository.findFirstBySlotOrderByUpdatedAtDesc(slot).isPresent()) {
      return UpdateResult.fail("slot_taken");
    }
    BannerEntity b = new BannerEntity();
    apply(b, req);
    long now = clock.millis();
    b.setCreatedAt(now);
    b.setUpdatedAt(now);
    bannerRepository.save(b);
    return UpdateResult.ok(toBanner(b));
  }

  @Transactional
  public UpdateResult update(Long id, AdminBannerController.UpsertReq req) {
    if (id == null) return UpdateResult.fail("empty");
    Optional<BannerEntity> opt = bannerRepository.findById(id);
    if (opt.isEmpty()) return UpdateResult.fail("not_found");
    BannerEntity b = opt.get();
    String slot = BannerSlot.normalize(req == null ? null : req.slot);
    if (slot.isEmpty()) return UpdateResult.fail("invalid_slot");
    if (isSingleSlot(slot)) {
      Optional<BannerEntity> existing = bannerRepository.findFirstBySlotOrderByUpdatedAtDesc(slot);
      if (existing.isPresent() && !existing.get().getId().equals(id)) {
        return UpdateResult.fail("slot_taken");
      }
    }
    apply(b, req);
    b.setUpdatedAt(clock.millis());
    bannerRepository.save(b);
    return UpdateResult.ok(toBanner(b));
  }

  @Transactional
  public boolean delete(Long id) {
    if (id == null) return false;
    if (!bannerRepository.existsById(id)) return false;
    bannerRepository.deleteById(id);
    return true;
  }

  private void apply(BannerEntity b, AdminBannerController.UpsertReq req) {
    String title = req == null ? null : req.title;
    String imageUrl = req == null ? null : req.imageUrl;
    b.setTitle(title == null ? "" : title.trim());
    b.setImageUrl(imageUrl == null ? "" : imageUrl.trim());
    b.setLinkUrl(req == null ? null : req.linkUrl);
    String slot = BannerSlot.normalize(req == null ? null : req.slot);
    b.setSlot(slot.isEmpty() ? BannerSlot.HOME_MAIN.code() : slot);
    b.setEnabled(req != null && req.enabled != null ? req.enabled : true);
    b.setSortOrder(req != null && req.sortOrder != null ? req.sortOrder : 0);
  }

  private Banner toBanner(BannerEntity e) {
    Banner b = new Banner();
    b.id = e.getId();
    b.title = e.getTitle();
    b.imageUrl = e.getImageUrl();
    b.linkUrl = e.getLinkUrl();
    b.slot = BannerSlot.normalize(e.getSlot());
    if (b.slot.isEmpty()) b.slot = BannerSlot.HOME_MAIN.code();
    b.enabled = e.isEnabled();
    b.sortOrder = e.getSortOrder();
    b.createdAt = e.getCreatedAt();
    b.updatedAt = e.getUpdatedAt();
    return b;
  }

  public static class Banner {
    public Long id;
    public String title;
    public String imageUrl;
    public String linkUrl;
    public String slot;
    public boolean enabled;
    public int sortOrder;
    public long createdAt;
    public long updatedAt;
  }

  private boolean isSingleSlot(String slot) {
    return BannerSlot.HOME_SIDE_TOP.code().equals(slot)
        || BannerSlot.HOME_SIDE_BOTTOM.code().equals(slot);
  }

  public static class UpdateResult {
    public boolean ok;
    public String message;
    public Banner banner;

    static UpdateResult ok(Banner b) {
      UpdateResult r = new UpdateResult();
      r.ok = true;
      r.banner = b;
      return r;
    }

    static UpdateResult fail(String msg) {
      UpdateResult r = new UpdateResult();
      r.ok = false;
      r.message = msg;
      return r;
    }
  }
}

