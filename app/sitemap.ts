/**
 * @file sitemap.ts
 * @description 站点地图配置文件
 * @description 生成网站站点地图，帮助搜索引擎索引网站内容
 * @author 鸡哥
 */

import type { MetadataRoute } from 'next';

/** 网站基础 URL */
const BASE_URL = 'https://pyisland.top';

/**
 * 站点地图生成函数
 * @description 返回网站的站点地图配置
 * @returns 站点地图路由数组
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * 站点路由配置
   * @description 定义所有需要索引的页面及其属性
   */
  const routes = [
    {
      /** 完整 URL */
      url: `${BASE_URL}/`,
      /** 最后修改时间 */
      lastModified: new Date(),
      /** 内容更新频率：每周 */
      changeFrequency: 'weekly' as const,
      /** 优先级：1.0 表示最高优先级 */
      priority: 1.0,
    },
  ];

  return routes;
}
