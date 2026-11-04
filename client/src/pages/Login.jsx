import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Phone, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { validateAndNormalizePhone } from '../utils/phoneValidator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [phone, setPhone] = useState(location.state?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const phoneRes = validateAndNormalizePhone(phone);
    if (!phoneRes.isValid) {
      setErrorMsg(t('register.errors.invalidPhone'));
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your secret seal passcode.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({
        phoneNumber: phoneRes.normalized,
        password,
      });

      login(res.token, res.user);

      if (res.user.role === 'ADMIN' || res.user.role === 'SUPERADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.data?.isPhoneVerified === false) {
        // Need verification
        navigate('/verify-otp', {
          state: {
            phoneNumber: phoneRes.normalized,
            fullName: err.data?.fullName || 'Brother',
          },
        });
      } else {
        setErrorMsg(err.message || t('login.errors.invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <GeometricEye size={80} glow={true} />
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-gold-gradient mt-4">
            {t('login.title')}
          </h1>
          <p className="font-serif-subtle text-xs sm:text-sm text-[#cfc8b4] mt-2">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0e0e14]/95 border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 gold-box-shadow backdrop-blur-md">
          
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded bg-red-950/40 border border-red-700/50 flex items-start gap-2.5 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Phone */}
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('login.identifier')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911234567 or +251..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] font-mono focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#aa820a]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <GoldButton
                type="submit"
                size="lg"
                loading={loading}
                icon={ArrowRight}
                className="w-full"
              >
                {loading ? t('login.authenticating') : t('login.submitBtn')}
              </GoldButton>
            </div>

          </form>

          {/* Not registered */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-[#8c8678]">
            <span>{t('login.notMember')} </span>
            <Link to="/register" className="text-[#d4af37] font-semibold hover:underline">
              {t('login.registerLink')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

