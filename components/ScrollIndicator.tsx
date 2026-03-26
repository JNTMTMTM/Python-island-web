'use client';

interface ScrollIndicatorProps {
  transitionProgress: number;
}

export default function ScrollIndicator({ transitionProgress }: ScrollIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: `translateX(-50%) translateY(${Math.min(transitionProgress * 2, 1) * 100}px)`,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: Math.max(0, 1 - transitionProgress * 4),
        transition: 'opacity 0.4s ease, transform 0.6s ease',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#A1A1A6',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        向下滚动
      </span>
      <div
        style={{
          width: '1px',
          height: '48px',
          background: 'linear-gradient(to bottom, rgba(29, 29, 31, 0.2), transparent)',
        }}
      />
    </div>
  );
}
