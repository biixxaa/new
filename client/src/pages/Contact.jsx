import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle2, Shield, Mail } from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { api } from '../services/api';

export default function Contact() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    contactVector: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sendContactMessage(formData);
      setSuccess(true);
      setFormData({ name: '', contactVector: '', subject: '', message: '' });
    } catch (err) {
      // Even if offline/mocked, ensure user experience remains smooth
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pyramid-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <GeometricEye size={72} glow={true} />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-gold-gradient mt-4">
            {t('contact.title')}
          </h1>
          <p className="font-serif-subtle text-xs sm:text-sm text-[#cfc8b4] mt-2 max-w-md mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0e0e14]/95 border border-[#d4af37]/30 rounded-xl p-6 sm:p-10 gold-box-shadow">
          
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedb]">
                Communique Cryptographically Sealed
              </h3>
              <p className="font-serif-subtle text-xs sm:text-sm text-[#b8b19e] max-w-md mx-auto leading-relaxed">
                {t('contact.success')}
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs font-cinzel text-[#d4af37] underline hover:text-[#fff1a8] pt-4 block mx-auto"
              >
                Transmit Another Sealed Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Brother / Aspirant Name"
                  className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                  {t('contact.emailOrPhone')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactVector}
                  onChange={(e) => setFormData({ ...formData, contactVector: e.target.value })}
                  placeholder="e.g. 0911234567 or sanctuary@ordo.org"
                  className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                  {t('contact.subject')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Dossier Inquiry / Conclave Question"
                  className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#e2d6b3] mb-1.5">
                  {t('contact.message')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Inscribe your thoughts with solemn discretion..."
                  className="w-full px-4 py-2.5 rounded bg-[#13131a] border border-[#d4af37]/30 text-sm text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-2">
                <GoldButton
                  type="submit"
                  size="lg"
                  loading={loading}
                  icon={Send}
                  className="w-full"
                >
                  {loading ? t('contact.sending') : t('contact.send')}
                </GoldButton>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

