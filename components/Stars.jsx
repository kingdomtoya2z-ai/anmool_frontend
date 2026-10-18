'use client';

import { useState } from 'react';

/**
 * Star display + input for product reviews.
 *
 * `Stars` is read-only (rounded to the nearest half star) and used both in the
 * product header and in the review list. `StarInput` is the interactive picker
 * inside the write-a-review form.
 *
 * Both are plain button/input elements with explicit labels so the form stays
 * usable with a keyboard and a screen reader.
 */

const STAR_PATH =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z';

export function Stars({ value = 0, size = 'sm', className = '' }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  // Snap to the nearest half so 4.3 doesn't render as a full 4-star row.
  const rounded = Math.round(rating * 2) / 2;
  const box = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-[18px] h-[18px]' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} className={box} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {fill > 0 && (
              <defs>
                <linearGradient id={`half-${i}-${fill}`}>
                  <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                  <stop offset={`${fill * 100}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path
              d={STAR_PATH}
              fill={fill === 1 ? 'currentColor' : fill === 0.5 ? `url(#half-${i}-${fill})` : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function StarInput({ value, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onClick={() => onChange(i)}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          aria-pressed={value === i}
          className={`p-0.5 rounded transition disabled:cursor-not-allowed ${
            i <= shown ? 'text-sacred-saffron' : 'text-gray-300'
          } hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill={i <= shown ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

export const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];