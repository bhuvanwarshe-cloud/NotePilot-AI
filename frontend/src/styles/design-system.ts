export const DesignSystem = {
  colors: {
    backgroundPrimary: '#0B0F19', // Deep navy
    backgroundSecondary: '#111827', // Slightly lighter navy/gray
    surface: '#1F2937', // For cards and elevated elements
    border: '#374151',
    textPrimary: '#F9FAFB', // White-ish
    textSecondary: '#9CA3AF', // Gray
    electricBlue: '#3B82F6', // Primary accent
    purpleAccent: '#8B5CF6', // Secondary accent for gradients
    success: '#10B981',
    warning: '#F59E0B',
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
  },
  borderRadius: {
    card: '1rem',     // 16px
    button: '0.5rem', // 8px
    modal: '1.5rem',  // 24px
  },
  animationDurations: {
    fast: 0.15,   // 150ms for Framer Motion
    normal: 0.3,  // 300ms
    slow: 0.5,    // 500ms
  },
  typography: {
    hero: 'text-5xl md:text-7xl font-extrabold tracking-tight',
    heading: 'text-3xl md:text-4xl font-bold tracking-tight',
    subheading: 'text-xl md:text-2xl font-semibold',
    body: 'text-base font-normal leading-relaxed',
    caption: 'text-sm font-medium',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glowBlue: '0 0 20px rgba(59, 130, 246, 0.3)',
    glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)',
  }
};
