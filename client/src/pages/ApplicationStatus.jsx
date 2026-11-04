import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, ShieldAlert, Award, ArrowLeft, ShieldCheck, FileCheck } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ApplicationStatus() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await api.getMemberApplication();
        setApplication(res.application || null);
      } catch (err) {
        console.warn('Error fetching application dossier:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, []);

  const currentStatus = application?.status || user?.applicationStatus || 'PENDING';

  const stages = [
    {
      title: t('statusPage.stage1'),
      desc: t('statusPage.stage1_desc'),
      completed: true,
      current: false,
    },
    {
      title: t('statusPage.stage2'),
      desc: t('statusPage.stage2_desc'),
      completed: currentStatus === 'APPROVED',
      current: currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW',
    },
    {
      title: t('statusPage.stage3'),
      desc: t('statusPage.stage3_desc'),
      completed: currentStatus === 'APPROVED',
      current: currentStatus === 'APPROVED',
    },
  ];

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <GeometricEye size={72} glow={true} />
          <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient mt-4">
            {t('statusPage.title')}
          </h1>
          <p className="font-serif-subtle text-sm sm:text-base text-[#cfc8b4] mt-2 max-w-xl mx-auto">
            {t('statusPage.subtitle')}
          </p>
        </div>

        {/* Current Status Banner */}
        <div className="bg-[#0e0e14]/90 border border-[#d4af37]/35 rounded-xl p-6 sm:p-8 gold-box-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#aa820a] uppercase">
                Aspirant Vessel
              </span>
              <h2 className="font-cinzel text-xl font-bold text-[#f5eedb] mt-0.5">
                {user?.fullName}
              </h2>
              <p className="font-mono text-xs text-[#8c8577] mt-0.5">{user?.phoneNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#a8a192]">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                currentStatus === 'APPROVED'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                  : currentStatus === 'REJECTED'
                  ? 'bg-red-950/60 text-red-300 border-red-500'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500'
              }`}>
                {currentStatus}
              </span>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="py-8 space-y-6">
            {stages.map((stg, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    stg.completed
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : stg.current
                      ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-[#181822] border-white/10 text-gray-500'
                  }`}>
                    {stg.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : stg.current ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-mono">{i + 1}</span>
                    )}
                  </div>
                  {i < stages.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 ${stg.completed ? 'bg-emerald-500/60' : 'bg-white/10'}`} />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3 className={`font-cinzel text-sm sm:text-base font-semibold ${
                    stg.completed ? 'text-[#f5eedb]' : stg.current ? 'text-amber-300' : 'text-[#736e65]'
                  }`}>
                    {stg.title}
                  </h3>
                  <p className="font-serif-subtle text-xs text-[#a39c8c] mt-1">
                    {stg.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Council Remarks */}
          <div className="pt-6 border-t border-white/5 bg-[#12121a]/60 rounded-lg p-4">
            <h4 className="text-xs font-cinzel text-[#d4af37] uppercase tracking-wider mb-1">
              {t('statusPage.remarksTitle')}
            </h4>
            <p className="text-xs font-serif-subtle text-[#c7c0b0] leading-relaxed">
              {application?.notes ||
                'Your sacred telecommunications vessel signature (+251...) is verified. The Grand Scribe has docketed your dossier for the forthcoming lunar convocation.'}
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center pt-4">
          <Link to="/dashboard">
            <GoldButton size="md" variant="secondary" icon={ArrowLeft}>
              {t('statusPage.returnDashboard')}
            </GoldButton>
          </Link>
        </div>

      </div>
    </div>
  );
}

