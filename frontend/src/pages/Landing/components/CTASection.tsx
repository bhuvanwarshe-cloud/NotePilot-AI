import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-electricBlue/10 -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-12 overflow-hidden border border-border/50 bg-surface/30 backdrop-blur-xl shadow-2xl"
        >
          {/* Decorative glows inside the card */}
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-electricBlue/20 rotate-12 blur-3xl rounded-full" />
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-purpleAccent/20 -rotate-12 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electricBlue to-purpleAccent flex items-center justify-center mb-6 shadow-lg shadow-electricBlue/30">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to upgrade your GPA?</h2>
            <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already learning faster, retaining more, and saving hours of study time every week.
            </p>
            
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-gray-100 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Link to="/signup">Start Learning for Free</Link>
            </Button>
            <p className="text-sm text-textSecondary mt-4">No credit card required. Free plan available.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
