export const brand = {
  colors: {
    primary: '#3B82F6', // Electric Blue
    purple: '#8B5CF6',
    gradientStart: '#0066FF',
    gradientEnd: '#8B5CF6',
    gradientLightStart: '#60A5FA',
    gradientLightEnd: '#A78BFA',
  },
  glows: {
    primary: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
    statusProcessing: 'rgba(59, 130, 246, 0.2)',
    statusDone: 'rgba(16, 185, 129, 0.2)',
  },
  status: {
    done: {
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    processing: {
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    pending: {
      color: 'var(--np-text-muted)',
      bg: 'transparent',
      border: 'var(--np-border)',
    },
    error: {
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
    secondary: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
    processing: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
  }
};
