import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuth } from '@/hooks/useAuth';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setFormError(null);
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) { setFormError(error); return; }
    setIsSuccess(true);
  };

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', padding: '16px 0' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'rgba(59,130,246,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Send style={{ width: '32px', height: '32px', color: 'var(--np-blue)' }} />
              </motion.div>

              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
                  Check your inbox
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--np-text-secondary)', lineHeight: 1.65 }}>
                  We sent a reset link to{' '}
                  <strong style={{ color: 'var(--np-text-primary)' }}>{email}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsSuccess(false)}
                style={{
                  width: '100%', height: '48px', borderRadius: '12px',
                  border: '1px solid var(--np-border-strong)', background: 'transparent',
                  color: 'var(--np-text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Try a different email
              </button>

              <Link
                to="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--np-text-muted)', textDecoration: 'none' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                Back to log in
              </Link>
            </div>
          </AuthCard>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <AuthCard>
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'var(--np-surface-raised)', border: '1px solid var(--np-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Mail style={{ width: '22px', height: '22px', color: 'var(--np-blue)' }} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Forgot password?
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--np-text-secondary)' }}>
                No worries — we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="forgot-email" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--np-text-primary)' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-muted)', pointerEvents: 'none' }}>
                    <Mail style={{ width: 18, height: 18 }} />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%', height: '48px', paddingLeft: '44px', paddingRight: '16px',
                      borderRadius: '12px', border: '1px solid var(--np-border-strong)',
                      background: 'transparent', color: 'var(--np-text-primary)',
                      fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--np-blue)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--np-blue-glow)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--np-border-strong)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {formError && (
                <p style={{ fontSize: '13px', color: 'var(--np-error)', margin: 0, padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {formError}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                style={{
                  width: '100%', height: '52px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                  opacity: isLoading ? 0.75 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isLoading && <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                to="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--np-text-secondary)', textDecoration: 'none' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                Back to log in
              </Link>
            </div>
          </AuthCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
