import React from 'react';
import { useStore } from '../store';

export function UI() {
  const visionState = useStore((state) => state.visionState);

  const getTitle = () => {
    switch (visionState) {
      case 'emmetropia': return '정시 (Normal Vision)';
      case 'myopia': return '근시 (Myopia)';
      case 'hyperopia': return '원시 (Hyperopia)';
      case 'presbyopia': return '노안 (Presbyopia)';
      default: return '알 수 없음';
    }
  };

  const getDescription = () => {
    switch (visionState) {
      case 'emmetropia': return '망막에 초점이 정확하게 맺히는 정상적인 시력 상태입니다.';
      default: return '';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      maxWidth: '300px',
      color: '#1e293b',
      fontFamily: '"Pretendard", "Inter", sans-serif'
    }}>
      <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
        👁️ 3D 안구 시뮬레이터
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ 
          background: '#3b82f6', 
          color: 'white', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px', 
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          {getTitle()}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#475569' }}>
        {getDescription()}
      </p>
    </div>
  );
}
