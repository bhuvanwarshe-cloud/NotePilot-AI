import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useState } from 'react';
import { LogoIcon } from '@/components/shared/LogoIcon';
import { useAuth } from '@/hooks/useAuth';

// ─── Navigation structure ─────────────────────────────────────────────────────
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

const NAV_GROUPS: NavGroup[] = [
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

const S = {
  sidebar: {
    width: 280,
    bg: 'var(--np-surface)',
    border: '1px solid var(--np-border)',
  },
} as const;

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student';
  const initial = (profile?.full_name ?? user?.email ?? 'S')[0].toUpperCase();
  const plan = profile?.plan ?? 'Free';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      style={{
        width: S.sidebar.width,
        minWidth: S.sidebar.width,
        maxWidth: S.sidebar.width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: S.sidebar.bg,
        borderRight: S.sidebar.border,
        flexShrink: 0,
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          borderBottom: '1px solid var(--np-border)',
          flexShrink: 0,
        }}
      >
        <LogoIcon style={{ width: 26, height: 26, flexShrink: 0 }} />
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--np-text-primary)',
          }}
        >
          NotePilot
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
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
                  <SidebarNavItem
                    key={item.label}
                    item={item}
                    isActive={isActive}
                    Icon={Icon}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Upgrade + Profile ────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: '10px 10px 12px',
          borderTop: '1px solid var(--np-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Upgrade pill */}
        {plan === 'Free' && (
          <motion.div
            whileHover={{ scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
          </motion.div>
        )}

        {/* User row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 10,
            cursor: 'default',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = 'var(--np-surface-raised)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = 'transparent')
          }
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
            }}
          >
            {initial}
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
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--np-error)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--np-text-muted)')
            }
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function SidebarNavItem({
  item,
  isActive,
  Icon,
}: {
  item: NavItem;
  isActive: boolean;
  Icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Link
      to={item.to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 8,
        fontSize: 13.5,
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
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'var(--np-surface-raised)';
          if (!item.cta) {
            (e.currentTarget as HTMLElement).style.color = 'var(--np-text-primary)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = item.cta
            ? 'rgba(59,130,246,0.06)'
            : 'transparent';
          (e.currentTarget as HTMLElement).style.color = item.cta
            ? 'var(--np-blue)'
            : 'var(--np-text-secondary)';
        }
      }}
    >
      <Icon size={18} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </span>
    </Link>
  );
}

import type React from 'react';
