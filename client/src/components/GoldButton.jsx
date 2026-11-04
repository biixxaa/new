import React from 'react';

export default function GoldButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#edd376] via-[#d4af37] to-[#aa820a] text-black font-semibold hover:from-[#fff0a8] hover:via-[#e5c148] hover:to-[#be9412] shadow-lg shadow-amber-900/30 active:scale-[0.98]',
    secondary:
      'bg-[#0f0f14]/80 text-[#e6d7a8] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#181822] hover:text-[#fff5cf] shadow-md shadow-black/50',
    ghost:
      'bg-transparent text-[#d4af37] hover:text-[#fff0a8] hover:bg-[#d4af37]/10',
    danger:
      'bg-red-950/40 text-red-300 border border-red-700/50 hover:bg-red-900/40',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded transition-all duration-300 font-cinzel tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

