/**
 * @file layout.tsx
 * @description 根布局组件
 * @description 定义整个应用的 HTML 结构、元数据和全局样式
 * @author 鸡哥
 */

import type { Metadata } from 'next';
import './globals.css';
import DynamicIsland from '@/components/DynamicIsland';

/**
 * 网站元数据配置
 * @description 定义 SEO 相关的元数据，包括标题、描述、关键词、Open Graph 等
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://pyisland.com'),
  title: {
    default: 'Pyisland - Windows 灵动岛 | 用 Python 开发，运行在 Windows 上的现代灵动岛控制中心',
    template: '%s | Pyisland',
  },
  description: 'Pyisland 采用现代胶囊形状设计，为 Windows 带来 iOS 风格的灵动体验。集成亮度/音量控制、系统状态监控、剪贴板监控等实用功能。',
  keywords: ['Pyisland', '灵动岛', 'Windows', 'Python', 'Dynamic Island', '控制中心', '系统监控'],
  authors: [{ name: 'Pyisland Developers' }],
    alternates: {
      canonical: 'https://pyisland.com/',
    },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Pyisland - Windows 灵动岛',
    description: '用 Python 开发，运行在 Windows 上的现代灵动岛控制中心',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://pyisland.com/',
    siteName: 'Pyisland',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pyisland - Windows 灵动岛',
    description: '用 Python 开发，运行在 Windows 上的现代灵动岛控制中心',
    site: '@pyisland',
  },
};

/**
 * 根布局组件
 * @description 渲染整个应用的 HTML 结构
 * @description 包含动态岛导航组件和子页面内容
 * @param props - 组件属性
 * @param props.children - 子页面内容
 * @returns JSX.Element
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        {/* 网站图标 */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        {/* Google Fonts 预连接 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts 字体加载 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noiseOverlay">
        {/* 顶部动态岛导航 */}
        <DynamicIsland />
        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
