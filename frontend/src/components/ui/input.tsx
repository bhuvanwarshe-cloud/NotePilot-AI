import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--np-text-muted)] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border bg-transparent px-4 py-2 text-sm shadow-sm transition-all duration-300',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-[color:var(--np-text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-[color:var(--np-error)] focus-visible:ring-[color:var(--np-error)]'
              : 'border-[color:var(--np-border-strong)] focus-visible:border-[color:var(--np-blue)] focus-visible:ring-[color:var(--np-blue-glow)] hover:border-[color:var(--np-text-muted)]',
            icon ? 'pl-10' : '',
            className
          )}
          style={{
            color: 'var(--np-text-primary)',
          }}
          ref={ref}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs font-medium"
            style={{ color: 'var(--np-error)' }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
