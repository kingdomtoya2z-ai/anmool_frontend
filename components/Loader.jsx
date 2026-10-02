'use client';

export default function Loader({ size = 'default', text = 'Loading...', fullScreen = false }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-20 h-20',
    large: 'w-28 h-28',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-10';

  return (
    <div className={containerClass}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-cream border-t-primary animate-spin`}></div>

        {/* Inner logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-20 h-20' : 'w-14 h-14'} rounded-full bg-white shadow-md flex items-center justify-center p-1.5 animate-pulse`}>
            <img
              src="/loader.png"
              alt="Loading"
              className="w-full h-full object-contain"
              width={56}
              height={56}
            />
          </div>
        </div>

        {/* Accent dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
      </div>

      {text && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-primary animate-pulse">{text}</p>
          <p className="text-xs text-gray-500 mt-1">Anmool Dairy • Pure Products</p>
        </div>
      )}
    </div>
  );
}

// Inline loader for buttons
export function ButtonLoader() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      <span>Loading...</span>
    </span>
  );
}

// Page transition loader
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-cream to-white">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-accent/15 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/loader.png" alt="Anmool Dairy" className="w-16 h-16 object-contain animate-pulse" width={64} height={64} />
        </div>
      </div>
      <div className="mt-6 text-center">
        <div className="font-serif font-bold text-primary text-lg">ANMOOL DAIRY</div>
        <div className="text-xs tracking-[0.2em] text-gray-500">PURE • HONEST • TRUSTED</div>
        <div className="mt-3 flex justify-center gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-cream"></div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-2/3"></div>
        <div className="h-4 bg-gray-100 rounded-full w-full"></div>
        <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
        <div className="h-8 bg-gray-100 rounded-full w-full mt-4"></div>
      </div>
    </div>
  );
}
