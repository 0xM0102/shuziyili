package com.shuziyili.module.news;

/** 各资讯上游在详情接口中返回的 attribution 文案。 */
public final class NewsAttributions {

  public static final String JUHE =
      "头条资讯数据来自聚合数据「新闻头条」列表与「新闻详情」接口（https://www.juhe.cn/docs/api/id/235），"
          + "正文 HTML 由上游返回，本站已做基础过滤；完整内容亦可查看原文链接。数据按服务端缓存展示并计入上游配额。";

  public static final String TIANAPI =
      "资讯数据来自天聚数行「地区新闻」接口（https://www.tianapi.com/apiview/154），"
          + "正文为接口返回的摘要描述；完整内容请查看原文链接。数据按服务端缓存展示并计入上游配额。";

  public static final String TENCENT =
      "资讯数据来自腾讯新闻 Skills OpenAPI（https://news.qq.com/exchange?scene=appkey），"
          + "正文为接口返回的摘要或内容字段；完整报道请查看原文链接。数据按服务端缓存展示并计入上游配额。";

  private NewsAttributions() {}
}
