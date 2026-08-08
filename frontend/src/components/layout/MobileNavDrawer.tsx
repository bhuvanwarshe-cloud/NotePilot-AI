import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Library,
  ScrollText,
  BrainCircuit,
  Network,
  Target,
  Bot,
  TrendingUp,
  Settings,
  Upload,
  Zap,
  LogOut,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { LogoIcon } from '@/components/shared/LogoIcon';
import { useAuth } from '@/hooks/useAuth';

/**
 * MobileNavDrawer
 *
 * Slide-in navigation drawer for viewports < 1024px.
 * Shares the same NAV_GROUPS definition as DashboardSidebar —
 * navigation is sourced from the same place to avoid duplication.
 */

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  to: string;
  cta?: boolean;
}

interface NavGroup {
  heading?: string;
  items: NavItem[];
}

// ─── Canonical navigation data (same structure as DashboardSidebar) ─────────
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard',   icon: LayoutDashboard, to: '/dashboard' },
      { label: 'My Lectures', icon: Library,         to: '/dashboard/lectures' },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { label: 'Upload Lecture', icon: Upload, to: '/dashboard/upload', cta: true },
    ],
  },
  {
    heading: 'Study Tools',
    items: [
      { label: 'Notes',      icon: ScrollText,   to: '/dashboard/notes' },
      { label: 'Flashcards', icon: BrainCircuit, to: '/dashboard/flashcards' },
      { label: 'Mind Maps',  icon: Network,      to: '/dashboard/mindmaps' },
      { label: 'Quizzes',    icon: Target,       to: '/dashboard/quizzes' },
      { label: 'AI Tutor',   icon: Bot,          to: '/dashboard/tutor' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Progress', icon: TrendingUp, to: '/dashboard/progress' },
      { label: 'Settings', icon: Settings,   to: '/dashboard/settings' },
    ],
  },
];

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student';
  const initial    = displayName[0].toUpperCase();
  const plan       = profile?.plan ?? 'Free';
  const avatarUrl  = profile?.avatar_url;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    onClose();
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNavClick = () => onClose();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(2px)',
            }}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 'min(300px, 85vw)',
              zIndex: 201,
              background: 'var(--np-surface)',
              borderRight: '1px solid var(--np-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                borderBottom: '1px solid var(--np-border)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LogoIcon style={{ width: 24, height: 24, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--np-text-primary)' }}>
                  NotePilot
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--np-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Navigation ── */}
            <nav
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {NAV_GROUPS.map((group, gi) => (
                <div key={gi}>
                  {group.heading && (
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'var(--np-text-muted)',
                        padding: '0 10px',
                        marginBottom: 4,
                      }}
                    >
                      {group.heading}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.to;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={handleNavClick}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 10px',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            textDecoration: 'none',
                            color: isActive
                              ? 'var(--np-text-primary)'
                              : item.cta
                              ? 'var(--np-blue)'
                              : 'var(--np-text-secondary)',
                            background: isActive
                              ? 'var(--np-blue-subtle)'
                              : item.cta
                              ? 'rgba(59,130,246,0.06)'
                              : 'transparent',
                            border: item.cta
                              ? '1px solid rgba(59,130,246,0.15)'
                              : '1px solid transparent',
                          }}
                        >
                          <Icon size={18} />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* ── Upgrade + User ── */}
            <div
              style={{
                flexShrink: 0,
                padding: '10px 10px 16px',
                borderTop: '1px solid var(--np-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {plan === 'Free' && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Zap size={13} color="var(--np-blue)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--np-blue)' }}>
                      Upgrade to Pro
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
                    Unlock unlimited AI tutoring.
                  </p>
                </div>
              )}

              {/* User row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initial
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--np-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayName}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--np-text-muted)' }}>{plan} Plan</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Log out"
                  aria-label="Log out"
                  style={{
                    flexShrink: 0,
                    padding: 5,
                    borderRadius: 6,
                    background: 'transparent',
                    border: 'none',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    color: 'var(--np-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loggingOut ? 0.5 : 1,
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import type React from 'react';
