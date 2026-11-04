import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, BookOpen, Crown, Lock, ArrowRight, Eye, Star, Compass } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';

export default function Home() {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: BookOpen,
      title: t('pillars.p1_title'),
      desc: t('pillars.p1_desc'),
      degree: 'Gnosis',
    },
    {
      icon: Crown,
      title: t('pillars.p2_title'),
      desc: t('pillars.p2_desc'),
      degree: 'Imperium',
    },
    {
      icon: Compass,
      title: t('pillars.p3_title'),
      desc: t('pillars.p3_desc'),
      degree: 'Concordia',
    },
    {
      icon: Lock,
      title: t('pillars.p4_title'),
      desc: t('pillars.p4_desc'),
      degree: 'Arcanum',
    },
  ];

  const tiers = [
    {
      id: 'novitiate',
      title: t('tiers.novitiate_title'),
      desc: t('tiers.novitiate_desc'),
      badge: 'Tier I',
      highlight: false,
    },
    {
      id: 'minor',
      title: t('tiers.minor_title'),
      desc: t('tiers.minor_desc'),
      badge: 'Tier II',
      highlight: false,
    },
    {
      id: 'major',
      title: t('tiers.major_title'),
      desc: t('tiers.major_desc'),
      badge: 'Tier III',
      highlight: true,
    },
    {
      id: 'rex',
      title: t('tiers.rex_title'),
      desc: t('tiers.rex_desc'),
      badge: 'Inner Sanctum',
      highlight: false,
    },
  ];

  return (
    <div className="pyramid-bg min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-24 md:pb-36 border-b border-[#d4af37]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="relative inline-block mb-6 group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#aa820a] via-[#ffd700] to-[#634b03] shadow-2xl shadow-amber-950/80 animate-eye-pulse">
              <img
                src="/images/illuminati-bg.jpg"
                alt="Illuminati Official Seal"
                className="w-full h-full object-cover rounded-full border-2 border-black/90 brightness-110"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#14131a]/80 text-[#d4af37] text-xs font-mono tracking-widest uppercase mb-6">
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{t('hero.eyebrow')}</span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-wider text-gold-gradient uppercase mb-6 drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          <p className="font-serif-subtle text-lg sm:text-2xl text-[#d4cdb8] max-w-3xl mx-auto leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <GoldButton size="lg" icon={ArrowRight}>
                {t('hero.ctaRegister')}
              </GoldButton>
            </Link>
            <Link to="/login">
              <GoldButton size="lg" variant="secondary">
                {t('hero.ctaLogin')}
              </GoldButton>
            </Link>
          </div>

          {/* Mysterious Latin Seal Subtext */}
          <div className="mt-14 pt-8 border-t border-[#d4af37]/10 flex justify-center items-center gap-8 text-[11px] font-mono tracking-widest text-[#8a8475] uppercase">
            <span>Ordo Ab Chao</span>
            <span className="text-[#d4af37]">•</span>
            <span>Lux In Tenebris</span>
            <span className="text-[#d4af37]">•</span>
            <span>Sapientia Aeterna</span>
          </div>

        </div>
      </section>

      {/* Four Sacred Pillars */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-gold-gradient mb-4">
            {t('pillars.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#a8a192] font-serif-subtle">
            {t('pillars.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#0e0e13]/80 border border-[#d4af37]/25 rounded-lg p-6 hover:border-[#d4af37]/70 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded bg-[#181822] border border-[#d4af37]/30 text-[#d4af37] group-hover:text-amber-300 group-hover:border-[#d4af37]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#886915]">
                    {p.degree}
                  </span>
                </div>
                <h3 className="font-cinzel text-lg font-semibold text-[#f0e4b8] mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-[#a39c8c] leading-relaxed font-serif-subtle">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Degrees of Illumination (Tiers) */}
      <section className="py-20 bg-[#09090d]/90 border-t border-b border-[#d4af37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-gold-gradient mb-4">
              {t('tiers.title')}
            </h2>
            <p className="text-sm sm:text-base text-[#a8a192] font-serif-subtle">
              {t('tiers.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-lg p-6 transition-all duration-300 flex flex-col justify-between ${
                  tier.highlight
                    ? 'bg-[#12121c] border-2 border-[#d4af37] shadow-xl shadow-amber-950/30'
                    : 'bg-[#0c0c11] border border-[#d4af37]/20 hover:border-[#d4af37]/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#1c1b24] text-[#d4af37] border border-[#d4af37]/30">
                      {tier.badge}
                    </span>
                    {tier.highlight && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-300 font-mono">
                        <Star className="w-3 h-3 fill-amber-300" /> Grand Conclave
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#f5e6b3] mb-3">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-[#aba596] leading-relaxed font-serif-subtle mb-6">
                    {tier.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Link to="/register" className="block text-center">
                    <span className="text-xs font-cinzel uppercase tracking-wider text-[#d4af37] hover:text-[#fff1a8] transition-colors">
                      {t('hero.ctaRegister')} →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Initiation Banner */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-[#14141c] to-[#0c0c11] border border-[#d4af37]/40 rounded-xl p-10 md:p-16 gold-box-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
            <GeometricEye size={220} glow={false} />
          </div>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-gold-gradient mb-4">
            The Gates of the Sanctum Are Open
          </h2>
          <p className="text-sm sm:text-base text-[#cfc8b4] font-serif-subtle max-w-2xl mx-auto mb-8 leading-relaxed">
            Will you remain within the profane shadow of the multitude, or step across the threshold into sovereign brotherhood?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <GoldButton size="lg" icon={Shield}>
                {t('hero.ctaRegister')}
              </GoldButton>
            </Link>
            <Link to="/about">
              <GoldButton size="lg" variant="ghost">
                {t('hero.ctaLearn')}
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

