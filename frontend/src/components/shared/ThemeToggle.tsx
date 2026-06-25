import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Premium theme toggle pill:
 *  ☀️  ◉──────○  🌙   (dark mode — thumb on right)
 *  ☀️  ○──────◉  🌙   (light mode — thumb on left)
 */
export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center gap-2 px-2 py-1.5 rounded-full select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      style={{
        background: 'var(--np-toggle-track)',
        border: '1px solid var(--np-toggle-border)',
      }}
    >
      {/* ── Sun icon ── */}
      <motion.span
        animate={{ opacity: isDark ? 0.3 : 1, scale: isDark ? 0.85 : 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center w-4 h-4 flex-shrink-0"
        style={{ color: 'var(--np-toggle-icon-sun)' }}
      >
        <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />
      </motion.span>

      {/* ── Track + Thumb ── */}
      <div
        className="relative flex items-center rounded-full flex-shrink-0"
        style={{
          width: 36,
          height: 20,
          background: isDark
            ? 'rgba(59, 130, 246, 0.25)'
            : 'rgba(124, 58, 237, 0.20)',
          border: '1px solid var(--np-toggle-border)',
        }}
      >
        {/* Track line */}
        <div
          className="absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-full"
          style={{ height: 1.5, background: 'var(--np-toggle-border)' }}
        />

        {/* Thumb */}
        <motion.div
          layout
          animate={{ x: isDark ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 16,
            height: 16,
            background: 'var(--np-toggle-thumb)',
            boxShadow: isDark
              ? '0 0 8px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0,0,0,0.3)'
              : '0 0 8px rgba(124, 58, 237, 0.4), 0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          {/* Inner dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70" />
        </motion.div>
      </div>

      {/* ── Moon icon ── */}
      <motion.span
        animate={{ opacity: isDark ? 1 : 0.3, scale: isDark ? 1 : 0.85 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center w-4 h-4 flex-shrink-0"
        style={{ color: 'var(--np-toggle-icon-moon)' }}
      >
        <Moon className="w-3.5 h-3.5" strokeWidth={2.5} />
      </motion.span>

      {/* Tooltip text (hidden visually but available) */}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
}
