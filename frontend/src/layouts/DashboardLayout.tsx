import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Library, Bot, ScrollText, Network, HelpCircle, Settings, Menu, X } from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Lectures', icon: Library, path: '/dashboard/lectures' },
  { name: 'AI Tutor', icon: Bot, path: '/dashboard/tutor' },
  { name: 'Flashcards', icon: ScrollText, path: '/dashboard/flashcards' },
  { name: 'Mind Maps', icon: Network, path: '/dashboard/mindmaps' },
  { name: 'Quizzes', icon: HelpCircle, path: '/dashboard/quizzes' },
];

const bottomItems = [
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-backgroundPrimary">
      {/* Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="flex flex-col border-r border-border bg-surface relative z-20"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          {isSidebarOpen && <span className="font-bold text-lg text-textPrimary truncate">NotePilot</span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-md text-textSecondary"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-white/5 text-textSecondary hover:text-textPrimary transition-colors group"
              title={!isSidebarOpen ? item.name : undefined}
            >
              <item.icon size={20} className="shrink-0 group-hover:text-electricBlue transition-colors" />
              {isSidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-border shrink-0">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-white/5 text-textSecondary hover:text-textPrimary transition-colors group"
              title={!isSidebarOpen ? item.name : undefined}
            >
              <item.icon size={20} className="shrink-0 group-hover:text-electricBlue transition-colors" />
              {isSidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Placeholder */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-textSecondary">Dashboard</div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-electricBlue/20 flex items-center justify-center text-electricBlue font-bold text-sm">
              U
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
