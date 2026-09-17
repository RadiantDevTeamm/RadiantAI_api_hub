interface RadiantLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 'h-7 w-7', title: 'text-sm', subtitle: 'text-[9px]' },
  md: { mark: 'h-9 w-9', title: 'text-base', subtitle: 'text-[10px]' },
  lg: { mark: 'h-14 w-14', title: 'text-2xl', subtitle: 'text-xs' },
};

export function RadiantLogo({ size = 'md', showName = true, className = '' }: RadiantLogoProps) {
  const scale = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/IMG_20260803_125411.jpg"
        alt="Radiant geometric R"
        className={`${scale.mark} radiant-mark shrink-0 object-contain`}
      />
      {showName && (
        <div className="min-w-0 leading-none">
          <div className={`font-display font-semibold tracking-[-0.04em] ${scale.title}`}>Radiant</div>
          <div className={`mt-1 text-muted ${scale.subtitle}`}>by Aetheris AI</div>
        </div>
      )}
    </div>
  );
}
