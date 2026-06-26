import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/pages/Dashboard/components/DashboardSidebar';
import { DashboardTopbar } from '@/pages/Dashboard/components/DashboardTopbar';

/**
 * DashboardLayout
 * ─ Sidebar: 280px, fixed, never grows or shrinks
 * ─ Content: flex-1, topbar + scrollable main
 * ─ Padding lives inside DashboardGrid, NOT here
 */
export function DashboardLayout() {
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
