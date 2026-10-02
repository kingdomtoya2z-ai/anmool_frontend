import Link from 'next/link';

/**
 * Shared professional page hero — maroon gradient, smoke wisps,
 * Om watermark, breadcrumb, eyebrow, title, description, meta + actions.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  meta = null,
  actions = null,
  image = null,
  imageAlt = '',
  align = 'left',
}) {
  const centered = align === 'center';
  return (
    <section className="relative overflow-hidden rounded-none md:rounded-3xl md:mx-4 bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-sacred-deepmaroon text-white shadow-lg">
      <div className="smoke-wisp left-[8%] top-[10%] h-48 w-48" />
      <div className="smoke-wisp-slow right-[10%] bottom-0 h-56 w-56" style={{ animationDelay: '-7s' }} />
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(600px 120px at 50% -40px, rgba(245,165,36,0.22), transparent 70%)' }}
      />
      <div className="om-watermark absolute -right-4 top-4 text-[130px] hidden md:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.28)', color: 'transparent' }}>
        ॐ
      </div>

      <div className={`relative max-w-[1400px] mx-auto px-6 md:px-10 py-9 md:py-12 flex flex-col ${image ? 'lg:flex-row lg:items-center' : ''} gap-6 ${centered && !image ? 'items-center text-center' : ''}`}>
        <div className={`flex-1 min-w-0 ${centered && !image ? 'text-center' : ''}`}>
          {breadcrumb.length > 0 && (
            <nav className={`flex items-center gap-1.5 text-[11px] md:text-xs text-white/60 ${centered && !image ? 'justify-center' : ''}`} aria-label="Breadcrumb">
              <Link href="/" className="hover:text-sacred-diya transition">Home</Link>
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-white/30">/</span>
                  {b.href ? (
                    <Link href={b.href} className="hover:text-sacred-diya transition">{b.label}</Link>
                  ) : (
                    <span className="text-sacred-diya font-semibold">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && (
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] md:text-[11px] font-bold tracking-[0.28em] text-sacred-diya">
              <span className="w-6 h-px bg-sacred-diya/70" />
              {eyebrow}
              {centered && !image && <span className="w-6 h-px bg-sacred-diya/70" />}
            </div>
          )}
          <h1 className="font-sacred text-3xl md:text-[2.75rem] leading-[1.15] text-[#FFF6E5] mt-2">{title}</h1>
          {description && (
            <p className={`text-sm md:text-[15px] text-white/70 leading-relaxed mt-3 max-w-2xl ${centered && !image ? 'mx-auto' : ''}`}>{description}</p>
          )}
          {meta && <div className={`mt-4 ${centered && !image ? 'flex justify-center' : ''}`}>{meta}</div>}
          {actions && <div className={`flex flex-wrap gap-2.5 mt-5 ${centered && !image ? 'justify-center' : ''}`}>{actions}</div>}
        </div>
        {image && (
          <div className="lg:w-[340px] shrink-0">
            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
              <img src={image} alt={imageAlt} className="w-full h-52 md:h-64 object-cover" />
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-sacred-diya/70 to-transparent" />
    </section>
  );
}
