/**
 * @file page.tsx
 * @description 首页组件
 * @description 应用的入口页面，包含滚动展示容器
 * @author 鸡哥
 */

import ScrollShowcase from '@/components/ScrollShowcase';

/**
 * 首页组件
 * @description 渲染滚动展示容器作为主页内容
 * @returns JSX.Element
 */
export default function Home() {
  return (
    <main>
      <ScrollShowcase />
    </main>
  );
}
