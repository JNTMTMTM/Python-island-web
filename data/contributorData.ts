/**
 * @file contributorData.ts
 * @description 贡献者数据定义
 * @description 包含所有项目贡献者的信息和展示数据
 * @author 鸡哥
 */

/**
 * 贡献者接口
 * @description 定义贡献者的完整信息结构
 */
export interface Contributor {
  /** 贡献者唯一标识 */
  id: string;
  /** 中文名称 */
  name: string;
  /** 英文名称（大写） */
  nameEn: string;
  /** Dock 栏显示标签 */
  dockLabel: string;
  /** 电子邮箱 */
  email: string;
  /** 个人简介 */
  bio: string;
  /** 特征数组（图标、标签、描述） */
  traits: { icon: string; label: string; desc: string }[];
  /** 技能标签数组 */
  skills: { label: string }[];
}

export const contributors: Contributor[] = [
  {
    id: 'silenthim',
    name: 'silenthim',
    nameEn: 'SILENTHIM',
    dockLabel: 'silenthim',
    email: '2066889432@qq.com',
    bio: '在校大学瘤子，鸡窝山软工の耻辱，精通 Python，C++，C，Java 各种语言输出 Hello World，一生只爱东北雨姐',
    traits: [
      { icon: '/', label: '在校大学生', desc: '鸡窝山软工' },
      { icon: '/', label: '多语言选手', desc: 'Python / C++ / C / Java' },
      { icon: '/', label: 'Hello World', desc: '精通各种语言入门' },
      { icon: '/', label: '一生真爱', desc: '东北雨姐' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'C++' },
      { label: 'C' },
      { label: 'Java' },
    ],
  },
  {
    id: 'StarWindv',
    name: '星灿长风v',
    nameEn: 'StarWindv',
    dockLabel: '星灿长风v',
    email: 'starwindv@mail.starwindv.top',
    bio: 'ISTP/INTP 社恐金牛 | 擅长使用 Py/Java/Rust/Ts | 喜欢花里胡哨的东西和更底层的原理 | 热衷于自己造轮子来进行学习',
    traits: [
      { icon: '/', label: 'ISTP / INTP', desc: '理性工匠 · 逻辑思考' },
      { icon: '/', label: '社恐金牛', desc: '沉稳内敛 · 专注细节' },
      { icon: '/', label: '热衷造轮子', desc: '自己动手 · 深度学习' },
      { icon: '/', label: '追求底层原理', desc: '知其然 · 更知其所以然' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'Java' },
      { label: 'Rust' },
      { label: 'TypeScript' },
      { label: 'PySide6' },
      { label: 'Qt' },
      { label: 'Tauri' },
    ],
  },
  {
    id: 'Code',
    name: 'Code',
    nameEn: 'CODE',
    dockLabel: 'Code',
    email: '2064878930@qq.com',
    bio: 'INTP 水瓶 | 擅长使用 Py/Java/Vue | 激进维新派 VibeCoding 中乐此不疲 | 樱花只开一季 真爱只有一次',
    traits: [
      { icon: '/', label: 'INTP', desc: '逻辑学家 · 创新驱动' },
      { icon: '/', label: '浪漫水瓶', desc: '理想主义 · 追求真爱' },
      { icon: '/', label: 'VibeCoding', desc: '激进维新 · 乐此不疲' },
      { icon: '/', label: '多语言开发', desc: 'Py / Java / Vue' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'Java' },
      { label: 'Vue' },
      { label: 'VibeCoding' },
    ],
  },
  {
    id: 'GeminiMortal',
    name: '双子座·凡尘',
    nameEn: 'GeminiMortal',
    dockLabel: '双子座·凡尘',
    email: '1468098941@qq.com',
    bio: '社恐双子 · 多语言开发者 · 视觉系代码爱好者 · 希望从零手搓独立作品',
    traits: [
      { icon: '/', label: 'INFJ / INFP / INTP', desc: '三重人格切换' },
      { icon: '/', label: '社恐双子', desc: 'SUT 在校生' },
      { icon: '/', label: '视觉系代码', desc: '花里胡哨的视觉效果' },
      { icon: '/', label: '手搓独立作品', desc: '从零开始的创造者' },
    ],
    skills: [
      { label: 'C++' },
      { label: 'Python' },
      { label: 'Java' },
      { label: 'JavaScript' },
    ],
  },
  {
    id: 'cXp1r',
    name: 'cXp1r',
    nameEn: 'CXP1R',
    dockLabel: 'cXp1r',
    email: 'cxp1r@nailong.com',
    bio: '百合小资历,四川最后的直男,niko铁粉,最爱上学之人',
    traits: [
      { icon: '/', label: '全平台同名', desc: 'cXp1r和任何人无关' },
      { icon: '/', label: '正宗异性恋', desc: 'ip正确' },
      { icon: '/', label: '猎鹰铁粉', desc: '尼尼孩孩京介夺冠' },
      { icon: '/', label: 'C++ / Python / Rust', desc: '古法编程vs维新派' },
    ],
    skills: [
      { label: 'C++' },
      { label: 'Python' },
      { label: 'Rust' },
      { label: 'Vibe Coding' },
    ],
  },
  {
    id: 'JNTMTMTM',
    name: '鸡哥',
    nameEn: 'JNTMTMTM',
    dockLabel: '鸡哥',
    email: 'JNTMTMTM@nailong.com',
    bio: '南京最后的全栈工程师 (eisland 问题请跟我反馈 不要骚扰别人)',
    traits: [
      { icon: '/', label: '保持神秘_0', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_1', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_2', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_3', desc: '404 NOT FOUND' },
    ],
    skills: [
      { label: '404 NOT FOUND' }
    ],
  },
];
