import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/pages/Dashboard/components/DashboardSidebar';
import { DashboardTopbar } from '@/pages/Dashboard/components/DashboardTopbar';
import { MobileTopbar } from '@/components/layout/MobileTopbar';
import { useIsCompact } from '@/hooks/useMediaQuery';

/**
 * DashboardLayout
 *
 * Desktop (>=1024px):
 *   [DashboardSidebar 280px] | [DashboardTopbar + main content]
 *
 * Compact (<1024px — phones & tablets):
 *   [MobileTopbar (sticky)]
 *   [main content — full width]
 *
 * IMPORTANT: The sidebar is completely absent from the DOM on compact
 * viewports, so it leaves zero residual margin/gap behind.
 */
export function DashboardLayout() {
  const isCompact = useIsCompact();

  if (isCompact) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: 'var(--np-bg-primary)',
        }}
      >
        <MobileTopbar />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--np-bg-primary)',
            width: '100%',
          }}
        >
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--np-bg-primary)',
      }}
    >
      {/* Permanent 280px sidebar — desktop only */}
      <DashboardSidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <DashboardTopbar />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--np-bg-primary)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
