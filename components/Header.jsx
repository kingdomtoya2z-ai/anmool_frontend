'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { useCart } from '@/lib/cartContext';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { IconFlame, IconHome, IconPin, IconCart, IconArrowRight, IconLogout } from '@/components/icons';

function Avatar({ user, size = 'md' }) {
  const cls = size === 'lg' ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm';
  return (
    <img
      src={user?.avatar || '/images/avatar-default.svg'}
      alt={user?.name || 'Account'}
      className={`${cls} rounded-full object-cover border-2 border-sacred-saffron/40 shadow bg-white`}
    />
  );
}

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [catResults, setCatResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(()=>{});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); setCatResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(search)}`);
        setResults(res.data.products || res.data || []);
        setCatResults(res.data.categories || []);
        setShowSearch(true);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  const handleLogout = () => {
    logout();
    setMobileMenu(false);
    router.push('/');
  };

  /* Desktop dropdowns: hover intent + click toggle + keyboard, with a
     close grace period so menus don't vanish while moving to them. */
  const [openMenu, setOpenMenu] = useState(null);
  const closeTimer = useRef(null);
  const openMenuNow = (id) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenMenu(id);
  };
  const scheduleMenuClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 220);
  };
  const handleParentClick = (e, id, hasSubs) => {
    if (hasSubs && openMenu !== id) { e.preventDefault(); openMenuNow(id); }
  };
  const handleMenuBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpenMenu(null);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const mainCats = categories.filter(c => !c.parent);
  const getSubs = (parentId) => categories.filter(c => c.parent === parentId || c.parent?._id === parentId);
  const dhenuCat = categories.find(c => /dhenu/i.test(c.name || '') && !c.parent);

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const v = search.trim();
    if (!v) return;
    setShowSearch(false);
    setMobileMenu(false);
    router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  const searchBox = (
    <form onSubmit={submitSearch} className="relative w-full">
      <input
        value={search}
        onChange={e=>setSearch(e.target.value)}
        onFocus={()=> search && setShowSearch(true)}
        onBlur={()=> setTimeout(()=>setShowSearch(false),200)}
        placeholder="Search Ghee, Sambrani, Cone Dhoop…"
        className="w-full bg-[#FFFDF8] text-stone-800 border border-sacred-maroon/15 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40 focus:border-sacred-saffron placeholder:text-stone-400 shadow-inner"
      />
      <button type="submit" aria-label="Search" className="absolute right-1.5 top-1.5 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-diya rounded-full w-9 h-9 flex items-center justify-center hover:opacity-90 transition shadow">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </button>
    </form>
  );

  const searchResults = showSearch && (results.length>0 || catResults.length>0) && (
    <div className="absolute top-full left-0 right-0 mt-2 spiritual-card rounded-2xl shadow-2xl overflow-hidden z-[60]">
      {catResults.length>0 && (
        <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-sacred-maroon/10">
          {catResults.slice(0,4).map(c=> (
            <Link key={c._id} href={`/category/${c.slug}`} className="text-[11px] font-bold bg-smoke-100 border border-sacred-saffron/30 text-sacred-maroon rounded-full px-3 py-1 hover:bg-sacred-saffron/10">
              {c.name}
            </Link>
          ))}
        </div>
      )}
      {results.slice(0,6).map(p=> (
        <Link key={p._id} href={`/product/${p.slug}`} className="flex gap-3 p-3 hover:bg-sacred-sandal/50 transition border-b border-stone-100 last:border-0">
          <span className="w-12 h-12 rounded-xl border border-sacred-maroon/10 overflow-hidden shrink-0 bg-smoke-100 flex items-center justify-center text-stone-300">
            {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <span className="font-sacred text-lg">ॐ</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium line-clamp-1">{p.name}</div>
            <div className="text-xs text-stone-500">{p.category?.name}</div>
            <div className="text-sm font-bold text-sacred-maroon">₹{p.price}</div>
          </div>
        </Link>
      ))}
      <Link href={`/search?q=${encodeURIComponent(search)}`} className="block text-center py-3 text-sm font-semibold text-sacred-maroon hover:bg-smoke-100">View all results →</Link>
    </div>
  );

  return (
    <>
      {/* Sacred top strip */}
      <div className="bg-gradient-to-r from-sacred-deepmaroon via-sacred-maroon to-sacred-deepmaroon text-sacred-sandal text-[13px] md:text-[15px] py-2 px-4 text-center font-medium tracking-wide relative overflow-hidden">
        <div className="smoke-wisp-slow left-[10%] -top-10 h-24 w-48" />
        <div className="max-w-[1400px] mx-auto flex justify-between items-center relative">
          <span className="hidden md:flex items-center gap-2">
            <span className="font-vedic text-base text-sacred-diya animate-flicker">ॐ</span>
            <span className="font-sacred tracking-widest">॥ पवित्रता ही परंपरा ॥</span>
            <span className="opacity-60 hidden xl:inline">· Budhanpur, Karnal</span>
          </span>
          <span className="mx-auto md:mx-0 flex items-center gap-2">
            <IconFlame className="w-4 h-4 text-sacred-diya animate-flicker" />
            <span className="font-semibold">Free Delivery above Rs.300/-</span>
            <span className="hidden md:inline opacity-70">| Shuddh • Pavitra • Vishwas</span>
          </span>
          <div className="hidden lg:flex items-center gap-5 text-[13px]">
            <a href="tel:9034239674" className="flex items-center gap-1.5 hover:text-sacred-diya transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-2C9.716 21 3 14.284 3 6V5z" /></svg>
              90342-39674
            </a>
            <Link href="/track-order" className="hover:text-sacred-diya transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 bg-[#FFFDF8]/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-[0_8px_30px_-12px_rgba(20,40,8,0.4)]' : 'shadow-sm'} border-b border-sacred-maroon/10`}>
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-2 md:gap-4 py-3">
            <Link href="/" className="flex items-center shrink-0 group">
              <img
                src="/logo.png"
                alt="Anmool — Pure Products. Honest Promise."
                className="h-10 md:h-14 w-auto object-contain group-hover:scale-[1.03] transition-transform"
                width={180}
                height={58}
                loading="eager"
              />
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-[560px] mx-4 lg:mx-6 relative">
              {searchBox}
              {searchResults}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              <Link href="/track-order" className="hidden lg:flex flex-col items-center gap-0.5 px-2 py-1 text-sacred-deepmaroon hover:text-sacred-maroon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v6m-3-3h6" /></svg>
                <span className="text-[10px] font-semibold">Track</span>
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href={isAdmin?"/admin":"/account"} className="flex flex-col items-center gap-0.5 px-2 py-1 hover:opacity-80">
                    <Avatar user={user} />
                    <span className="text-[10px] font-semibold text-sacred-deepmaroon">{isAdmin?'Admin':'Account'}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-xs font-semibold px-3 py-1.5 border border-sacred-maroon/20 rounded-full hover:bg-sacred-maroon hover:text-white transition">Logout</button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-sandal text-sm font-bold hover:opacity-90 shadow">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Login
                </Link>
              )}

              <Link href="/cart" className="flex items-center gap-2 bg-smoke-100 border border-sacred-saffron/30 rounded-full px-2.5 md:px-4 py-2 hover:bg-sacred-sandal transition shadow-sm">
                <div className="relative">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-sacred-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  {count>0 && <span className="absolute -top-2 -right-2 bg-sacred-saffron text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">{count}</span>}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold leading-none text-sacred-deepmaroon">{count} items</div>
                  <div className="text-[10px] text-stone-500 leading-none">{user ? 'Cart' : 'Login to order'}</div>
                </div>
                <div className="md:hidden text-sm font-bold text-sacred-deepmaroon">{count}</div>
              </Link>

              <button onClick={()=>setMobileMenu(true)} aria-label="Open menu" className="md:hidden p-2 bg-smoke-100 border border-sacred-saffron/40 rounded-full text-sacred-deepmaroon shadow-sm shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              {user && (
                <button onClick={handleLogout} aria-label="Logout" title="Logout" className="md:hidden p-2 bg-red-50 border border-red-200 rounded-full text-red-600 shadow-sm shrink-0">
                  <IconLogout className="w-6 h-6" />
                </button>
              )}
              {!user ? (
                <Link href="/login" className="md:hidden shrink-0 text-sm font-bold px-4 py-2 rounded-full bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white shadow">
                  Login
                </Link>
              ) : (
                <Link href={isAdmin ? '/admin' : '/account'} aria-label="My profile" className="md:hidden shrink-0">
                  <Avatar user={user} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile category nav — always visible below header */}
          <div className="md:hidden relative z-10 border-t border-sacred-maroon/10 bg-[#FFFDF8] shadow-[0_4px_12px_-6px_rgba(20,40,8,0.25)]">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5 min-h-[52px] items-center">
              <Link
                href="/"
                className={`shrink-0 text-[15px] font-bold px-5 py-2 rounded-full border transition ${isActive('/') ? 'bg-sacred-maroon text-white border-sacred-maroon shadow' : 'bg-white border-sacred-saffron/40 text-sacred-deepmaroon shadow-sm'}`}
              >
                Home
              </Link>
              {mainCats.map(cat => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className={`shrink-0 text-[15px] font-bold px-5 py-2 rounded-full border transition ${isActive(`/category/${cat.slug}`) ? 'bg-sacred-maroon text-white border-sacred-maroon shadow' : 'bg-white border-sacred-saffron/40 text-sacred-deepmaroon shadow-sm'}`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href={dhenuCat ? `/category/${dhenuCat.slug}` : '/search?q=dhenuvera'}
                className="shrink-0 text-[15px] font-bold px-5 py-2 rounded-full bg-gradient-to-r from-dhenu-saffron to-dhenu-flame text-white shadow"
              >
                DhenuVera
              </Link>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 border-t border-sacred-maroon/10 py-1 flex-wrap overflow-visible">
            <NavLink href="/" active={isActive('/')} label="Home" />
            {mainCats.map(cat => {
              const subs = getSubs(cat._id);
              const active = isActive(`/category/${cat.slug}`);
              return (
                <div
                  key={cat._id}
                  className="relative"
                  onMouseEnter={() => openMenuNow(cat._id)}
                  onMouseLeave={scheduleMenuClose}
                  onFocus={() => openMenuNow(cat._id)}
                  onBlur={handleMenuBlur}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={(e) => handleParentClick(e, cat._id, subs.length > 0)}
                    aria-expanded={subs.length > 0 ? openMenu === cat._id : undefined}
                    aria-haspopup={subs.length > 0 ? 'true' : undefined}
                    className={`px-4 py-2.5 text-[17px] whitespace-nowrap flex items-center gap-1.5 transition-all border-b-2 ${active ? 'font-semibold text-sacred-maroon border-sacred-saffron bg-sacred-sandal/60 rounded-t-lg' : 'font-medium text-stone-700 hover:text-sacred-maroon border-transparent hover:border-sacred-saffron/40'}`}
                  >
                    {cat.name}
                    {subs.length>0 && <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === cat._id ? 'rotate-180 opacity-100' : 'opacity-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                  </Link>
                  {subs.length>0 && (
                    <div className={`absolute left-0 top-full spiritual-card rounded-2xl shadow-2xl min-w-[240px] py-2 z-30 animate-fadeIn overflow-visible ${openMenu === cat._id ? 'block' : 'hidden'}`}>
                      <div className="px-4 pt-2 pb-1 text-[11px] font-bold tracking-[0.2em] text-sacred-saffron">SUB-CATEGORIES</div>
                      {subs.map(s=> {
                        const kids = getSubs(s._id);
                        const subActive = isActive(`/category/${s.slug}`);
                        if (!kids.length) {
                          return (
                            <Link key={s._id} href={`/category/${s.slug}`} className={`group/sublink flex items-center justify-between gap-2 px-4 py-2.5 text-[17px] transition ${subActive ? 'bg-sacred-maroon text-white font-semibold' : 'hover:bg-sacred-sandal hover:text-sacred-maroon'}`}>
                              <span>{s.name}</span>
                              <IconArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover/sublink:opacity-100 group-hover/sublink:translate-x-0 transition" />
                            </Link>
                          );
                        }
                        return (
                          <div key={s._id} className="relative group/sub">
                            <Link href={`/category/${s.slug}`} className={`flex items-center justify-between gap-2 px-4 py-2.5 text-[17px] transition ${subActive ? 'bg-sacred-maroon text-white font-semibold' : 'hover:bg-sacred-sandal hover:text-sacred-maroon'}`}>
                              <span>{s.name}</span>
                              <IconArrowRight className="w-3.5 h-3.5 opacity-50" />
                            </Link>
                            <div className="absolute left-full top-0 hidden group-hover/sub:block spiritual-card rounded-2xl shadow-2xl min-w-[210px] py-2 z-40 animate-fadeIn overflow-hidden ml-0.5">
                              {kids.map(k=> (
                                <Link key={k._id} href={`/category/${k.slug}`} className={`block px-4 py-2 text-[15px] transition ${isActive(`/category/${k.slug}`) ? 'bg-sacred-maroon text-white font-semibold' : 'hover:bg-sacred-sandal hover:text-sacred-maroon'}`}>
                                  {k.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {/* DhenuVera highlight */}
            <Link
              href={dhenuCat ? `/category/${dhenuCat.slug}` : '/search?q=dhenuvera'}
              className="ml-1 px-4 py-1.5 text-[17px] font-bold whitespace-nowrap rounded-full bg-gradient-to-r from-dhenu-saffron to-dhenu-flame text-white shadow hover:shadow-lg hover:scale-[1.02] transition flex items-center gap-1.5"
            >
              <IconFlame className="w-4 h-4 animate-flicker" /> DhenuVera
            </Link>
            <Link href="/about" className={`px-4 py-2.5 text-[17px] whitespace-nowrap transition-all border-b-2 ${isActive('/about') ? 'font-semibold text-sacred-maroon border-sacred-saffron' : 'font-medium text-stone-700 hover:text-sacred-maroon border-transparent'}`}>About</Link>
            <Link href="/contact" className={`px-4 py-2.5 text-[17px] whitespace-nowrap transition-all border-b-2 ${isActive('/contact') ? 'font-semibold text-sacred-maroon border-sacred-saffron' : 'font-medium text-stone-700 hover:text-sacred-maroon border-transparent'}`}>Contact</Link>
            <Link href="/our-journey" className={`px-4 py-2.5 text-[17px] whitespace-nowrap transition-all border-b-2 ${isActive('/our-journey') ? 'font-semibold text-sacred-maroon border-sacred-saffron' : 'font-medium text-stone-700 hover:text-sacred-maroon border-transparent'}`}>Journey</Link>
            {isAdmin && <Link href="/admin" className="ml-auto px-4 py-1.5 rounded-full text-[15px] font-bold bg-sacred-maroon text-white hover:bg-sacred-deepmaroon shadow">Admin</Link>}
            {!isAdmin && !user && (
              <span className="ml-auto hidden xl:block text-[11px] text-stone-500 italic font-vedic">Login required to place orders</span>
            )}
          </nav>
        </div>

        {/* Mobile drawer */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <div className="absolute inset-0 bg-sacred-deepmaroon/60 backdrop-blur-sm" onClick={()=>setMobileMenu(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[86%] max-w-sm bg-[#FFFDF8] shadow-2xl flex flex-col animate-slideDown overflow-hidden">
              <div className="bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-sacred-deepmaroon text-sacred-sandal p-5 relative overflow-hidden shrink-0">
                <div className="smoke-wisp-slow right-0 top-0 h-32 w-48" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    {user ? <Avatar user={user} size="lg" /> : <span className="font-vedic text-3xl text-sacred-diya animate-flicker">ॐ</span>}
                    <div>
                      <div className="font-sacred text-lg leading-tight">{user ? `Namaste, ${user.name?.split(' ')[0]}` : 'Welcome'}</div>
                      <div className="text-[11px] opacity-70">{user ? user.email : 'Login to order sacred products'}</div>
                    </div>
                  </div>
                  <button onClick={()=>setMobileMenu(false)} aria-label="Close menu" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="relative mt-4">{searchBox}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {showSearch && (results.length>0 || catResults.length>0) && (
                  <div className="mb-3 spiritual-card rounded-2xl overflow-hidden">
                    {results.slice(0,5).map(p=> (
                      <Link key={p._id} href={`/product/${p.slug}`} onClick={()=>setMobileMenu(false)} className="flex gap-3 p-3 border-b border-stone-100 last:border-0">
                        <span className="w-11 h-11 rounded-xl border overflow-hidden shrink-0 bg-smoke-100 flex items-center justify-center">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <span className="font-sacred text-sacred-maroon">ॐ</span>}
                        </span>
                        <div className="min-w-0"><div className="text-sm font-medium truncate">{p.name}</div><div className="text-xs text-sacred-maroon font-bold">₹{p.price}</div></div>
                      </Link>
                    ))}
                  </div>
                )}
                <MobileLink href="/" label={<span className="flex items-center gap-2"><IconHome className="w-[18px] h-[18px]" /> Home</span>} active={isActive('/')} onClick={()=>setMobileMenu(false)} />
                <Link
                  href={dhenuCat ? `/category/${dhenuCat.slug}` : '/search?q=dhenuvera'}
                  onClick={()=>setMobileMenu(false)}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl font-bold bg-gradient-to-r from-dhenu-saffron to-dhenu-flame text-white shadow"
                >
                  <IconFlame className="w-5 h-5 animate-flicker" /> DhenuVera — Sacred Incense
                </Link>
                <div className="pt-2 text-[11px] font-bold tracking-[0.22em] text-sacred-saffron px-3">SHOP BY CATEGORY</div>
                {mainCats.map(cat=> {
                  const subs = getSubs(cat._id);
                  const expanded = openCat === cat._id;
                  return (
                    <div key={cat._id} className="rounded-xl overflow-hidden">
                      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isActive(`/category/${cat.slug}`) ? 'bg-sacred-maroon text-white font-semibold' : 'hover:bg-smoke-100'}`}>
                        <Link href={`/category/${cat.slug}`} onClick={()=>setMobileMenu(false)} className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="font-medium text-[17px] truncate">{cat.name}</span>
                        </Link>
                        {subs.length>0 && (
                          <button onClick={()=>setOpenCat(expanded ? null : cat._id)} aria-label="Toggle subcategories" className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center opacity-70">
                            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}
                      </div>
                      {expanded && subs.length>0 && (
                        <div className="ml-6 mt-1 mb-2 space-y-2.5">
                          {subs.map(s=> {
                            const kids = getSubs(s._id);
                            return (
                              <div key={s._id}>
                                <Link href={`/category/${s.slug}`} onClick={()=>setMobileMenu(false)} className={`inline-block text-[15px] font-semibold px-3 py-1.5 rounded-full border ${isActive(`/category/${s.slug}`) ? 'bg-sacred-maroon text-white border-sacred-maroon' : 'bg-smoke-100 border-sacred-saffron/30 text-sacred-deepmaroon'}`}>{s.name}</Link>
                                {kids.length>0 && (
                                  <div className="ml-4 mt-1.5 flex flex-wrap gap-1.5">
                                    {kids.map(k=> (
                                      <Link key={k._id} href={`/category/${k.slug}`} onClick={()=>setMobileMenu(false)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isActive(`/category/${k.slug}`) ? 'bg-sacred-maroon text-white border-sacred-maroon' : 'bg-white border-stone-200 text-stone-600'}`}>{k.name}</Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 text-[11px] font-bold tracking-[0.22em] text-sacred-saffron px-3">EXPLORE</div>
                <MobileLink href="/about" label="About Us" active={isActive('/about')} onClick={()=>setMobileMenu(false)} />
                <MobileLink href="/contact" label="Contact" active={isActive('/contact')} onClick={()=>setMobileMenu(false)} />
                <MobileLink href="/our-journey" label="Our Journey" active={isActive('/our-journey')} onClick={()=>setMobileMenu(false)} />
                <MobileLink href="/track-order" label={<span className="flex items-center gap-2"><IconPin className="w-[18px] h-[18px]" /> Track Order</span>} active={isActive('/track-order')} onClick={()=>setMobileMenu(false)} />
                <MobileLink href="/cart" label={<span className="flex items-center gap-2"><IconCart className="w-[18px] h-[18px]" /> Cart ({count})</span>} active={isActive('/cart')} onClick={()=>setMobileMenu(false)} />
              </div>

              <div className="p-4 border-t border-sacred-maroon/10 bg-smoke-50 shrink-0">
                {user ? (
                  <div className="flex gap-2">
                    <Link href={isAdmin?"/admin":"/account"} onClick={()=>setMobileMenu(false)} className="flex-1 text-center px-3 py-3 rounded-full bg-sacred-maroon text-white font-bold text-[15px]">My {isAdmin ? 'Admin' : 'Account'}</Link>
                    <button onClick={handleLogout} className="flex-1 px-3 py-3 rounded-full border border-red-200 text-red-600 font-bold text-[15px]">Logout</button>
                  </div>
                ) : (
                  <div>
                    <Link href="/login" onClick={()=>setMobileMenu(false)} className="block px-3 py-3 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full text-center font-bold">Login / Register</Link>
                    <p className="text-center text-[11px] text-stone-500 mt-2 italic font-vedic">Only logged-in devotees can place orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-[17px] whitespace-nowrap transition-all border-b-2 ${active ? 'font-semibold text-sacred-maroon border-sacred-saffron bg-sacred-sandal/60 rounded-t-lg' : 'font-medium text-stone-700 hover:text-sacred-maroon border-transparent hover:border-sacred-saffron/40'}`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label, active, onClick }) {
  return (
    <Link href={href} onClick={onClick} className={`block px-3 py-2.5 rounded-xl text-[17px] transition ${active ? 'font-semibold bg-sacred-maroon text-white shadow' : 'font-medium hover:bg-smoke-100'}`}>
      {label}
    </Link>
  );
}
