import React from 'react';
import { useStore } from '../store';

export function UI() {
  const { visionState, setVisionState, triggerIntroAnimation } = useStore();

  const options = [
    { id: 'emmetropia', label: '정시 (Normal)' },
    { id: 'myopia', label: '근시 (Myopia)' },
    { id: 'hyperopia', label: '원시 (Hyperopia)' },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      padding: '0.75rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      fontFamily: '"Pretendard", "Inter", sans-serif'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {options.map((opt) => {
          const isActive = visionState === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                if (opt.id === 'emmetropia') {
                  triggerIntroAnimation();
                } else {
                  setVisionState(opt.id);
                }
              }}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: isActive ? '700' : '500',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? 'white' : '#64748b',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
