import React, { ReactNode } from 'react';

export type ClayCardTone = 'clay' | 'mint' | 'peach' | 'sky' | 'butter' | 'danger';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: ClayCardTone;
  interactive?: boolean;
  className?: string;
}

const toneBgs: Record<ClayCardTone, string> = {
  clay: 'bg-[#fffdf8] border-[#ebdccb]/60',
  mint: 'bg-[#eaf7f4] border-[#b5e3dc]',
  peach: 'bg-[#fdf2ee] border-[#fad2c3]',
  sky: 'bg-[#edf6fc] border-[#c2e2f5]',
  butter: 'bg-[#fdfbe9] border-[#faefb9]',
  danger: 'bg-[#fdf0ee] border-[#f7c2bc]',
};

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  tone = 'clay',
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        relative rounded-[1.75rem] border p-6
        ${toneBgs[tone]}
        shadow-[0_4px_16px_rgba(47,56,59,0.06),inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(0,0,0,0.03)]
        ${
          interactive
            ? 'transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(47,56,59,0.1),inset_0_2px_0_rgba(255,255,255,0.9)] cursor-pointer'
            : ''
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
