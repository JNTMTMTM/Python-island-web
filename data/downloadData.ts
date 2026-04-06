/**
 * @file downloadData.ts
 * @description 下载分支数据定义
 * @description 包含各个可下载分支的版本信息和下载链接
 * @author 鸡哥
 */

/**
 * 下载分支接口
 * @description 定义下载分支的完整信息结构
 */
export interface DownloadBranch {
  /** 分支唯一标识 */
  id: string;
  /** 分支名称 */
  name: string;
  /** 分支标语 */
  tagline: string;
  /** 分支描述 */
  description: string;
  /** 特性列表 */
  features: string[];
  /** 适用人群 */
  audience: string;
  /** 下载链接 */
  downloadUrl: string;
  /** 下载按钮标签 */
  downloadLabel: string;
  /** 徽章文字 */
  badge: string;
  /** 主题色 */
  accentColor: string;
  /** 主题背景色 */
  accentBg: string;
  /** 主题边框色 */
  accentBorder: string;
  /** 短标签 */
  label: string;
}

export const downloadBranches: DownloadBranch[] = [
  {
    id: 'eisland',
    name: 'eisland',
    tagline: '旗舰版',
    description: '基于 Electron + React 构建的桌面灵动岛，集成完整 UI 框架与交互系统',
    features: [
      'Web 技术栈，开发迭代效率高',
      '功能模块化，扩展性强',
      'Windows / macOS / Linux 全平台兼容',
      '成熟开源生态，依赖维护活跃',
    ],
    audience: '追求功能完整、开源可控、跨平台体验的用户',
    downloadUrl: 'https://download.pyisland.com/download/eIsland-26.1.1-beta.1-Setup.exe',
    downloadLabel: '立即下载',
    badge: '旗舰版',
    accentColor: '#2563EB',
    accentBg: 'rgba(37, 99, 235, 0.10)',
    accentBorder: 'rgba(59, 130, 246, 0.30)',
    label: 'T2',
  },
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
    downloadUrl: 'https://download.pyisland.com/download/DynamicIsland_0.3.5_x64-setup.exe',
    downloadLabel: '立即下载',
    badge: '高性能',
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
    downloadUrl: 'https://download.pyisland.com/download/PyIsland_1.7.1_x64.zip',
    downloadLabel: '立即下载',
    badge: '稳定版',
    accentColor: '#FFFFFF',
    accentBg: 'rgba(255, 255, 255, 0.08)',
    accentBorder: 'rgba(255, 255, 255, 0.20)',
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
    accentColor: '#FACC15',
    accentBg: 'rgba(250, 204, 21, 0.08)',
    accentBorder: 'rgba(250, 204, 21, 0.25)',
    label: 'WK',
  },
];
