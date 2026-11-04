import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GeometricEye from './GeometricEye';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#050508] border-t border-[#d4af37]/20 pt-16 pb-12 text-[#9a958b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] via-[#ffd966] to-[#aa820a] shadow-md shadow-amber-950/50 flex-shrink-0">
                <img
                  src="/images/illuminati-bg.jpg"
                  alt="Seal"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-cinzel text-lg tracking-widest text-[#f0e2b4] font-bold">
                ILLUMINATI MEMBERSHIP
              </span>
            </div>
            <p className="text-sm font-serif-subtle text-[#c5bea9] max-w-md leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <p className="text-xs font-mono tracking-widest text-[#aa820a]">
              {t('footer.slogan')}
            </p>
          </div>

          {/* Sanctum Links */}
          <div>
            <h4 className="font-cinzel text-xs font-semibold uppercase tracking-widest text-[#f5e6b3] mb-4">
              Sanctum Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#d4af37] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#d4af37] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#d4af37] transition-colors">
                  {t('nav.register')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#d4af37] transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Secrecy Links */}
          <div>
            <h4 className="font-cinzel text-xs font-semibold uppercase tracking-widest text-[#f5e6b3] mb-4">
              Sacred Covenants
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-[#d4af37] transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#d4af37] transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#d4af37] transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#706c63]">
          <p>© {new Date().getFullYear()} Illuminati Membership. {t('footer.rights')}</p>
          <p className="text-[11px] text-center md:text-right max-w-lg italic">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}

