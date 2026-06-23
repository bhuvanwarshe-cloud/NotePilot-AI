export function Footer() {
  return (
    <footer className="bg-backgroundPrimary border-t border-border/50 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-electricBlue to-purpleAccent flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-bold text-lg text-textPrimary">NotePilot</span>
          </div>
          <p className="text-textSecondary text-sm">
            Transforming how students learn with AI-powered notes and study tools.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-textPrimary mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-textSecondary">
            <li><a href="#features" className="hover:text-electricBlue transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-electricBlue transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-electricBlue transition-colors">Changelog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-textPrimary mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-textSecondary">
            <li><a href="#" className="hover:text-electricBlue transition-colors">About</a></li>
            <li><a href="#" className="hover:text-electricBlue transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-electricBlue transition-colors">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-textPrimary mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-textSecondary">
            <li><a href="#" className="hover:text-electricBlue transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-electricBlue transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/50 text-center text-sm text-textSecondary">
        © {new Date().getFullYear()} NotePilot. All rights reserved.
      </div>
    </footer>
  );
}
