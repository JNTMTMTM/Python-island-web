import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '立即下载 | Pyisland',
  description: '下载 Pyisland for Windows。Pyisland 是用 Python 开发的 Windows 灵动岛控制中心，支持 PySide6 和 Tauri 2。',
};

export default function Download() {
  return (
    <main>
      <div style={{ minHeight: '100vh' }} />
    </main>
  );
}
