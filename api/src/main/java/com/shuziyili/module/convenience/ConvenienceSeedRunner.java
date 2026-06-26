package com.shuziyili.module.convenience;

import java.time.Clock;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 首次启动把前端便民静态目录迁入数据库；后续后台维护不会被覆盖。 */
@Component
public class ConvenienceSeedRunner implements ApplicationRunner {

  private final ConvenienceCategoryRepository categoryRepository;
  private final ConvenienceServiceRepository serviceRepository;
  private final Clock clock = Clock.systemUTC();

  public ConvenienceSeedRunner(
      ConvenienceCategoryRepository categoryRepository,
      ConvenienceServiceRepository serviceRepository) {
    this.categoryRepository = categoryRepository;
    this.serviceRepository = serviceRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    long now = clock.millis();
    if (categoryRepository.count() == 0) {
      seedCategories(now);
    }
    if (serviceRepository.count() == 0) {
      seedServices(now);
    }
  }

  private void seedCategories(long now) {
    seedCategory("government", "政务便民", "政务", "证件、社保、公积金、公共服务和办事咨询入口。", "government",
        List.of("政务", "证件", "社保", "公积金", "办事", "12345"), 0, now);
    seedCategory("health", "医疗健康", "医疗", "医院、药店、急诊、医保和日常健康服务。", "health",
        List.of("医院", "药店", "急诊", "医保", "120"), 10, now);
    seedCategory("shipping", "快递物流", "快递", "寄件、取件、大件物流和短住收货建议。", "shipping",
        List.of("快递", "物流", "寄件", "取件", "顺丰", "菜鸟"), 20, now);
    seedCategory("transport", "交通出行", "交通", "公交、客运、出租、停车、道路救援和事故报警。", "transport",
        List.of("公交", "客运", "出租", "停车", "122", "救援"), 30, now);
    seedCategory("telecom", "通信网络", "通信", "电话卡、宽带、营业厅和远程办公网络保障。", "telecom",
        List.of("电话卡", "宽带", "移动", "联通", "电信", "网络"), 40, now);
    seedCategory("banking", "银行缴费", "银行", "银行网点、取现、生活缴费和账户咨询。", "banking",
        List.of("银行", "缴费", "取现", "账户", "网点"), 50, now);
    seedCategory("shopping", "生活采购", "采购", "超市、菜市场、药妆、日用品和长期居住补给。", "shopping",
        List.of("超市", "菜市场", "日用品", "采购", "补给"), 60, now);
    seedCategory("repair", "维修家政", "维修", "水电燃气、开锁、家电、电脑和上门维修。", "repair",
        List.of("维修", "家政", "水电", "开锁", "家电", "电脑"), 70, now);
    seedCategory("emergency", "应急电话", "应急", "报警、急救、消防、交通事故和紧急求助。", "emergency",
        List.of("报警", "急救", "消防", "应急", "110", "119", "120"), 80, now);
    seedCategory("community", "社区服务", "社区", "社区咨询、物业、健身、公益和本地生活服务。", "community",
        List.of("社区", "物业", "健身", "公益", "生活服务"), 90, now);
  }

  private void seedServices(long now) {
    seedService("public-hotline-12345", "government", "政务服务便民热线", "全州", "线上咨询", "12345",
        "全天候受理，以当地接线规则为准", "适合咨询政务办事、公共服务、投诉建议和跨部门问题。",
        List.of("政务咨询", "公共服务", "投诉建议"), ConvenienceServiceStatus.COMMON, null, true, 0, now);
    seedService("social-security-12333", "government", "人社服务咨询", "全州", "线上咨询", "12333",
        "以当地接线时间为准", "社保、就业、劳动关系等问题可先通过热线确认办理路径。",
        List.of("社保", "就业", "劳动"), ConvenienceServiceStatus.COMMON, null, false, 10, now);
    seedService("medical-emergency-120", "health", "医疗急救", "全州", "紧急情况请说明当前位置", "120", "全天候",
        "突发疾病、外伤等紧急情况优先拨打急救电话。", List.of("急救", "医疗", "应急"),
        ConvenienceServiceStatus.COMMON, null, true, 20, now);
    seedService("night-pharmacy-directory", "health", "夜间药店信息", "伊宁市及周边", "待运营补充具体门店", "待核实", "待核实",
        "用于沉淀夜间营业药店、常用药购买和附近药房信息。", List.of("药店", "夜间", "待补充"),
        ConvenienceServiceStatus.PENDING, null, false, 30, now);
    seedService("express-pickup-directory", "shipping", "快递寄件取件网点", "伊宁市及周边", "待运营补充网点", "待核实", "待核实",
        "适合整理顺丰、京东、菜鸟、三通一达等常用网点。", List.of("寄件", "取件", "网点"),
        ConvenienceServiceStatus.PENDING, null, false, 40, now);
    seedService("large-logistics-directory", "shipping", "大件物流与设备托运", "伊犁州", "待运营补充站点", "待核实", "待核实",
        "面向搬家、办公设备、摄影器材等大件寄送场景。", List.of("大件", "搬家", "设备"),
        ConvenienceServiceStatus.PENDING, null, false, 50, now);
    seedService("traffic-accident-122", "transport", "道路交通事故报警", "全州", "紧急情况请说明当前位置", "122", "全天候",
        "交通事故、道路突发情况可优先拨打交通事故报警电话。", List.of("交通", "事故", "报警"),
        ConvenienceServiceStatus.COMMON, null, true, 60, now);
    seedService("passenger-transport-directory", "transport", "客运与公交咨询", "伊宁市及周边", "待运营补充站点", "待核实", "待核实",
        "用于汇总客运站、公交线路、机场/火车站接驳等信息。", List.of("公交", "客运", "接驳"),
        ConvenienceServiceStatus.PENDING, null, false, 70, now);
    seedService("ylnet-carpool", "transport", "绿河谷巴扎拼车信息", "伊犁州", "外部分类信息平台", "查看来源页面",
        "实时发布，以来源页面为准", "可查看人找车、车找人、顺风车等本地拼车信息；具体电话、时间和路线请以发布页为准。",
        List.of("拼车", "顺风车", "外部来源"), ConvenienceServiceStatus.EXTERNAL,
        "https://bz.ylnet.com.cn/category-catid-294.html", false, 80, now);
    seedService("telecom-hotlines", "telecom", "三大运营商客服", "全州", "线上咨询", "10086 / 10010 / 10000",
        "以运营商规则为准", "电话卡、流量、宽带、漫游和信号问题可先联系运营商客服。",
        List.of("移动", "联通", "电信"), ConvenienceServiceStatus.COMMON, null, false, 90, now);
    seedService("coworking-network-help", "telecom", "远程办公网络保障", "伊宁市及周边", "待运营补充办公点", "待核实", "待核实",
        "沉淀适合视频会议、稳定 WiFi、插座充足的办公点和网络建议。", List.of("远程办公", "WiFi", "电话卡"),
        ConvenienceServiceStatus.PENDING, null, false, 100, now);
    seedService("bank-branch-directory", "banking", "银行网点与生活缴费", "伊宁市及周边", "待运营补充网点", "待核实", "待核实",
        "用于整理银行网点、ATM、社保卡、生活缴费和线下账户咨询。", List.of("银行", "ATM", "缴费"),
        ConvenienceServiceStatus.PENDING, null, false, 110, now);
    seedService("daily-market-directory", "shopping", "超市与菜市场", "伊宁市及周边", "待运营补充地点", "待核实", "待核实",
        "面向长期居住、短租和数字游民的一周生活补给目录。", List.of("超市", "菜市场", "补给"),
        ConvenienceServiceStatus.PENDING, null, false, 120, now);
    seedService("repair-home-service", "repair", "水电维修与家政", "伊宁市及周边", "待运营补充商家", "待核实", "待核实",
        "用于整理租房常见维修、保洁、家电和电脑设备维修服务。", List.of("维修", "家政", "租房"),
        ConvenienceServiceStatus.PENDING, null, false, 130, now);
    seedService("ylnet-life-services", "repair", "绿河谷巴扎生活服务", "伊犁州", "外部分类信息平台", "查看来源页面",
        "实时发布，以来源页面为准", "生活服务分类包含家政、保洁、搬家、家电维修、电脑维修、管道疏通、开锁、租车等本地发布信息。",
        List.of("生活服务", "家政维修", "外部来源"), ConvenienceServiceStatus.EXTERNAL,
        "https://bz.ylnet.com.cn/category-catid-9.html", false, 140, now);
    seedService("police-110", "emergency", "报警求助", "全州", "紧急情况请说明当前位置", "110", "全天候",
        "遇到人身安全、治安或紧急求助问题时使用。", List.of("报警", "求助", "安全"),
        ConvenienceServiceStatus.COMMON, null, true, 150, now);
    seedService("fire-119", "emergency", "消防救援", "全州", "紧急情况请说明当前位置", "119", "全天候",
        "火灾、抢险救援等紧急情况优先拨打消防电话。", List.of("消防", "救援", "火警"),
        ConvenienceServiceStatus.COMMON, null, true, 160, now);
    seedService("community-service-directory", "community", "社区与物业服务", "伊宁市及周边", "待运营补充社区/物业", "待核实", "待核实",
        "用于沉淀社区咨询、物业报修、健身房和公益服务信息。", List.of("社区", "物业", "健身"),
        ConvenienceServiceStatus.PENDING, null, false, 170, now);
    seedService("ylnet-house-rental", "community", "绿河谷巴扎房屋租售", "伊犁州", "外部分类信息平台", "查看来源页面",
        "实时发布，以来源页面为准", "可查看房屋出租、求租、出售、商铺、写字楼等本地发布信息；适合作为租住线索入口。",
        List.of("租房", "商铺", "外部来源"), ConvenienceServiceStatus.EXTERNAL,
        "https://bz.ylnet.com.cn/category-catid-3.html", false, 180, now);
  }

  private void seedCategory(
      String slug,
      String title,
      String shortTitle,
      String description,
      String icon,
      List<String> keywords,
      int sortOrder,
      long now) {
    ConvenienceCategoryEntity e = new ConvenienceCategoryEntity();
    e.setSlug(slug);
    e.setTitle(title);
    e.setShortTitle(shortTitle);
    e.setDescription(description);
    e.setIcon(icon);
    e.setKeywordsJson(ConvenienceStringListJson.encode(keywords));
    e.setEnabled(true);
    e.setSortOrder(sortOrder);
    e.setCreatedAt(now);
    e.setUpdatedAt(now);
    categoryRepository.save(e);
  }

  private void seedService(
      String id,
      String category,
      String title,
      String area,
      String address,
      String contact,
      String hours,
      String summary,
      List<String> tags,
      String status,
      String sourceUrl,
      boolean emergency,
      int sortOrder,
      long now) {
    ConvenienceServiceEntity e = new ConvenienceServiceEntity();
    e.setId(id);
    e.setCategorySlug(category);
    e.setTitle(title);
    e.setArea(area);
    e.setAddress(address);
    e.setContact(contact);
    e.setHours(hours);
    e.setSummary(summary);
    e.setTagsJson(ConvenienceStringListJson.encode(tags));
    e.setStatus(status);
    e.setSourceUrl(sourceUrl);
    e.setEmergency(emergency);
    e.setEnabled(true);
    e.setSortOrder(sortOrder);
    e.setCreatedAt(now);
    e.setUpdatedAt(now);
    serviceRepository.save(e);
  }
}
