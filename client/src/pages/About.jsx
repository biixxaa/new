import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <GeometricEye size={100} />
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-gold-gradient mb-4">
            {t('about.title')}
          </h1>
          <p className="font-serif-subtle text-base sm:text-xl text-[#d4cebb] max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Narrative Sections */}
        <div className="space-y-10">
          <div className="bg-[#0e0e14]/90 border border-[#d4af37]/30 rounded-xl p-8 sm:p-10 gold-box-shadow">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5e6b3] mb-4 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#d4af37] inline-block rounded-sm" />
              {t('about.section1_title')}
            </h2>
            <p className="font-serif-subtle text-base sm:text-lg text-[#ccc6b2] leading-relaxed">
              {t('about.section1_text')}
            </p>
          </div>

          <div className="bg-[#0e0e14]/90 border border-[#d4af37]/30 rounded-xl p-8 sm:p-10 gold-box-shadow">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5e6b3] mb-4 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#d4af37] inline-block rounded-sm" />
              {t('about.section2_title')}
            </h2>
            <p className="font-serif-subtle text-base sm:text-lg text-[#ccc6b2] leading-relaxed">
              {t('about.section2_text')}
            </p>
          </div>

          <div className="bg-[#0e0e14]/90 border border-[#d4af37]/30 rounded-xl p-8 sm:p-10 gold-box-shadow">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5e6b3] mb-4 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#d4af37] inline-block rounded-sm" />
              {t('about.section3_title')}
            </h2>
            <p className="font-serif-subtle text-base sm:text-lg text-[#ccc6b2] leading-relaxed">
              {t('about.section3_text')}
            </p>
          </div>
        </div>

        {/* Sacred Seal Callout */}
        <div className="mt-16 text-center border-t border-[#d4af37]/20 pt-12">
          <p className="font-cinzel text-xs tracking-widest text-[#aa820a] uppercase mb-6">
            Initiation is not bestowed; it is claimed by those of noble intellect.
          </p>
          <Link to="/register">
            <GoldButton size="lg">
              {t('hero.ctaRegister')}
            </GoldButton>
          </Link>
        </div>

      </div>
    </div>
  );
}

