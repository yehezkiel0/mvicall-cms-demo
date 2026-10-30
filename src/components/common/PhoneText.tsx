import React from 'react';
import { useApp } from '../../context/AppContext';
import { maskPhone } from '../../data/dummy';

interface PhoneTextProps {
  phone: string;
  className?: string;
}

export const PhoneText: React.FC<PhoneTextProps> = ({ phone, className = '' }) => {
  const { showFullPhone, canToggleFullPhone } = useApp();

  const isRevealed = showFullPhone && canToggleFullPhone;
  const displayText = isRevealed ? phone : maskPhone(phone);

  return (
    <span
      className={`font-mono tabular-nums text-slate-800 ${className}`}
      title={isRevealed ? 'Nomor telepon lengkap' : 'Nomor disamarkan (Privasi)'}
    >
      {displayText}
    </span>
  );
};
