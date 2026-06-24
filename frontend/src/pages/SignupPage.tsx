import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

// ─── Shared FormField ────────────────────────────────────────────────────────
function FormField({
  id, label, type, placeholder, value, onChange, icon, rightSlot, error
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

// ─── Password Strength ───────────────────────────────────────────────────────
function PasswordStrengthBar({ password }: { password: string }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const colors = ['var(--np-error)', 'var(--np-amber)', 'var(--np-blue)', 'var(--np-success)'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const activeColor = score > 0 ? colors[score - 1] : 'var(--np-border-strong)';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '5px',
              borderRadius: '99px',
              background: i < score ? activeColor : 'var(--np-border-strong)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p style={{ fontSize: '12px', fontWeight: 600, color: activeColor, textAlign: 'right', margin: 0 }}>
          {labels[score - 1] ?? 'Very Weak'}
        </p>
      )}
    </div>
  );
}

// ─── Signup Success Screen ───────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <AuthCard>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', padding: '16px 0' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckCircle style={{ width: '36px', height: '36px', color: 'var(--np-success)' }} />
        </motion.div>

        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Account Created! 🎉
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--np-text-secondary)', lineHeight: 1.6 }}>
            Welcome to NotePilot. Your AI-powered study companion is ready.
          </p>
        </div>

        <Link to="/login" style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            style={{
              width: '100%', height: '52px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
              color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
            }}
          >
            Go to Login →
          </motion.button>
        </Link>
      </motion.div>
    </AuthCard>
  );
}

// ─── Main SignupPage ─────────────────────────────────────────────────────────
export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) return <SuccessScreen />;

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch || !termsAccepted) return;
    setIsSuccess(true);
  };

  return (
    <AuthCard>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Create your account
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--np-text-secondary)' }}>
          Join 50,000+ students who study smarter
        </p>
      </div>

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--np-border-strong)' }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--np-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          or register with email
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--np-border-strong)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <FormField
          id="signup-name" label="Full Name" type="text"
          placeholder="Sarah Jenkins" value={name} onChange={setName}
          icon={<User style={{ width: 18, height: 18 }} />}
        />

        <FormField
          id="signup-email" label="Email" type="email"
          placeholder="you@university.edu" value={email} onChange={setEmail}
          icon={<Mail style={{ width: 18, height: 18 }} />}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <FormField
            id="signup-password" label="Password" type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password" value={password} onChange={setPassword}
            icon={<Lock style={{ width: 18, height: 18 }} />}
            rightSlot={
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--np-text-muted)', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            }
          />
          {password.length > 0 && <PasswordStrengthBar password={password} />}
        </div>

        <FormField
          id="signup-confirm" label="Confirm Password" type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password" value={confirmPassword} onChange={setConfirmPassword}
          icon={<Lock style={{ width: 18, height: 18 }} />}
          error={passwordMismatch ? 'Passwords do not match' : undefined}
        />

        {/* Terms checkbox */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--np-blue)', flexShrink: 0, cursor: 'pointer' }}
          />
          <span>
            I agree to the{' '}
            <span style={{ color: 'var(--np-blue)', fontWeight: 600 }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--np-blue)', fontWeight: 600 }}>Privacy Policy</span>
          </span>
        </label>

        {/* CTA */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
            letterSpacing: '0.01em',
            marginTop: '4px',
          }}
        >
          Create Account
        </motion.button>
      </form>

      {/* Footer link */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--np-text-secondary)', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 700, color: 'var(--np-blue)', textDecoration: 'none' }}>
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
