'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { IconChevronDown, IconArrowRight } from '@/components/icons';

/**
 * Homepage hero slider — driven by admin-uploaded banners (GET /banners).
 * Banner images are shown clean with NO color overlay; headline + CTA
 * live in a caption bar beneath the image. Falls back to categories
 * only when no banners exist yet.
 */
export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    api.get('/banners')
      .then((r) => {
        const list = (r.data || []).filter((b) => b.image);
        if (list.length) {
          setSlides(list.map((b) => ({
            key: b._id,
            image: b.image,
            title: b.title,
            subtitle: b.subtitle,
            href: b.link || null,
            buttonText: b.buttonText || 'Shop Now',
          })));
          setIdx(0);
          return;
        }
        return api.get('/categories').then((cr) => {
          const top = (cr.data || []).filter((c) => !c.parent && c.image);
          setSlides(top.map((c) => ({
            key: c._id,
            image: c.image,
            title: c.name,
            subtitle: c.description || '',
            href: `/category/${c.slug}`,
            buttonText: 'Shop Now',
          })));
          setIdx(0);
        });
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const go = (n) => setIdx((n + slides.length) % slides.length);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    if (!isDragging.current) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx > 60) go(idx - 1);
    else if (dx < -60) go(idx + 1);
    isDragging.current = false;
    setTimeout(() => setPaused(false), 2000);
  };

  const onMouseDown = (e) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const onMouseUp = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    if (dx > 60) go(idx - 1);
    else if (dx < -60) go(idx + 1);
    isDragging.current = false;
  };

  return (
    <div className="md:mx-4">
      <div
        className="relative overflow-hidden rounded-none md:rounded-3xl group shadow-lg bg-white select-none border border-sacred-maroon/10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {/* Sliding track — images shown clean, no overlay */}
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.key || i} className="w-full shrink-0 block" draggable={false}>
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-[220px] sm:h-[320px] md:h-[440px] lg:h-[520px] object-cover"
                width={1600}
                height={600}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
              {/* Caption bar below the image — keeps the photo untouched */}
              <div className="bg-[#FFFDF8] border-t border-sacred-maroon/10 px-4 py-4 md:px-8 md:py-5 flex flex-wrap items-center gap-3 md:gap-5">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[10px] md:text-[11px] font-bold tracking-[0.28em] text-sacred-saffron">ANMOOL · FEATURED</div>
                  <div className="font-sacred text-xl md:text-3xl text-sacred-deepmaroon leading-tight mt-1">{s.title}</div>
                  {s.subtitle && <div className="text-xs md:text-sm text-stone-500 mt-1 line-clamp-2">{s.subtitle}</div>}
                </div>
                {s.href ? (
                  <Link href={s.href} className="inline-flex items-center gap-2 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white text-xs md:text-sm font-bold rounded-full px-6 py-3 hover:opacity-90 transition shadow shrink-0">
                    {s.buttonText} <IconArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-[11px] font-bold text-stone-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full shadow ${i === idx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/70 hover:bg-white hover:w-4'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => go(idx - 1)}
              className="absolute left-3 md:left-4 top-[38%] w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/40 text-white hover:bg-white hover:text-sacred-deepmaroon flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg z-10 rotate-90"
              aria-label="Previous slide"
            >
              <IconChevronDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(idx + 1)}
              className="absolute right-3 md:right-4 top-[38%] w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/40 text-white hover:bg-white hover:text-sacred-deepmaroon flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg z-10 -rotate-90"
              aria-label="Next slide"
            >
              <IconChevronDown className="w-5 h-5" />
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
