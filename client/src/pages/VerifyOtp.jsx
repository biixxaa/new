import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state || {};
  const { phoneNumber, fullName, password, carrier, tempOtp } = state;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  // 60-second cooldown for resending
  const [resendCooldown, setResendCooldown] = useState(60);
  // 5-minute (300s) expiry countdown
  const [expiryCountdown, setExpiryCountdown] = useState(300);

  const inputRefs = useRef([]);

  // Redirect if no phone number in state
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/register');
    }
  }, [phoneNumber, navigate]);

  // Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const triggerInitiationConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#d4af37', '#ffffff', '#aa820a'],
    });
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setErrorMsg(t('otp.placeholder'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify OTP
      const verifyRes = await api.verifyOtp({
        phoneNumber,
        otp: fullOtp,
      });

      // 2. Complete registration if password was provided in registration flow
      let authUser = null;
      let authToken = null;

      if (password) {
        const regRes = await api.register({
          fullName,
          phoneNumber,
          password,
        });
        authUser = regRes.user;
        authToken = regRes.token;
      } else {
        // If login flow via OTP
        authUser = verifyRes.user;
        authToken = verifyRes.token;
      }

      triggerInitiationConfetti();

      if (authToken && authUser) {
        login(authToken, authUser);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        navigate('/login', { state: { registered: true, phone: phoneNumber } });
      }
    } catch (err) {
      console.error('OTP Verification failed:', err);
      const data = err.data || {};
      if (data.attemptsRemaining !== undefined) {
        setAttemptsRemaining(data.attemptsRemaining);
      }
      setErrorMsg(err.message || t('otp.invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await api.sendOtp({
        phoneNumber,
        fullName: fullName || 'Initiate',
        language: i18n.language || 'en',
      });
      setResendCooldown(60);
      setExpiryCountdown(300);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <GeometricEye size={76} glow={true} />
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-gold-gradient mt-4">
            {t('otp.title')}
          </h1>
          <p className="font-serif-subtle text-xs sm:text-sm text-[#c5bea9] mt-2">
            {t('otp.subtitle')}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-[#16151f] border border-[#d4af37]/30 text-xs font-mono text-[#ffd966]">
            <span>{phoneNumber}</span>
            {carrier && <span className="text-[10px] text-[#aa820a]">({carrier})</span>}
          </div>
        </div>

        {/* Dev / Sandbox Helper Notice */}
        {tempOtp && (
          <div className="mb-6 p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Dev Holy Sigil: <strong>{tempOtp}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const digits = tempOtp.split('');
                setOtpDigits(digits);
              }}
              className="px-2 py-0.5 rounded bg-amber-700/50 hover:bg-amber-600 text-black font-semibold text-[10px] uppercase font-cinzel"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#0e0e14]/95 border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 gold-box-shadow backdrop-blur-md">
          
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded bg-red-950/50 border border-red-700/50 flex items-start gap-2.5 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div>
                <p>{errorMsg}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-amber-300">
                    {t('otp.attemptsLeft', { count: attemptsRemaining })}
                  </p>
                )}
              </div>
            </div>
          )}

          {expiryCountdown === 0 && (
            <div className="mb-4 p-2 text-center text-xs text-red-400 bg-red-950/20 rounded border border-red-800/30">
              {t('otp.expired')}
            </div>
          )}

          <p className="text-xs text-center text-[#9c9586] mb-6 font-serif-subtle">
            {t('otp.instructions')}
          </p>

          {/* 6 Digit Inputs */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-lg bg-[#14141d] border border-[#d4af37]/40 text-[#fff2b2] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            {/* Expiry & Resend status */}
            <div className="flex items-center justify-between text-xs font-mono text-[#8c8678] mb-6">
              <span>Expires: {formatSeconds(expiryCountdown)}</span>
              {resendCooldown > 0 ? (
                <span className="text-[#a89045]">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('otp.resendBtn')}
                </button>
              )}
            </div>

            {/* Verify Button */}
            <GoldButton
              type="submit"
              size="lg"
              loading={loading}
              disabled={fullOtp.length !== 6 || expiryCountdown === 0}
              icon={ShieldCheck}
              className="w-full"
            >
              {loading ? t('otp.verifying') : t('otp.verifyBtn')}
            </GoldButton>
          </form>

          {/* Change phone link */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs text-[#a8a192] hover:text-[#d4af37] transition-colors font-cinzel uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" />
              {t('otp.changeNumber')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

