import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '开发者 | Pyisland',
  description: 'Pyisland 开发者文档、API 参考、插件开发指南。使用 PySide6 或 Tauri 2 构建你的灵动岛。',
};

export default function Developers() {
  return (
    <main>
      <div style={{ minHeight: '100vh' }} />
      <Footer />
    </main>
  );
}
