import { Link } from 'react-router-dom';
import { LogoFull } from '@/components/shared/LogoFull';

export function Footer() {
  return (
    <footer
      className="py-12 px-6"
      style={{
        background: 'var(--np-bg-secondary)',
        borderTop: '1px solid var(--np-border)',
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <LogoFull className="h-9 object-contain" />
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--np-text-secondary)' }}>
            Study Smarter. Achieve More.
          </p>
        </div>

        {/* Product */}
        <FooterCol title="Product" links={[
          { label: 'Features',  href: '#features' },
          { label: 'Pricing',   href: '#pricing'  },
          { label: 'Changelog', href: '#'         },
        ]} />

        {/* Company */}
        <FooterCol title="Company" links={[
          { label: 'About',   href: '#' },
          { label: 'Blog',    href: '#' },
          { label: 'Careers', href: '#' },
        ]} />

        {/* Legal */}
        <FooterCol title="Legal" links={[
          { label: 'Privacy Policy',  href: '#' },
          { label: 'Terms of Service', href: '#' },
        ]} />
      </div>

      <div
        className="max-w-7xl mx-auto mt-12 pt-8 text-center text-sm"
        style={{
          borderTop: '1px solid var(--np-border)',
          color: 'var(--np-text-muted)',
        }}
      >
        © {new Date().getFullYear()} NotePilot. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--np-text-primary)' }}>
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--np-text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--np-blue)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--np-text-secondary)')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
