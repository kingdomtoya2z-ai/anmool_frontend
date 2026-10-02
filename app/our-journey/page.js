import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { IconDroplet, IconFlame, IconHeart, IconLeaf, IconShield, IconStar, IconArrowRight } from '@/components/icons';

const STEPS = [
  { n: '01', phase: 'The Beginning', icon: IconDroplet, title: 'We Started With Milk', desc: 'Our journey began with local milk supply in Karnal — early mornings, honest measures, and genuine relationships with neighbourhood families.' },
  { n: '02', phase: 'The Foundation', icon: IconShield, title: 'We Earned Customer Trust', desc: 'Consistent service and listening to feedback. Every complaint made the next delivery better — trust became our real capital.' },
  { n: '03', phase: 'The Expansion', icon: IconFlame, title: 'We Expanded Into Desi Ghee', desc: 'Pure Desi Ghee across India through trusted sources. Customers loved the quality and taste — confidence to grow further.' },
  { n: '04', phase: 'The Roots', icon: IconLeaf, title: 'We Added Traditional Products', desc: 'Cow Dung Ash, Cow Dung Cakes and Havan–Pooja essentials — honouring the rituals Indian homes live by.' },
  { n: '05', phase: 'Today', icon: IconHeart, title: 'Introducing DhenuVera', desc: 'Our sacred incense range: Cone Dhoop, Stick Dhoop and Sambrani Cups in 6 fragrances — Guggal, Mogra, Rose, Sandal and more.' },
];

export default function Journey() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="OUR JOURNEY"
        title="From Karnal to Every Indian Home"
        description="Local roots. Growing reach. Genuine products. Five chapters in 1.5 years — written together with our customers."
        breadcrumb={[{ label: 'Our Journey' }]}
        align="center"
        meta={
          <div className="flex flex-wrap justify-center gap-2">
            {['Est. Karnal, Haryana', '1.5+ year journey', '2 brands, 1 promise'].map((t) => (
              <span key={t} className="text-[11px] font-bold bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-white/85">{t}</span>
            ))}
          </div>
        }
      />

      {/* Timeline */}
      <div className="relative mt-10 md:mt-12">
        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sacred-saffron via-sacred-maroon/30 to-transparent md:-translate-x-1/2" />
        <div className="space-y-6 md:space-y-10">
          {STEPS.map((s, i) => {
            const left = i % 2 === 0;
            return (
              <div key={s.n} className={`relative flex gap-4 md:gap-0 md:items-center ${left ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Node */}
                <div className="relative z-10 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-diya flex items-center justify-center shadow-lg ring-4 ring-[#FAF8F5]">
                    <s.icon className="w-6 h-6" />
                  </span>
                </div>
                {/* Card */}
                <div className={`flex-1 min-w-0 md:w-[calc(50%-2.5rem)] md:flex-none ${left ? 'md:mr-auto md:pr-2' : 'md:ml-auto md:pl-2'}`}>
                  <div className="spiritual-card rounded-3xl p-5 md:p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-[0.24em] text-sacred-saffron">{s.phase.toUpperCase()}</span>
                      <span className="font-sacred text-lg text-sacred-maroon/30">{s.n}</span>
                    </div>
                    <div className="font-sacred text-xl text-sacred-deepmaroon mt-1">{s.title}</div>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block md:w-[calc(50%-2.5rem)] md:flex-none" />
              </div>
            );
          })}

          {/* Next chapter */}
          <div className="relative flex gap-4 md:items-center md:flex-row">
            <div className="relative z-10 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
              <span className="w-14 h-14 rounded-2xl bg-sacred-diya text-sacred-deepmaroon flex items-center justify-center shadow-lg ring-4 ring-[#FAF8F5] font-sacred text-xl">+</span>
            </div>
            <div className="flex-1 min-w-0 md:w-[calc(50%-2.5rem)] md:flex-none md:mr-auto">
              <div className="rounded-3xl bg-gradient-to-br from-sacred-deepmaroon to-[#142808] text-white p-5 md:p-6 relative overflow-hidden">
                <div className="om-watermark absolute -right-2 -top-5 text-[90px] hidden sm:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.25)', color: 'transparent' }}>ॐ</div>
                <div className="relative">
                  <div className="text-[10px] font-bold tracking-[0.24em] text-sacred-diya">NEXT CHAPTER — WITH YOU</div>
                  <div className="font-sacred text-xl text-[#FFF6E5] mt-1">The story continues in your home</div>
                  <p className="text-[13px] text-white/65 mt-2 leading-relaxed">Every order, review and suggestion writes our next chapter. Thank you for being part of it.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link href="/search" className="text-xs font-bold bg-sacred-diya text-sacred-deepmaroon rounded-full px-5 py-2.5 hover:brightness-105 transition">Shop the Collection</Link>
                    <Link href="/contact" className="text-xs font-bold border border-white/30 rounded-full px-5 py-2.5 hover:bg-white/10 transition">Share Feedback</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block md:w-[calc(50%-2.5rem)] md:flex-none" />
          </div>
        </div>
      </div>

      {/* Honesty banner */}
      <div className="rounded-3xl border border-sacred-saffron/30 bg-gradient-to-b from-[#FFFDF8] to-sacred-sandal/60 p-6 md:p-8 mt-10 text-sm leading-relaxed">
        <div className="font-sacred text-xl text-sacred-deepmaroon flex items-center gap-2">
          <IconStar className="w-5 h-5 text-sacred-saffron" /> Most Important — No Fake Claims
        </div>
        <p className="text-stone-600 mt-3">We don&apos;t say “Since 1965” or “58 Years of Experience”. Our real story is our strength: a short time ago we started with a simple purpose — genuine products should reach every home. That honesty is what makes us relatable and trusted.</p>
        <p className="text-stone-600 mt-2">Anmool is the parent brand. <b>DhenuVera</b> is our incense and traditional-fragrance brand under Anmool — a structure that lets us expand cleanly into dairy, traditional and ritual products.</p>
        <Link href="/about" className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-sacred-maroon hover:underline">
          Read more about us <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
