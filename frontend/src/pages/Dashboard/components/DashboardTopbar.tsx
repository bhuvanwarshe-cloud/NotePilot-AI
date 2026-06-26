import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export function DashboardTopbar() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student';
  const email = user?.email ?? '';
  const initial = displayName[0]?.toUpperCase() ?? 'S';

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
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        background: 'var(--np-surface)',
        borderBottom: '1px solid var(--np-border)',
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* ── Search ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Search size={15} color="var(--np-text-muted)" />
        </div>
        <input
          type="text"
          placeholder="Search lectures..."
          readOnly
          style={{
            width: 360,
            height: 36,
            padding: '0 80px 0 38px',
            background: 'var(--np-bg-secondary)',
            border: '1px solid var(--np-border)',
            borderRadius: 9,
            fontSize: 13.5,
            color: 'var(--np-text-secondary)',
            outline: 'none',
            cursor: 'text',
            fontFamily: 'inherit',
          }}
        />
        <kbd
          style={{
            position: 'absolute',
            right: 10,
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 5,
            background: 'var(--np-border)',
            color: 'var(--np-text-muted)',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ── Right actions ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Notifications */}
        <TopbarIconButton title="Notifications">
          <Bell size={17} />
        </TopbarIconButton>

        <div
          style={{
            width: 1,
            height: 20,
            background: 'var(--np-border)',
            margin: '0 4px',
          }}
        />

        <ThemeToggle />

        <div
          style={{
            width: 1,
            height: 20,
            background: 'var(--np-border)',
            margin: '0 4px',
          }}
        />

        {/* Avatar + user dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
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
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          >
            {initial}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
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
                    width: 216,
                    borderRadius: 14,
                    background: 'var(--np-surface)',
                    border: '1px solid var(--np-border)',
                    boxShadow: 'var(--np-shadow-elevated)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--np-border)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--np-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 1,
                      }}
                    >
                      {displayName}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--np-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email}
                    </p>
                  </div>

                  {/* Menu items */}
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
      </div>
    </header>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function TopbarIconButton({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--np-text-secondary)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = 'var(--np-surface-raised)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = 'transparent')
      }
    >
      {children}
    </button>
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
        ((e.currentTarget as HTMLElement).style.background = danger
          ? 'rgba(239,68,68,0.08)'
          : 'var(--np-surface-raised)')
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
