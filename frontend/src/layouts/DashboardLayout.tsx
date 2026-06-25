import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Library, Bot, ScrollText, Network, HelpCircle, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const sidebarItems = [
  { name: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Lectures', icon: Library,         path: '/dashboard/lectures' },
  { name: 'AI Tutor',   icon: Bot,              path: '/dashboard/tutor' },
  { name: 'Flashcards', icon: ScrollText,       path: '/dashboard/flashcards' },
  { name: 'Mind Maps',  icon: Network,          path: '/dashboard/mindmaps' },
  { name: 'Quizzes',    icon: HelpCircle,       path: '/dashboard/quizzes' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, profile } = useAuth();

  const displayName = profile?.full_name ?? user?.email ?? 'U';
  const initial = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--np-bg-primary)' }}
    >
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="flex flex-col relative z-20"
        style={{
          background: 'var(--np-surface)',
          borderRight: '1px solid var(--np-border)',
        }}
      >
        {/* Logo row */}
        <div
          className="h-16 flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: '1px solid var(--np-border)' }}
        >
          {isSidebarOpen && (
            <span className="font-bold text-lg truncate" style={{ color: 'var(--np-text-primary)' }}>
              NotePilot
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--np-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--np-blue-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 group"
              style={{ color: 'var(--np-text-secondary)' }}
              title={!isSidebarOpen ? item.name : undefined}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--np-blue-subtle)';
                e.currentTarget.style.color = 'var(--np-text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--np-text-secondary)';
              }}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="truncate text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom items */}
        <div className="p-2 shrink-0" style={{ borderTop: '1px solid var(--np-border)' }}>
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150"
              style={{ color: 'var(--np-text-secondary)' }}
              title={!isSidebarOpen ? item.name : undefined}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--np-blue-subtle)';
                e.currentTarget.style.color = 'var(--np-text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--np-text-secondary)';
              }}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="truncate text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0"
          style={{
            background: 'var(--np-surface)',
            borderBottom: '1px solid var(--np-border)',
          }}
        >
          <div className="text-sm font-medium" style={{ color: 'var(--np-text-secondary)' }}>
            Dashboard
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
              <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))' }}
            >
              {initial}
            </div>
          </div>
        </header>

        {/* Outlet */}
        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: 'var(--np-bg-primary)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
