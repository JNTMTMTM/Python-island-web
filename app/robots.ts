/**
 * @file robots.ts
 * @description 爬虫配置文件
 * @description 配置搜索引擎爬虫的访问规则和站点地图链接
 * @author 鸡哥
 */

import type { MetadataRoute } from 'next';

/**
 * 爬虫配置函数
 * @description 返回 robots.txt 配置，控制搜索引擎爬虫行为
 * @returns robots 配置对象
 */
export default function robots(): MetadataRoute.Robots {
  return {
    /**
     * 爬虫规则
     * @description 定义爬虫的访问权限
     */
    rules: [
      {
        /** 适用于所有爬虫 */
        userAgent: '*',
        /** 允许访问所有页面 */
        allow: '/',
      },
    ],
    /** 站点地图链接 */
    sitemap: 'https://pyisland.com/sitemap.xml',
    /** 网站主机地址 */
    host: 'https://pyisland.com',
  };
}
