'use client';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = '返回' }: BackButtonProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
      onClick={onClick}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      <span style={{ fontSize: '13px', color: '#1D1D1F', fontWeight: '500' }}>{label}</span>
    </div>
  );
}
