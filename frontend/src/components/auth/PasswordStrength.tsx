import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (pass.match(/[A-Z]/)) strength += 1;
    if (pass.match(/[0-9]/)) strength += 1;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const strength = calculateStrength(password);

  const getSegmentColor = (index: number) => {
    if (index >= strength) return 'var(--np-border-strong)';
    if (strength === 1) return 'var(--np-error)';
    if (strength === 2) return 'var(--np-amber)';
    if (strength === 3) return 'var(--np-blue)';
    return 'var(--np-success)';
  };

  const getStrengthText = () => {
    switch (strength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Enter password';
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex gap-1.5 w-full h-1.5">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="flex-1 rounded-full overflow-hidden"
            initial={{ backgroundColor: 'var(--np-border-strong)' }}
            animate={{ backgroundColor: getSegmentColor(index) }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <motion.span 
        className="text-xs font-medium text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={strength}
        style={{ color: strength === 0 ? 'var(--np-text-muted)' : getSegmentColor(0) }}
      >
        {getStrengthText()}
      </motion.span>
    </div>
  );
}
