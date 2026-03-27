export interface DownloadItem {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  accent: string;
  href: string;
  installMethods: {
    title: string;
    commands: string[];
    note?: string;
  }[];
  requirements?: string[];
}

export const downloadData: DownloadItem[] = [
  {
    id: 'pyside6',
    name: 'pyislandPyside6',
    tagline: '功能完整 · 稳定可靠',
    badge: '稳定版',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island',
    installMethods: [
      {
        title: 'pip 安装',
        commands: [
          'pip install pyisland-pyside6'
        ],
      },
      {
        title: '源码安装',
        commands: [
          'git clone https://github.com/Python-island/Python-island.git',
          'cd Python-island',
          'pip install -e .',
        ],
      },
      {
        title: '运行',
        commands: [
          'pyisland',
        ],
      },
    ],
    requirements: ['Python 3.11+', 'PySide6', 'requests'],
  },
  {
    id: 'wanku',
    name: 'pyisland-wanku',
    tagline: '高仿真 iOS · 功能丰富',
    badge: '高颜值',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/pyisland-wanku',
    installMethods: [
      {
        title: '克隆分支',
        commands: [
          'git clone -b pyisland-wanku https://github.com/Python-island/Python-island.git',
          'cd pyisland-wanku',
        ],
      },
      {
        title: '安装依赖',
        commands: [
          'pip install -r requirements.txt',
        ],
      },
      {
        title: '运行',
        commands: [
          'python main.py',
        ],
      },
    ],
    requirements: ['Python 3.10+', 'PySide6', 'requests', 'pywin32'],
  },
  {
    id: 'tauri',
    name: 'tauri-island',
    tagline: '性能优先 · Rust 重写',
    badge: '高性能',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/tauri-island',
    installMethods: [
      {
        title: '下载预编译包',
        commands: [
          'https://github.com/Python-island/Python-island/releases',
        ],
        note: '支持 Windows x64 安装包',
      },
      {
        title: '源码编译',
        commands: [
          'git clone -b tauri-island https://github.com/Python-island/Python-island.git',
          'cd tauri-island',
          'cargo build --release',
        ],
        note: '需要 Rust 1.70+',
      },
      {
        title: '安装',
        commands: [
          'msiexec /i pyisland-tauri-x.x.x.msi',
        ],
      },
    ],
    requirements: ['Rust 1.70+', 'Node.js 18+ (前端构建)'],
  },
  {
    id: 'pyislandqt',
    name: 'pyislandQT',
    tagline: '轻量高效 · 事件驱动',
    badge: '轻量版',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/pyislandQT',
    installMethods: [
      {
        title: 'pip 安装',
        commands: [
          'pip install pyislandqt',
        ],
      },
      {
        title: '克隆安装',
        commands: [
          'git clone -b pyislandQT https://github.com/Python-island/Python-island.git',
          'cd pyislandQT',
          'pip install -e .',
        ],
      },
      {
        title: '运行',
        commands: [
          'pyisland-qt',
        ],
      },
    ],
    requirements: ['Python 3.10+', 'PyQt5', 'asyncio'],
  },
];
