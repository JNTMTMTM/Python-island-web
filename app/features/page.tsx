import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '功能介绍 | Pyisland',
  description: '探索 Pyisland 的核心功能：智能展开收起、亮度调节、音量控制、系统监控、剪贴板监控等。',
};

export default function Features() {
  return (
    <main>
      <div style={{ minHeight: '100vh' }} />
      <Footer />
    </main>
  );
}
