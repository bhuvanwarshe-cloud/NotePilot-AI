import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Student';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const infoRows = [
    { icon: Mail,   label: 'Email',    value: user?.email ?? '—' },
    { icon: Shield, label: 'Role',     value: profile?.role ?? 'student' },
    { icon: Sparkles, label: 'Plan',   value: profile?.plan ?? 'Free' },
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '40px' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid var(--np-border)',
          background: 'var(--np-surface-overlay)',
          backdropFilter: 'blur(20px)',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '50%', height: '200%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div
            style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
            }}
          >
            {initials}
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {displayName}
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          borderRadius: '20px',
          border: '1px solid var(--np-border)',
          background: 'var(--np-surface-overlay)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '18px 24px',
              borderBottom: i < infoRows.length - 1 ? '1px solid var(--np-border)' : 'none',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <row.icon style={{ width: '16px', height: '16px', color: 'var(--np-blue)' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>
                {row.label}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--np-text-primary)', margin: 0 }}>
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', height: '52px', borderRadius: '14px', border: '1px solid var(--np-border-strong)',
            background: 'transparent', color: 'var(--np-text-primary)', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget).style.borderColor = 'rgba(239,68,68,0.3)'; (e.currentTarget).style.color = 'var(--np-error)'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.borderColor = 'var(--np-border-strong)'; (e.currentTarget).style.color = 'var(--np-text-primary)'; }}
        >
          <LogOut style={{ width: 18, height: 18 }} />
          Log Out
        </motion.button>
      </motion.div>
    </div>
  );
}
