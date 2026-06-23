import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-backgroundPrimary/80 backdrop-blur-md z-50"
    >
      <div className="flex items-center justify-between px-6 h-full max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-electricBlue to-purpleAccent flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-textPrimary">NotePilot</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">Pricing</a>
          <a href="#faq" className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="hidden md:block text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">
            Login
          </Link>
          <Button asChild className="bg-electricBlue hover:bg-blue-600 text-white border-0">
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
