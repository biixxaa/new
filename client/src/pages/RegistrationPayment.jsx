import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, CheckCircle2, Copy, Check, Clock, AlertCircle, ArrowLeft, 
  Building2, Smartphone, ShieldCheck, Sparkles, Send
} from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegistrationPayment() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [paymentData, setPaymentData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('BOA');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const boaDetails = {
    bank: 'Bank of Abyssinia (BOA)',
    accountNumber: '242982037',
    accountHolder: 'Biniam Miheret',
    amount: '3,499 ETB',
  };

  const telebirrDetails = {
    provider: 'Telebirr',
    phoneNumber: '0955912092',
    accountHolder: 'Biniam Miheret',
    amount: '3,499 ETB',
  };

  const loadPaymentInfo = async () => {
    setLoading(true);
    try {
      const res = await api.getPaymentInfo();
      if (res.payment) {
        setPaymentData(res.payment);
        if (res.payment.paymentMethod) {
          setSelectedMethod(res.payment.paymentMethod);
        }
        if (res.payment.paymentReference) {
          setTransactionRef(res.payment.paymentReference);
        }
      }
    } catch (err) {
      console.warn('Could not load payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentInfo();
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setErrorMsg(t('payment.errorRefRequired') || 'Please enter a valid transaction reference code.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.submitPayment({
        paymentMethod: selectedMethod,
        paymentReference: transactionRef.trim(),
        notes: notes.trim(),
      });
      setSuccessMsg(res.message || 'Payment proof submitted for Grand Council verification.');
      await loadPaymentInfo();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentStatus = paymentData?.paymentStatus || 'UNPAID';

  return (
    <div className="pyramid-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <GeometricEye size={72} glow={true} />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs font-mono uppercase tracking-widest mt-4 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{t('payment.consecrationFeeBadge') || 'Initiation Consecration Fee'}</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient">
            {t('payment.title') || 'Registration Fee Settlement'}
          </h1>
          <p className="font-serif-subtle text-sm sm:text-base text-[#cfc8b4] mt-2 max-w-xl mx-auto">
            {t('payment.subtitle') || 'To seal your sacred inscription into the Sovereign Order, complete the 3,499 ETB registration covenant via Bank of Abyssinia or Telebirr.'}
          </p>
        </div>

        {/* Current Payment Status Banner */}
        <div className="bg-[#0e0e14]/90 border border-[#d4af37]/35 rounded-xl p-6 gold-box-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#aa820a] uppercase">
                {t('payment.statusLabel') || 'Covenant Settlement Status'}
              </span>
              <h2 className="font-cinzel text-lg font-bold text-[#f5eedb] mt-0.5">
                {user?.fullName} (ID: {user?.id || 530052})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#a8a192]">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                paymentStatus === 'VERIFIED'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                  : paymentStatus === 'PENDING'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500 animate-pulse'
                  : paymentStatus === 'REJECTED'
                  ? 'bg-red-950/60 text-red-300 border-red-500'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}>
                {paymentStatus === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {paymentStatus === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                {paymentStatus === 'REJECTED' && <AlertCircle className="w-3.5 h-3.5" />}
                {paymentStatus}
              </span>
            </div>
          </div>

          {paymentData?.paymentReference && (
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs font-mono text-[#a8a192]">
              <span>Recorded Reference: <strong className="text-[#ffd966]">{paymentData.paymentReference}</strong> ({paymentData.paymentMethod})</span>
              <span>Required: <strong className="text-emerald-400">3,499 ETB</strong></span>
            </div>
          )}
        </div>

        {/* Two Payment Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bank of Abyssinia (BOA) Card */}
          <div className={`p-6 rounded-xl border transition-all duration-300 bg-[#0d0d14]/95 ${
            selectedMethod === 'BOA'
              ? 'border-[#d4af37] ring-1 ring-[#d4af37]/60 shadow-xl shadow-amber-950/40'
              : 'border-[#d4af37]/25 hover:border-[#d4af37]/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded bg-[#181824] border border-[#d4af37]/40 text-[#d4af37]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#f5eedb]">
                    Bank of Abyssinia (BOA)
                  </h3>
                  <span className="text-[10px] font-mono text-[#aa820a] uppercase tracking-wider">
                    Bank Transfer / Mobile Banking
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 font-mono text-xs font-bold">
                3,499 ETB
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded bg-[#13131c] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8c8678] uppercase block">Account Number</span>
                  <span className="text-sm font-bold text-[#ffd966]">{boaDetails.accountNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(boaDetails.accountNumber, 'boa_acc')}
                  className="px-2.5 py-1.5 rounded bg-[#1f1e2b] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'boa_acc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded bg-[#13131c] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8c8678] uppercase block">Account Name</span>
                  <span className="text-sm text-[#e2dac5] font-semibold">{boaDetails.accountHolder}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(boaDetails.accountHolder, 'boa_name')}
                  className="px-2.5 py-1.5 rounded bg-[#1f1e2b] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'boa_name' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedMethod('BOA')}
                className={`w-full py-2 rounded text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer ${
                  selectedMethod === 'BOA'
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'bg-[#151520] text-[#c7beac] hover:bg-[#1d1d2c]'
                }`}
              >
                {selectedMethod === 'BOA' ? 'Selected Payment Method' : 'Pay via Bank of Abyssinia'}
              </button>
            </div>
          </div>

          {/* Telebirr Card */}
          <div className={`p-6 rounded-xl border transition-all duration-300 bg-[#0d0d14]/95 ${
            selectedMethod === 'TELEBIRR'
              ? 'border-[#d4af37] ring-1 ring-[#d4af37]/60 shadow-xl shadow-amber-950/40'
              : 'border-[#d4af37]/25 hover:border-[#d4af37]/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded bg-[#181824] border border-[#d4af37]/40 text-[#d4af37]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#f5eedb]">
                    Telebirr
                  </h3>
                  <span className="text-[10px] font-mono text-[#aa820a] uppercase tracking-wider">
                    Instant Mobile Payment
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 font-mono text-xs font-bold">
                3,499 ETB
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded bg-[#13131c] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8c8678] uppercase block">Telebirr Mobile Number</span>
                  <span className="text-sm font-bold text-[#ffd966]">{telebirrDetails.phoneNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(telebirrDetails.phoneNumber, 'tele_phone')}
                  className="px-2.5 py-1.5 rounded bg-[#1f1e2b] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'tele_phone' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded bg-[#13131c] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8c8678] uppercase block">Registered Receiver</span>
                  <span className="text-sm text-[#e2dac5] font-semibold">{telebirrDetails.accountHolder}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(telebirrDetails.accountHolder, 'tele_name')}
                  className="px-2.5 py-1.5 rounded bg-[#1f1e2b] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'tele_name' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedMethod('TELEBIRR')}
                className={`w-full py-2 rounded text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer ${
                  selectedMethod === 'TELEBIRR'
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'bg-[#151520] text-[#c7beac] hover:bg-[#1d1d2c]'
                }`}
              >
                {selectedMethod === 'TELEBIRR' ? 'Selected Payment Method' : 'Pay via Telebirr'}
              </button>
            </div>
          </div>

        </div>

        {/* Verification Submission Form */}
        <div className="bg-[#0e0e14]/95 border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 gold-box-shadow">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedb]">
                {t('payment.submitTitle') || 'Submit Sacred Payment Proof'}
              </h3>
              <p className="font-serif-subtle text-xs text-[#a8a192]">
                {t('payment.submitSubtitle') || 'After completing your transfer of 3,499 ETB, input the transaction reference code received from BOA or Telebirr.'}
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-600/40 flex items-start gap-3 text-emerald-300 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">{t('common.success') || 'Proof Inscribed:'}</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-700/50 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('payment.chosenMethodLabel') || 'Payment Gateway Used'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('BOA')}
                  className={`py-2 px-3 rounded border text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedMethod === 'BOA'
                      ? 'bg-amber-950/40 border-[#d4af37] text-[#ffd966] font-bold'
                      : 'bg-[#13131c] border-white/10 text-[#8c8678]'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Bank of Abyssinia (BOA)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TELEBIRR')}
                  className={`py-2 px-3 rounded border text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedMethod === 'TELEBIRR'
                      ? 'bg-amber-950/40 border-[#d4af37] text-[#ffd966] font-bold'
                      : 'bg-[#13131c] border-white/10 text-[#8c8678]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Telebirr
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('payment.refCodeLabel') || 'Transaction Reference / Confirmation Code'}
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. FT26019842 or 8B6A567D (from SMS/App)"
                className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('payment.optionalNotesLabel') || 'Additional Notes / Sender Phone (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sent from 0911234567 in the name of..."
                className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="pt-2">
              <GoldButton
                type="submit"
                size="lg"
                loading={submitting}
                icon={Send}
                className="w-full"
              >
                {submitting
                  ? (t('payment.transmitting') || 'Inscribing Proof into Tribunal Vault...')
                  : (t('payment.submitBtn') || 'Submit Consecration Proof (3,499 ETB)')}
              </GoldButton>
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#a8a192] hover:text-[#d4af37] transition-colors font-cinzel uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.back') || 'Back'} to Member Vault
          </Link>
        </div>

      </div>
    </div>
  );
}

