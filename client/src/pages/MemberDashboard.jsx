import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, Clock, Award, FileText, Bell, Sparkles, ExternalLink, CreditCard } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function MemberDashboard() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const appRes = await api.getMemberApplication();
        setApplication(appRes.application || null);
      } catch (err) {
        console.warn('Could not fetch application dossier:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          text: t('dashboard.statusApproved'),
          bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40',
          icon: CheckCircle,
        };
      case 'UNDER_REVIEW':
        return {
          text: t('dashboard.statusUnderReview'),
          bg: 'bg-amber-950/40 text-amber-300 border-amber-600/40',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          text: t('dashboard.statusRejected'),
          bg: 'bg-red-950/40 text-red-300 border-red-600/40',
          icon: Shield,
        };
      default:
        return {
          text: t('dashboard.statusPending'),
          bg: 'bg-blue-950/40 text-blue-300 border-blue-600/40',
          icon: Clock,
        };
    }
  };

  const appStatus = application?.status || user?.applicationStatus || 'PENDING';
  const badgeInfo = getStatusBadge(appStatus);
  const StatusIcon = badgeInfo.icon;

  return (
    <div className="pyramid-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-[#0e0e14]/90 border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 gold-box-shadow flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <GeometricEye size={72} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#1c1b24] text-[#d4af37] border border-[#d4af37]/30">
                  {user?.membershipTier || 'Novitiate (Classis I)'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-600/40 text-emerald-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {t('dashboard.verified')}
                </span>
              </div>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#f7e7a9] mt-2">
                {t('dashboard.greeting')}, {user?.fullName}
              </h1>
              <p className="font-serif-subtle text-xs sm:text-sm text-[#b8b09d] mt-1">
                {t('dashboard.welcomeSub')}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#8c8577] uppercase">
              {t('dashboard.memberId')}
            </span>
            <span className="text-sm font-mono font-bold text-[#ffd966] mt-0.5">
              {user?.id ? `ILLUM-${String(user.id).padStart(6, '0')}` : 'ILLUM-000001'}
            </span>
            <span className="text-xs text-[#7d786d] mt-1 font-mono">{user?.phoneNumber}</span>
          </div>
        </div>

        {/* Registration Fee Covenant Navigation Card */}
        <div className="bg-gradient-to-r from-[#14121a] via-[#1a1714] to-[#12121c] border-2 border-[#d4af37]/40 rounded-xl p-6 gold-box-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3.5 rounded-full bg-amber-950/60 border border-amber-600/50 text-[#ffd966] shadow-lg flex-shrink-0">
              <CreditCard className="w-6 h-6 text-[#ffd966]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-cinzel uppercase tracking-wider text-[#d4af37] font-bold">
                  {t('dashboard.paymentNavTitle') || 'Registration Initiation Fee (3,499 ETB)'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  application?.payment_status === 'VERIFIED'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                    : application?.payment_status === 'PENDING'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500 animate-pulse'
                    : 'bg-red-950/40 text-red-300 border-red-700/50'
                }`}>
                  {application?.payment_status === 'VERIFIED'
                    ? (t('payment.statusVerified') || 'PAID & SANCTIFIED')
                    : application?.payment_status === 'PENDING'
                    ? (t('payment.statusPending') || 'VERIFICATION PENDING')
                    : (t('payment.statusUnpaid') || 'AWAITING PAYMENT')}
                </span>
              </div>
              <p className="font-serif-subtle text-xs sm:text-sm text-[#ccc5b0] mt-1 max-w-xl">
                {t('payment.navCardSummary') || 'New members must settle the 3,499 ETB fee through Bank of Abyssinia (BOA: 242982037 - Biniam Miheret) or Telebirr (0955912092 - Biniam Miheret).'}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 z-10 w-full md:w-auto">
            <Link to="/payment">
              <GoldButton size="md" icon={CreditCard} className="w-full md:w-auto shadow-md">
                {application?.payment_status === 'VERIFIED'
                  ? (t('payment.viewReceiptBtn') || 'View Payment Record')
                  : (t('payment.settleFeeBtn') || 'Settle Registration Fee')}
              </GoldButton>
            </Link>
          </div>
        </div>

        {/* Grid Stats & Dossier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Degree & Seal Card */}
          <div className="bg-[#0c0c11]/90 border border-[#d4af37]/25 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-cinzel text-[#d4af37] tracking-wider uppercase">
                  {t('dashboard.degree')}
                </span>
                <Award className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-[#f5eedb] mb-2">
                {user?.membershipTier || 'Novitiate (Classis I)'}
              </h3>
              <p className="font-serif-subtle text-xs text-[#a39c8c] leading-relaxed">
                {t('tiers.novitiate_desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#8c8678]">
              <span>Joined:</span>
              <span className="font-mono text-[#d4af37]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>

          {/* Application Status Card */}
          <div className="bg-[#0c0c11]/90 border border-[#d4af37]/25 rounded-xl p-6 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-cinzel text-[#d4af37] tracking-wider uppercase">
                  {t('dashboard.membershipStatus')}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border ${badgeInfo.bg}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {badgeInfo.text}
                </span>
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedb] mb-2">
                Tribunal Review Protocol
              </h3>
              <p className="font-serif-subtle text-xs sm:text-sm text-[#aba596] leading-relaxed mb-4">
                {application?.notes || 'Your petition and verified telecommunications vessel signature have been inscribed onto the sovereign council ledger.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <Link to="/application-status">
                <GoldButton size="sm" variant="secondary" icon={ExternalLink}>
                  {t('dashboard.viewStatus')}
                </GoldButton>
              </Link>
              <span className="text-[11px] font-mono text-[#787367]">
                Seal Hash: {user?.id ? `SHA256-${user.id * 8974}` : 'SEC-9923'}
              </span>
            </div>
          </div>

        </div>

        {/* High Council Decrees */}
        <div className="bg-[#0d0d14]/90 border border-[#d4af37]/20 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#d4af37]" />
            <h2 className="font-cinzel text-lg font-bold text-[#f5e6b3]">
              {t('dashboard.noticeTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#14141e] border border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] mb-2" />
              <p className="text-xs text-[#c4bdae] leading-relaxed font-serif-subtle">
                {t('dashboard.notice1')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#14141e] border border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] mb-2" />
              <p className="text-xs text-[#c4bdae] leading-relaxed font-serif-subtle">
                {t('dashboard.notice2')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#14141e] border border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] mb-2" />
              <p className="text-xs text-[#c4bdae] leading-relaxed font-serif-subtle">
                {t('dashboard.notice3')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

