import React from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="font-bold text-[#2f383b] text-sm tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full min-h-[48px] px-4 py-2.5 rounded-[1.25rem]
          bg-[#f7f4ed] text-[#2f383b] font-semibold text-base
          border border-[#e0d6c5]
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)]
          focus:outline-none focus:border-[#7dcbbe] focus:ring-2 focus:ring-[#7dcbbe]/30
          transition-all duration-150
          placeholder:text-[#88969b]
          ${className}
        `}
        {...props}
      />
      {helperText && <p className="text-xs text-[#5f6d72] px-1">{helperText}</p>}
    </div>
  );
};
