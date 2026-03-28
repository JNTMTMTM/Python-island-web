/**
 * @file tailwind.config.ts
 * @description Tailwind CSS 配置文件
 * @description 定义 Tailwind CSS 的主题扩展、内容路径和插件配置
 * @author 鸡哥
 */

import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS 配置
 * @description 配置内容扫描路径、主题扩展和插件
 */
const config: Config = {
  /**
   * 内容路径
   * @description 指定 Tailwind 扫描类名的文件路径
   */
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /**
       * 圆角半径扩展
       * @description 使用 CSS 变量定义圆角半径，便于全局调整
       */
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      /**
       * 毛玻璃模糊效果扩展
       * @description 定义玻璃态效果的模糊强度
       */
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  /**
   * 插件配置
   * @description 可添加 Tailwind 插件（如 @tailwindcss/forms 等）
   */
  plugins: [],
};

export default config;
