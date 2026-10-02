'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';

/**
 * Auto-looping horizontal product rail.
 * Mobile: one roomy card (~78% width). Desktop: up to 4 across.
 * Auto-advances and wraps to the start; pauses on hover / touch.
 */
export default function ProductCarousel({ products }) {
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [paused, setPaused] = useState(false);

  const checkScrollable = useCallback(() => {
    const el = trackRef.current;
    if (el) setCanScroll(el.scrollWidth > el.clientWidth + 8);
  }, []);

  useEffect(() => {
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [products, checkScrollable]);

  const step = useCallback((dir = 1) => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const cardW = el.children[0].offsetWidth + 16;
    const max = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= max - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: max, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * cardW, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (paused || !canScroll) return;
    timerRef.current = setInterval(() => step(1), 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, canScroll, step, products]);

  if (!products?.length) return null;

  return (
    <div
      className="relative group/car"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
    >
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {products.map((p) => (
          <div
            key={p._id || p.slug}
            className="shrink-0 snap-start basis-[78%] min-[480px]:basis-[46%] lg:basis-[31.5%] xl:basis-[23.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {canScroll && (
        <>
          <button
            onClick={() => step(-1)}
            aria-label="Previous products"
            className="hidden md:flex absolute -left-5 top-[38%] w-10 h-10 rounded-full bg-white shadow-xl border border-sacred-maroon/10 items-center justify-center text-sacred-deepmaroon hover:bg-sacred-maroon hover:text-white transition opacity-0 group-hover/car:opacity-100 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next products"
            className="hidden md:flex absolute -right-5 top-[38%] w-10 h-10 rounded-full bg-white shadow-xl border border-sacred-maroon/10 items-center justify-center text-sacred-deepmaroon hover:bg-sacred-maroon hover:text-white transition opacity-0 group-hover/car:opacity-100 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
