'use client';
import { forwardRef, useState } from 'react';
import { IconEye, IconEyeOff } from '@/components/icons';

const baseCls =
  'w-full min-w-0 border border-gray-200 rounded-xl py-3 pl-4 pr-11 text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

/**
 * Password field with a show/hide toggle.
 *
 * Keeps the native `input` (so `required`, `minLength`, `autoComplete` and
 * password managers all behave normally) and just flips `type` between
 * password and text. The button is a real <button type="button"> so it never
 * submits the surrounding form by accident.
 */
const PasswordInput = forwardRef(function PasswordInput(
  { label, value, onChange, className = '', id, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || `pw-${rest.name || label || 'field'}`;

  return (
    <div className="relative">
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={`${baseCls} ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        title={visible ? 'Hide password' : 'Show password'}
        tabIndex={0}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      >
        {visible ? <IconEyeOff className="w-[18px] h-[18px]" /> : <IconEye className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
});

export default PasswordInput;