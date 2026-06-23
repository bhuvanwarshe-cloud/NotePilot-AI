import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-md"
      style={{
        background: 'var(--np-nav-bg)',
        borderBottom: '1px solid var(--np-nav-border)',
      }}
    >
      <div className="flex items-center justify-between px-6 h-full max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))' }}
          >
            <span className="text-white font-bold text-base leading-none">N</span>
          </div>
          <span
            className="font-extrabold text-xl tracking-tight"
            style={{ color: 'var(--np-text-primary)' }}
          >
            NotePilot
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center space-x-7">
          {['Features', 'How It Works', 'Pricing', 'FAQ'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--np-text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--np-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--np-text-secondary)')}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <ThemeToggle />

          <Link
            to="/login"
            className="hidden md:block text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--np-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--np-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--np-text-secondary)')}
          >
            Login
          </Link>

          <Button
            asChild
            className="border-0 text-white font-semibold text-sm px-4 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              boxShadow: '0 0 16px var(--np-blue-glow)',
            }}
          >
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
