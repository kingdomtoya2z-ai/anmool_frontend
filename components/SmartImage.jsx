'use client';

/**
 * SmartImage renders a real <img> when a URL exists, otherwise a clean
 * neutral gradient block — never a remote placeholder/dummy image.
 */
export default function SmartImage({ src, alt = '', className = '', rounded = '', ...rest }) {
  if (!src) {
    return (
      <div
        className={`bg-gradient-to-br from-[#E7E6DF] via-cream to-accent/10 flex items-center justify-center ${rounded} ${className}`}
        aria-label={alt || 'No image'}
      >
        <svg className="w-1/3 h-1/3 text-[#C9C7B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} {...rest} />;
}