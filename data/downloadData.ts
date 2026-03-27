import stylesBadge from '@/styles/badge.module.css';

export interface DownloadBranch {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  audience: string;
  downloadUrl: string;
  downloadLabel: string;
  badge: string;
  badgeClass: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  label: string;
}

export const downloadBranches: DownloadBranch[] = [
  {
    id: 'tauri-island',
    name: 'tauri-island',
    tagline: '高性能',
    description: '基于 Tauri 2 + Rust 的全新实现',
    features: [
      '性能更强，响应更迅速',
      '安装包体积更小',
      '原生系统集成度高',
      '更低的资源占用',
    ],
    audience: '追求性能和轻量化的用户',
    downloadUrl: 'https://download.pyisland.com/download/DynamicIsland_0.2.0_x64-setup.exe',
    downloadLabel: '立即下载',
    badge: '高性能',
    badgeClass: stylesBadge.badgeGreen,
    accentColor: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.08)',
    accentBorder: 'rgba(5, 150, 105, 0.25)',
    label: 'T2',
  },
  {
    id: 'pyislandqt',
    name: 'pyislandQT',
    tagline: '轻量版',
    description: '基于 Python + PyQt5 构建的轻量灵动岛',
    features: [
      '事件驱动架构，模块解耦',
      '资源占用极低，内存 < 24MB',
      '网络 / 蓝牙状态监控通知',
      '支持守护进程后台运行',
    ],
    audience: '追求轻量化和低资源占用的用户',
    downloadUrl: 'https://docs.pyisland.com/download.html',
    downloadLabel: '即将推出',
    badge: '轻量版',
    badgeClass: stylesBadge.badgeAmber,
    accentColor: '#D97706',
    accentBg: 'rgba(217, 119, 6, 0.08)',
    accentBorder: 'rgba(217, 119, 6, 0.25)',
    label: 'Q5',
  },
  {
    id: 'pyislandpyside6',
    name: 'pyislandPyside6',
    tagline: '稳定版',
    description: '基于 Python + PySide6 构建的成熟稳定版本',
    features: [
      '功能完整，经过充分测试验证',
      '适合日常使用场景',
      '易于自定义和二次开发',
      '社区支持完善，文档齐全',
    ],
    audience: '追求稳定可靠的用户',
    downloadUrl: 'https://download.pyisland.com/download/Pyisland_V1.6.1.exe',
    downloadLabel: '立即下载',
    badge: '稳定版',
    badgeClass: stylesBadge.badgeAccent,
    accentColor: '#1D1D1F',
    accentBg: 'rgba(29, 29, 31, 0.05)',
    accentBorder: 'rgba(29, 29, 31, 0.12)',
    label: 'S6',
  },
  {
    id: 'pyisland-wanku',
    name: 'pyisland-wanku',
    tagline: '美化版',
    description: '高仿真 iOS 灵动岛体验',
    features: [
      '极致仿真 iOS 灵动岛外观',
      '支持录屏功能',
      '媒体控制和歌词显示',
      '毛玻璃效果和多巴胺配色',
    ],
    audience: '追求高颜值和丰富功能的用户',
    downloadUrl: 'https://docs.pyisland.com/download.html',
    downloadLabel: '即将推出',
    badge: '美化版',
    badgeClass: stylesBadge.badgeAccent,
    accentColor: '#1D1D1F',
    accentBg: 'rgba(29, 29, 31, 0.05)',
    accentBorder: 'rgba(29, 29, 31, 0.12)',
    label: 'WK',
  },
];
