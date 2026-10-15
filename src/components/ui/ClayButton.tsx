import React, { ReactNode } from 'react';

export type ClayTone = 'mint' | 'peach' | 'sky' | 'butter' | 'danger' | 'quiet' | 'white';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: ClayTone;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  className?: string;
}

const toneStyles: Record<ClayTone, string> = {
  mint: 'bg-[#7dcbbe] hover:bg-[#6fc2b4] text-[#1b3d36] border-[#5cb8a8] shadow-[#4fa897]/30',
  peach: 'bg-[#f0b7a0] hover:bg-[#ebaa91] text-[#4d281a] border-[#e29d81] shadow-[#d4786a]/30',
  sky: 'bg-[#8ec5e8] hover:bg-[#7db9de] text-[#1b364d] border-[#72aecd] shadow-[#6a9fc4]/30',
  butter: 'bg-[#f6e7a9] hover:bg-[#edd994] text-[#483c16] border-[#e5cd77] shadow-[#d1b854]/30',
  danger: 'bg-[#f0a89e] hover:bg-[#e69489] text-[#551913] border-[#dc7d70] shadow-[#d4786a]/40',
  quiet: 'bg-[#f4efe6] hover:bg-[#eae3d7] text-[#475256] border-[#ded4c3] shadow-black/5',
  white: 'bg-[#ffffff] hover:bg-[#fbf9f5] text-[#2f383b] border-[#e2dbce] shadow-black/8',
};

const sizeStyles = {
  sm: 'min-h-[40px] px-3.5 py-1.5 text-sm rounded-[1.25rem]',
  md: 'min-h-[48px] px-5 py-2.5 text-base rounded-[1.5rem]', // >=48px touch target
  lg: 'min-h-[56px] px-7 py-3.5 text-lg rounded-[1.75rem]',
  xl: 'min-h-[64px] px-8 py-4 text-xl rounded-[2rem]',
};

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  tone = 'mint',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center font-bold tracking-wide
        border transition-all duration-150 select-none
        ${sizeStyles[size]}
        ${toneStyles[tone]}
        ${fullWidth ? 'w-full' : ''}
        shadow-[0_4px_10px_rgba(0,0,0,0.08),inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.06)]
        hover:shadow-[0_6px_14px_rgba(0,0,0,0.11),inset_0_2px_0_rgba(255,255,255,0.7)]
        active:translate-y-[2px] active:shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(0,0,0,0.15)]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
