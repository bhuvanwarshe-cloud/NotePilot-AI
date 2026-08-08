import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/shared/LogoIcon';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MobileNavDrawer } from './MobileNavDrawer';
import { useAuth } from '@/hooks/useAuth';

/**
 * MobileTopbar
 *
 * Sticky header shown at viewports < 1024px.
 * Layout:  ☰  NotePilot  ─────────  ☀  🔔  👤
 */
export function MobileTopbar() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student';
  const email       = user?.email ?? '';
  const initial     = displayName[0]?.toUpperCase() ?? 'S';
  const avatarUrl   = profile?.avatar_url;

  const handleLogout = async () => {
    if (loggingOut) return;
    setMenuOpen(false);
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 12px 0 4px',
          background: 'var(--np-surface)',
          borderBottom: '1px solid var(--np-border)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--np-text-secondary)',
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LogoIcon style={{ width: 22, height: 22 }} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--np-text-primary)' }}>
            NotePilot
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification */}
        <button
          title="Notifications"
          aria-label="Notifications"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--np-text-secondary)',
            flexShrink: 0,
          }}
        >
          <Bell size={17} />
        </button>

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="User menu"
            aria-expanded={menuOpen}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.13, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 210,
                    borderRadius: 14,
                    background: 'var(--np-surface)',
                    border: '1px solid var(--np-border)',
                    boxShadow: 'var(--np-shadow-elevated)',
                    overflow: 'hidden',
                    zIndex: 120,
                  }}
                >
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--np-border)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--np-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--np-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {email}
                    </p>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <DropdownItem icon={<User size={14} />} label="Profile" />
                    <DropdownItem icon={<Settings size={14} />} label="Settings" />
                  </div>

                  <div style={{ padding: '4px', borderTop: '1px solid var(--np-border)' }}>
                    <DropdownItem
                      icon={<LogOut size={14} />}
                      label={loggingOut ? 'Signing out…' : 'Log out'}
                      onClick={handleLogout}
                      danger
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        width: '100%',
        padding: '7px 10px',
        borderRadius: 8,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        color: danger ? 'var(--np-error)' : 'var(--np-text-secondary)',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--np-surface-raised)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = 'transparent')
      }
    >
      {icon}
      {label}
    </button>
  );
}

import type React from 'react';
