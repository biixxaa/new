import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, User, Phone, CheckCircle2, AlertCircle, Sparkles, Banknote } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { validateAndNormalizePhone } from '../utils/phoneValidator';
import { api } from '../services/api';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    countryCode: '+251',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [validation, setValidation] = useState({
    phoneCarrier: null,
    phoneValid: false,
    phoneNormalized: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle phone changes with real-time Ethiopian carrier detection
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    setFormData((prev) => ({ ...prev, phone: rawValue }));

    if (rawValue.trim().length >= 4) {
      const result = validateAndNormalizePhone(rawValue, formData.countryCode);
      setValidation({
        phoneCarrier: result.carrier,
        phoneValid: result.isValid,
        phoneNormalized: result.normalized,
      });
      if (result.isValid && errors.phone) {
        setErrors((prev) => ({ ...prev, phone: null }));
      }
    } else {
      setValidation({
        phoneCarrier: null,
        phoneValid: false,
        phoneNormalized: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = t('register.errors.nameRequired');
    }

    const phoneResult = validateAndNormalizePhone(formData.phone, formData.countryCode);
    if (!phoneResult.isValid) {
      newErrors.phone = t('register.errors.invalidPhone');
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = t('register.errors.passwordShort');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordMismatch');
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('register.errors.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const phoneResult = validateAndNormalizePhone(formData.phone, formData.countryCode);
      const normalizedPhone = phoneResult.normalized;

      // 1. Send OTP request to backend
      const res = await api.sendOtp({
        phoneNumber: normalizedPhone,
        fullName: formData.fullName.trim(),
        language: i18n.language || 'en',
      });

      // 2. Navigate to OTP verification page with registration payload in state
      navigate('/verify-otp', {
        state: {
          phoneNumber: normalizedPhone,
          fullName: formData.fullName.trim(),
          password: formData.password,
          carrier: phoneResult.carrier,
          language: i18n.language || 'en',
          tempOtp: res.debugOtp || null, // Provided in development/sandbox mode for testing
        },
      });
    } catch (err) {
      console.error('Registration/OTP error:', err);
      if (err.status === 409) {
        setServerError(t('register.errors.duplicatePhone'));
      } else {
        setServerError(err.message || t('register.errors.serverError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pyramid-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        
        {/* Header with Emblem */}
        <div className="text-center mb-8">
          <GeometricEye size={80} glow={true} />
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-gold-gradient mt-4">
            {t('register.title')}
          </h1>
          <p className="font-serif-subtle text-sm sm:text-base text-[#cfc8b4] max-w-md mx-auto mt-2">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0d0d12]/95 border border-[#d4af37]/30 rounded-xl p-6 sm:p-10 gold-box-shadow backdrop-blur-md">
          {serverError && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-700/50 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold">Sanctum Communique:</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <section className="mb-6 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/[0.07] p-4" aria-label={t('register.paymentTitle')}>
            <div className="flex items-start gap-3">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-[#d4af37]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 className="font-cinzel text-sm font-semibold text-[#f5eedb]">
                  {t('register.paymentTitle')}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#e2d6b3]">
                  {t('register.paymentAmount')}
                </p>
                <div className="mt-3 grid gap-2 text-xs text-[#b8b2a2] sm:grid-cols-2">
                  <p className="break-words rounded border border-white/10 bg-black/20 px-3 py-2">
                    <span className="block text-[#e2d6b3]">{t('register.paymentBank')}</span>
                    <span className="font-mono">242982037</span>
                    <span> · Biniam Miheret</span>
                  </p>
                  <p className="break-words rounded border border-white/10 bg-black/20 px-3 py-2">
                    <span className="block text-[#e2d6b3]">{t('register.paymentTelebirr')}</span>
                    <span className="font-mono">0955912092</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('register.fullName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('register.fullNamePlaceholder')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded bg-[#13131a] border text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:ring-1 transition-all ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37]'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone Number with Carrier Detection */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3]">
                  {t('register.phone')}
                </label>
                {validation.phoneCarrier && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-300">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    {validation.phoneCarrier}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Country Code Selector (Default +251) */}
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
                >
                  <option value="+251">🇪🇹 +251 (Ethiopia)</option>
                  <option value="+1">🇺🇸 +1 (USA)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+254">🇰🇪 +254 (Kenya)</option>
                </select>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder={t('register.phonePlaceholder')}
                    className={`w-full pl-10 pr-10 py-2.5 rounded bg-[#13131a] border text-sm text-[#f5eedb] placeholder-[#5a564c] font-mono focus:outline-none focus:ring-1 transition-all ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : validation.phoneValid
                        ? 'border-emerald-500/80 focus:ring-emerald-500'
                        : 'border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37]'
                    }`}
                  />
                  {validation.phoneValid && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#858072] mt-1 font-serif-subtle">
                {t('register.phoneHint')}
              </p>
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>

            {/* Secret Passcode */}
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('register.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('register.passwordPlaceholder')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded bg-[#13131a] border text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:ring-1 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37]'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Secret Passcode */}
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('register.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('register.passwordPlaceholder')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded bg-[#13131a] border text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:ring-1 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37]'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-[#d4af37]/50 bg-[#14141c] text-[#d4af37] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#d4af37]"
                />
                <span className="text-xs text-[#b8b2a2] leading-relaxed">
                  {t('register.termsAgree')}{' '}
                  <Link to="/terms" target="_blank" className="text-[#d4af37] underline hover:text-[#fff1a8]">
                    {t('footer.terms')}
                  </Link>{' '}
                  &amp;{' '}
                  <Link to="/privacy" target="_blank" className="text-[#d4af37] underline hover:text-[#fff1a8]">
                    {t('footer.privacy')}
                  </Link>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-400 mt-1">{errors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <GoldButton
                type="submit"
                size="lg"
                loading={loading}
                icon={Shield}
                className="w-full"
              >
                {loading ? t('register.submitting') : t('register.submitBtn')}
              </GoldButton>
            </div>

          </form>

          {/* Already initiated link */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-[#8c8678]">
            <span>{t('register.alreadyMember')} </span>
            <Link to="/login" className="text-[#d4af37] font-semibold hover:underline">
              {t('register.loginLink')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

