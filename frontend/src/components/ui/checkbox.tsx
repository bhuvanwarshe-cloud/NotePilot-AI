import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, checked, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--np-blue-glow)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--np-bg-primary)]',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className
          )}
          style={{
            borderColor: checked ? 'var(--np-blue)' : 'var(--np-border-strong)',
            backgroundColor: checked ? 'var(--np-blue)' : 'transparent',
          }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </label>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
