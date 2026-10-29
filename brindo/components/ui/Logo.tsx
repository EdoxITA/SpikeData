export function Glasses({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 48" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-16 19 40)">
          <path d="M12 6h14l-1.8 15a5.2 5.2 0 0 1-10.4 0z" />
          <path d="M19 26v14M13 40h12" />
        </g>
        <g transform="rotate(16 37 40)">
          <path d="M30 6h14l-1.8 15a5.2 5.2 0 0 1-10.4 0z" />
          <path d="M37 26v14M31 40h12" />
        </g>
      </g>
      <g stroke="#d6b36a" strokeWidth="2.2" strokeLinecap="round">
        <path d="M28 2v5M21 4l2 3.5M35 4l-2 3.5" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <Glasses className="h-6 w-auto text-gold" />
      <span>Brindo</span>
    </span>
  );
}
