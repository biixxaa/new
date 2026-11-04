import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import GeometricEye from './GeometricEye';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ' },
    { code: 'om', label: 'Afaan Oromoo', native: 'Afaan Oromoo' },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#07070a]/95 backdrop-blur-md border-b border-[#d4af37]/20 shadow-2xl shadow-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Seal */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] via-[#ffd966] to-[#aa820a] shadow-md shadow-amber-950/50 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/illuminati-bg.jpg"
                alt="Ordo Seal"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-base sm:text-lg font-bold tracking-widest text-[#f5e6b3] group-hover:text-gold-gradient transition-colors">
                ILLUMINATI MEMBERSHIP
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#aa820a] uppercase font-mono">
                Official Sanctuary Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-cinzel text-xs tracking-wider uppercase transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-[#f5e6b3] border-b-2 border-[#d4af37] pb-1'
                    : 'text-[#9e9aa8] hover:text-[#d4af37]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`font-cinzel text-xs tracking-wider uppercase transition-colors duration-200 ${
                    isActive('/dashboard')
                      ? 'text-[#f5e6b3] border-b-2 border-[#d4af37] pb-1'
                      : 'text-[#9e9aa8] hover:text-[#d4af37]'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/application-status"
                  className={`font-cinzel text-xs tracking-wider uppercase transition-colors duration-200 ${
                    isActive('/application-status')
                      ? 'text-[#f5e6b3] border-b-2 border-[#d4af37] pb-1'
                      : 'text-[#9e9aa8] hover:text-[#d4af37]'
                  }`}
                >
                  {t('nav.status')}
                </Link>
                <Link
                  to="/payment"
                  className={`font-cinzel text-xs tracking-wider uppercase transition-colors duration-200 ${
                    isActive('/payment')
                      ? 'text-[#f5e6b3] border-b-2 border-[#d4af37] pb-1'
                      : 'text-[#ffd966] hover:text-[#fff0a8] font-semibold'
                  }`}
                >
                  {t('nav.payment') || 'Registration Fee'}
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-cinzel tracking-wider uppercase text-amber-300 bg-amber-950/40 border border-amber-600/40 rounded hover:bg-amber-900/40 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                {t('nav.admin')}
              </Link>
            )}
          </nav>

          {/* Right Action: Language Selector & Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#121218] border border-[#d4af37]/30 text-xs text-[#e6d7a8] hover:border-[#d4af37] transition-all cursor-pointer"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="font-medium">{currentLang.native}</span>
                <ChevronDown className="w-3 h-3 text-[#aa820a]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md bg-[#0f0f15] border border-[#d4af37]/40 shadow-2xl py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                        i18n.language === lang.code
                          ? 'bg-[#24211a] text-[#ffd966] font-semibold'
                          : 'text-[#c2bcaf] hover:bg-[#1a1922] hover:text-white'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-[#7d786d] uppercase font-mono">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-xs text-[#e2d4a8] hover:text-white font-cinzel"
                >
                  <User className="w-4 h-4 text-[#d4af37]" />
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#9e9aa8] hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-cinzel uppercase tracking-wider text-[#d4af37] hover:text-[#fff1a8] transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-cinzel uppercase tracking-wider font-semibold rounded bg-gradient-to-r from-[#edd376] to-[#aa820a] text-black hover:brightness-110 shadow-md shadow-amber-950/40 transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Quick Lang Button on Mobile */}
            <button
              onClick={() => {
                const next = currentLang.code === 'en' ? 'am' : currentLang.code === 'am' ? 'om' : 'en';
                changeLanguage(next);
              }}
              className="px-2 py-1 bg-[#14141c] border border-[#d4af37]/40 rounded text-xs text-[#d4af37] font-medium"
            >
              {currentLang.code.toUpperCase()}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#d4af37] hover:text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c12] border-b border-[#d4af37]/30 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded text-sm font-cinzel ${
                  isActive(link.path)
                    ? 'bg-[#1e1c15] text-[#ffd966] font-semibold'
                    : 'text-[#b8b3a5] hover:bg-[#15151e]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded text-sm font-cinzel ${
                    isActive('/dashboard')
                      ? 'bg-[#1e1c15] text-[#ffd966] font-semibold'
                      : 'text-[#b8b3a5] hover:bg-[#15151e]'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/application-status"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded text-sm font-cinzel ${
                    isActive('/application-status')
                      ? 'bg-[#1e1c15] text-[#ffd966] font-semibold'
                      : 'text-[#b8b3a5] hover:bg-[#15151e]'
                  }`}
                >
                  {t('nav.status')}
                </Link>
                <Link
                  to="/payment"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded text-sm font-cinzel ${
                    isActive('/payment')
                      ? 'bg-[#1e1c15] text-[#ffd966] font-semibold'
                      : 'text-[#ffd966] hover:bg-[#15151e]'
                  }`}
                >
                  {t('nav.payment') || 'Registration Fee'} (3,499 ETB)
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded text-sm font-cinzel text-amber-300 bg-amber-950/30 border border-amber-600/30 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Language Selection in Mobile Drawer */}
          <div className="pt-3 border-t border-[#d4af37]/20">
            <span className="text-[11px] text-[#8e897e] uppercase tracking-wider block mb-2 font-mono">
              Language / ቋንቋ / Afaan
            </span>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`px-2 py-1.5 text-xs rounded border text-center transition-colors ${
                    i18n.language === l.code
                      ? 'bg-[#d4af37] text-black font-bold border-[#d4af37]'
                      : 'bg-[#14141c] text-[#c2bcaf] border-white/10 hover:border-[#d4af37]/40'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          {/* Auth in Mobile Drawer */}
          <div className="pt-4 border-t border-[#d4af37]/20 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-red-950/40 border border-red-700/40 text-red-300 text-xs font-cinzel uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')} ({user.fullName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-cinzel uppercase tracking-wider text-[#d4af37] border border-[#d4af37]/40 rounded bg-[#121218]"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-cinzel uppercase tracking-wider font-semibold rounded bg-gradient-to-r from-[#edd376] to-[#aa820a] text-black"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

