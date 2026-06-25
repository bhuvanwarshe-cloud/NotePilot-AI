import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';

// ─── Reusable FormField ───────────────────────────────────────────────────────
function FormField({
  id, label, type, placeholder, value, onChange, icon, rightSlot, error,
}: {
  id: string; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ReactNode; rightSlot?: React.ReactNode; error?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <label htmlFor={id} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--np-text-primary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative', width: '100%' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-muted)', pointerEvents: 'none' }}>
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            height: '48px',
            paddingLeft: '44px',
            paddingRight: rightSlot ? '44px' : '16px',
            borderRadius: '12px',
            border: `1px solid ${error ? 'var(--np-error)' : 'var(--np-border-strong)'}`,
            background: 'transparent',
            color: 'var(--np-text-primary)',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--np-blue)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--np-blue-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--np-error)' : 'var(--np-border-strong)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {rightSlot && (
          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
            {rightSlot}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: 'var(--np-error)', margin: 0 }}>{error}</p>}
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      setFormError(error);
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const handleGoogle = async () => {
    setFormError(null);
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    // If no error, browser will redirect to Google → then back to /dashboard
    // If error, show it
    if (error) {
      setFormError(error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--np-text-secondary)' }}>
          Sign in to continue to your dashboard
        </p>
      </div>

      {/* Google */}
      <SocialLoginButtons
        onGoogle={handleGoogle}
        disabled={isLoading || isGoogleLoading}
      />

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--np-border-strong)' }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          or continue with email
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--np-border-strong)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <FormField
          id="login-email" label="Email" type="email"
          placeholder="you@university.edu" value={email} onChange={(v) => { setEmail(v); setFormError(null); }}
          icon={<Mail style={{ width: 18, height: 18 }} />}
        />

        <FormField
          id="login-password" label="Password" type={showPassword ? 'text' : 'password'}
          placeholder="••••••••" value={password} onChange={(v) => { setPassword(v); setFormError(null); }}
          icon={<Lock style={{ width: 18, height: 18 }} />}
          rightSlot={
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--np-text-muted)', padding: 0, display: 'flex' }}>
              {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
            </button>
          }
        />

        {/* Global form error */}
        {formError && (
          <p style={{ fontSize: '13px', color: 'var(--np-error)', margin: 0, padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {formError}
          </p>
        )}

        {/* Remember & Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--np-text-secondary)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--np-blue)', cursor: 'pointer' }}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--np-blue)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        {/* CTA */}
        <motion.button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          style={{
            width: '100%', height: '52px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
            color: '#fff', fontSize: '15px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(59,130,246,0.35)', letterSpacing: '0.01em', marginTop: '4px',
            opacity: isLoading || isGoogleLoading ? 0.75 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {isLoading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : null}
          {isLoading ? 'Signing in...' : 'Log In'}
        </motion.button>
      </form>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--np-text-secondary)', marginTop: '24px' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ fontWeight: 700, color: 'var(--np-blue)', textDecoration: 'none' }}>
          Sign up free
        </Link>
      </p>
    </AuthCard>
  );
}
