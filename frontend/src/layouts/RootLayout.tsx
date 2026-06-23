import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function RootLayout() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: 'var(--np-bg-primary)',
        color: 'var(--np-text-primary)',
      }}
    >
      <Navbar />

      <main className="flex-1 flex flex-col w-full pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
