import React from 'react';
import { useTranslation } from 'react-i18next';
import GeometricEye from '../components/GeometricEye';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#0d0d14]/95 border border-[#d4af37]/30 rounded-xl p-8 sm:p-12 gold-box-shadow">
        
        <div className="text-center mb-10 pb-8 border-b border-[#d4af37]/20">
          <GeometricEye size={64} />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-gold-gradient mt-4">
            {t('privacy.title')}
          </h1>
          <p className="text-xs font-mono text-[#aa820a] uppercase tracking-widest mt-2">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        <div className="space-y-8 font-serif-subtle text-base text-[#cfc8b4] leading-relaxed">
          <p className="italic text-lg text-[#f0e2b4] border-l-2 border-[#d4af37] pl-4">
            {t('privacy.intro')}
          </p>

          <div>
            <h2 className="font-cinzel text-lg font-bold text-[#f5e6b3] mb-2">
              {t('privacy.p1_title')}
            </h2>
            <p>{t('privacy.p1_text')}</p>
          </div>

          <div>
            <h2 className="font-cinzel text-lg font-bold text-[#f5e6b3] mb-2">
              {t('privacy.p2_title')}
            </h2>
            <p>{t('privacy.p2_text')}</p>
          </div>

          <div>
            <h2 className="font-cinzel text-lg font-bold text-[#f5e6b3] mb-2">
              {t('privacy.p3_title')}
            </h2>
            <p>{t('privacy.p3_text')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

