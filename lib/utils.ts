/**
 * @file utils.ts
 * @description 工具函数库
 * @description 提供常用的工具函数，如样式类名合并等
 * @author 鸡哥
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 * @description 使用 clsx 和 tailwind-merge 合并类名，解决 Tailwind 类名冲突问题
 * @param inputs - 类名数组或对象
 * @returns 合并后的类名字符串
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'text-sm')
 * // 根据条件合并类名，自动处理冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
