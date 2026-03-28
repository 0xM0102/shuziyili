import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // travel
      { source: "/lvyou", destination: "/travel", permanent: true },
      { source: "/lvyou/jingdian", destination: "/travel/attractions", permanent: true },
      { source: "/lvyou/zhusu", destination: "/travel/stay", permanent: true },
      { source: "/lvyou/meishi", destination: "/travel/food", permanent: true },
      { source: "/lvyou/jiaotong", destination: "/travel/transport", permanent: true },
      { source: "/lvyou/gonglue", destination: "/travel/guide", permanent: true },

      // convenience
      { source: "/bianmin", destination: "/convenience", permanent: true },
      {
        source: "/bianmin/zhengwu",
        destination: "/convenience/government",
        permanent: true,
      },
      {
        source: "/bianmin/yiliao",
        destination: "/convenience/health",
        permanent: true,
      },
      {
        source: "/bianmin/kuaidi",
        destination: "/convenience/shipping",
        permanent: true,
      },

      // nomad
      { source: "/youmin", destination: "/nomad", permanent: true },

      // events
      { source: "/huodong", destination: "/events", permanent: true },
      { source: "/huodong/:id", destination: "/events/:id", permanent: true },

      // news
      { source: "/zixun", destination: "/news", permanent: true },
      { source: "/zixun/:slug", destination: "/news/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
