import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { IconShield, IconCheck, IconLeaf, IconDroplet, IconFlame, IconArrowRight } from '@/components/icons';

const VALUES = [
  { icon: IconShield, title: 'Quality First', desc: 'Carefully selected and sourced products and ingredients — every batch checked before it ships.' },
  { icon: IconCheck, title: 'Authenticity Always', desc: 'Genuine products, honest labels. We compete on trust, never on tall claims or rock-bottom pricing.' },
  { icon: IconLeaf, title: 'Transparency', desc: 'Clear product information, real sourcing stories, and support that answers honestly.' },
];

const RANGE = [
  { icon: IconDroplet, title: 'Milk', desc: 'Local Karnal supply — freshness and trust, delivered daily.', href: '/search?q=milk' },
  { icon: IconFlame, title: 'Pure Desi Ghee', desc: 'Authentic taste and traditional goodness, supplied across India.', href: '/search?q=ghee' },
  { icon: IconLeaf, title: 'Cow Dung Ash & Cakes', desc: 'For traditional, religious and household uses — Havan and Pooja ready.', href: '/search?q=cow+dung' },
  { icon: IconFlame, title: 'DhenuVera Incense', desc: 'Cone Dhoop, Stick Dhoop and Sambrani Cups in 6 fragrances.', href: '/search?q=dhenuvera' },
];

const STATS = [
  { value: '1.5+', label: 'Years of honest journey' },
  { value: '06', label: 'DhenuVera fragrances' },
  { value: 'Pan-India', label: 'Shipping across India' },
  { value: '24×7', label: 'Customer support' },
];

export default function About() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="ABOUT ANMOOL"
        title="Pure Products. Honest Promise."
        description="Bringing genuine products to your family — with purity, care and trust. Our journey began with a simple thought: people deserve genuine products, and they deserve to know what they are buying."
        breadcrumb={[{ label: 'About' }]}
        meta={
          <div className="flex flex-wrap gap-2">
            {['Karnal, Haryana', 'Dairy roots', 'DhenuVera incense'].map((t) => (
              <span key={t} className="text-[11px] font-bold bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-white/85">{t}</span>
            ))}
          </div>
        }
        actions={
          <>
            <Link href="/search" className="inline-flex items-center gap-2 bg-sacred-diya text-sacred-deepmaroon text-sm font-bold rounded-full px-6 py-3 hover:brightness-105 transition shadow">
              Shop Products <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/our-journey" className="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-bold rounded-full px-6 py-3 hover:bg-white/10 transition">
              Our Journey
            </Link>
          </>
        }
      />

      {/* Stats band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        {STATS.map((s) => (
          <div key={s.label} className="spiritual-card rounded-2xl p-5 text-center">
            <div className="font-sacred text-2xl md:text-3xl text-sacred-deepmaroon">{s.value}</div>
            <div className="text-[11px] md:text-xs font-semibold text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="bg-white rounded-3xl border border-stone-200/70 p-6 md:p-10 mt-6 leading-relaxed shadow-sm">
        <div className="text-[11px] font-bold tracking-[0.24em] text-sacred-saffron">OUR STORY</div>
        <h2 className="font-sacred text-2xl md:text-3xl text-sacred-deepmaroon mt-2">A Small Beginning With a Big Purpose</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            Anmool started approximately 1.5 years ago with a clear purpose — to address the concerns people
            have about the quality and genuineness of everyday products. Instead of simply selling, we wanted
            to build something based on trust, quality and long-term relationships.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            We began by supplying milk in the local areas of Karnal, Haryana, and we continue to serve our
            local customers today. Encouraged by love and positive feedback, we expanded into Pure Desi Ghee
            across India through our trusted sourcing network — and then into traditional essentials and the
            DhenuVera incense range.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-sacred-maroon/10 bg-gradient-to-b from-[#FFFDF8] to-smoke-100 p-5 hover:shadow-md hover:border-sacred-saffron/40 transition">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-diya flex items-center justify-center shadow">
                <v.icon className="w-5 h-5" />
              </span>
              <div className="font-bold mt-3 text-sacred-deepmaroon">{v.title}</div>
              <div className="text-sm text-stone-600 mt-1 leading-relaxed">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product range */}
      <div className="mt-6">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.24em] text-sacred-saffron">WHAT WE MAKE</div>
            <h2 className="font-sacred text-2xl md:text-3xl text-sacred-deepmaroon mt-1">Our Product Range</h2>
          </div>
          <Link href="/search" className="text-sm font-bold text-sacred-maroon hover:underline shrink-0">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RANGE.map((r) => (
            <Link key={r.title} href={r.href} className="group spiritual-card rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition">
              <span className="w-11 h-11 rounded-2xl bg-sacred-sandal border border-sacred-saffron/30 text-sacred-maroon flex items-center justify-center group-hover:bg-sacred-maroon group-hover:text-sacred-diya transition">
                <r.icon className="w-5 h-5" />
              </span>
              <div className="font-bold mt-3 text-sacred-deepmaroon">{r.title}</div>
              <div className="text-[13px] text-stone-500 mt-1 leading-relaxed">{r.desc}</div>
              <div className="text-xs font-bold text-sacred-maroon mt-3 inline-flex items-center gap-1">Explore <IconArrowRight className="w-3.5 h-3.5" /></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promise */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-[#142808] text-white p-6 md:p-10 mt-6">
        <div className="om-watermark absolute -right-4 -top-8 text-[140px] hidden md:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.25)', color: 'transparent' }}>ॐ</div>
        <div className="relative">
          <div className="text-[11px] font-bold tracking-[0.24em] text-sacred-diya">OUR PROMISE</div>
          <div className="font-sacred text-2xl md:text-3xl text-[#FFF6E5] mt-2">Our Journey Has Just Begun</div>
          <p className="text-sm text-white/75 mt-3 max-w-2xl leading-relaxed">
            We are still a young business — we don&apos;t claim decades of legacy. But in 1.5 years we learned
            one thing deeply: customer trust cannot be bought. It has to be earned, every single order.
            Thank you to every customer who supported us.
          </p>
          <div className="mt-3 text-sm font-bold text-sacred-diya">— Team Anmool</div>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <Link href="/contact" className="bg-sacred-diya text-sacred-deepmaroon text-sm font-bold rounded-full px-6 py-3 hover:brightness-105 transition">Talk to Us</Link>
            <Link href="/our-journey" className="border border-white/30 text-white text-sm font-bold rounded-full px-6 py-3 hover:bg-white/10 transition">See the Journey</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
