'use client';

/**
 * Fixed, non-interactive sacred ambience: drifting dhoop-smoke wisps,
 * a faint Om watermark and a warm diya glow at the top of the page.
 * Rendered once in the root layout behind all content.
 */
export default function SpiritualBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* warm temple glow at top */}
      <div
        className="absolute inset-x-0 top-0 h-[340px]"
        style={{
          background:
            'radial-gradient(700px 220px at 50% -60px, rgba(245,165,36,0.16), transparent 70%), radial-gradient(500px 200px at 12% 0%, rgba(92,26,27,0.08), transparent 70%), radial-gradient(500px 200px at 88% 0%, rgba(232,133,26,0.08), transparent 70%)',
        }}
      />
      {/* smoke wisps */}
      <div className="smoke-wisp left-[8%] top-[22%] h-56 w-56" style={{ animationDelay: '0s' }} />
      <div className="smoke-wisp right-[6%] top-[38%] h-72 w-72" style={{ animationDelay: '-5s' }} />
      <div className="smoke-wisp-slow left-[30%] top-[60%] h-80 w-80" style={{ animationDelay: '-8s' }} />
      <div className="smoke-wisp right-[28%] top-[78%] h-64 w-64" style={{ animationDelay: '-11s' }} />
      {/* faint Om watermark */}
      <div className="om-watermark absolute -right-8 top-24 hidden text-[220px] md:block">ॐ</div>
      <div className="om-watermark absolute -left-10 bottom-24 hidden text-[180px] lg:block">ॐ</div>
    </div>
  );
}
