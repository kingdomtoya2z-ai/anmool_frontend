import Link from 'next/link';
import SmartImage from '@/components/SmartImage';

export default function CategoryCard({ category, variant = 'large' }) {
  if (variant === 'small') {
    return (
      <Link href={`/category/${category.slug}`} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition group">
        <SmartImage src={category.image} alt={category.name} className="w-16 h-16 rounded-xl object-cover border shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm group-hover:text-primary">{category.name}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{category.description?.slice(0, 45)}</div>
          {typeof category.productCount === 'number' && <div className="text-[11px] text-primary mt-0.5">{category.productCount} product{category.productCount === 1 ? '' : 's'}</div>}
        </div>
        <span className="ml-auto w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">›</span>
      </Link>
    );
  }

  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div className="overflow-hidden rounded-3xl spiritual-card group-hover:shadow-[0_20px_50px_-20px_rgba(20,40,8,0.5)] group-hover:border-sacred-saffron/50 transition-all duration-300">
        <div className="overflow-hidden relative">
          <SmartImage
            src={category.image}
            alt={category.name}
            className="w-full h-40 sm:h-56 md:h-[420px] object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        </div>
        <div className="p-3 md:p-5 text-center bg-gradient-to-b from-[#FFFDF8] to-sacred-sandal/60 border-t border-sacred-maroon/10 relative">
          <span className="absolute inset-x-8 top-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-sacred-saffron to-transparent" />
          <h3 className="font-sacred text-sm sm:text-base md:text-[22px] leading-tight text-sacred-deepmaroon group-hover:text-sacred-maroon transition">
            {category.name}
          </h3>
          {typeof category.productCount === 'number' && category.productCount > 0 && (
            <div className="text-[11px] text-gray-400 mt-1">{category.productCount} product{category.productCount === 1 ? '' : 's'}</div>
          )}
        </div>
      </div>
    </Link>
  );
}