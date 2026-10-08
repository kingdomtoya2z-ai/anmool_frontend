import Link from 'next/link';
import SmartImage from '@/components/SmartImage';

export default function CategoryCard({ category, variant = 'large' }) {
  if (variant === 'small') {
    return (
      <Link href={`/category/${category.slug}`} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition group">
        <SmartImage src={category.image} alt={category.name} className="w-16 h-16 rounded-xl object-contain border shrink-0" />
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
    <Link href={`/category/${category.slug}`} className="group flex flex-col items-center text-center w-[104px] sm:w-[136px] lg:w-[150px] shrink-0">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-white border-2 border-sacred-saffron/40 shadow-md group-hover:shadow-[0_16px_40px_-16px_rgba(20,40,8,0.5)] group-hover:border-sacred-saffron transition-all duration-300 shrink-0">
        <SmartImage
          src={category.image}
          alt={category.name}
          className="w-full h-full object-contain"
        />
      </div>
      <h3 className="font-sacred text-xs sm:text-sm lg:text-[15px] leading-tight text-sacred-deepmaroon group-hover:text-sacred-maroon transition mt-2 line-clamp-2">
        {category.name}
      </h3>
      {typeof category.productCount === 'number' && category.productCount > 0 && (
        <div className="text-[10px] lg:text-[11px] text-gray-400 mt-0.5">{category.productCount} product{category.productCount === 1 ? '' : 's'}</div>
      )}
    </Link>
  );
}