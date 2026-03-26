'use client';

type ViewState = 'hero' | 'features' | 'branches';

interface ScrollIndicatorProps {
  activeView: ViewState;
}

export default function ScrollIndicator({ activeView }: ScrollIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: activeView === 'hero' ? 1 : 0,
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease',
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
