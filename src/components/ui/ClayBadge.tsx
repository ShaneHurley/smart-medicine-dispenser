import React, { ReactNode } from 'react';
import { ClayTone } from './ClayButton.tsx';

interface ClayBadgeProps {
  children: ReactNode;
  tone?: ClayTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

const toneStyles: Record<ClayTone, string> = {
  mint: 'bg-[#d6f2ec] text-[#1b5e50] border-[#9fdcd1]',
  peach: 'bg-[#fbe4db] text-[#7a3219] border-[#f4bba7]',
  sky: 'bg-[#dbeef9] text-[#154e75] border-[#a9d7f3]',
  butter: 'bg-[#fcf5ce] text-[#6b5815] border-[#f3e387]',
  danger: 'bg-[#fbdad5] text-[#861e13] border-[#f49f94]',
  quiet: 'bg-[#f0ebe0] text-[#556368] border-[#ded5c5]',
  white: 'bg-[#ffffff] text-[#2f383b] border-[#e2dbce]',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-xs rounded-full',
  md: 'px-3.5 py-1 text-sm rounded-full font-bold',
  lg: 'px-4 py-1.5 text-base rounded-full font-bold',
};

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  children,
  tone = 'mint',
  size = 'md',
  className = '',
  pulse = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border font-semibold select-none
        shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.04)]
        ${toneStyles[tone]}
        ${sizeStyles[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {pulse && <span className="w-2 h-2 rounded-full bg-current opacity-75 animate-ping" />}
      {children}
    </span>
  );
};
