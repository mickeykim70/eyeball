import React from 'react';
import { useStore } from '../store';

export function UI() {
  const { visionState, setVisionState, triggerIntroAnimation } = useStore();

  // 현재 visionState가 어느 최상위 카테고리에 속하는지 판단
  const isHyperopia = visionState.startsWith('hyperopia');
  const isMyopia    = visionState.startsWith('myopia');

  // 버튼 공통 스타일 생성 함수
  const btnStyle = (isActive) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: isActive ? '700' : '500',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#64748b',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
  });

  // 서브 버튼용 — 크기 살짝 작게
  const subBtnStyle = (isActive) => ({
    ...btnStyle(isActive),
    fontSize: '0.82rem',
    padding: '0.4rem 0.9rem',
    backgroundColor: isActive ? '#6366f1' : 'rgba(99, 102, 241, 0.08)',
    color: isActive ? 'white' : '#6366f1',
    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
  });

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
      fontFamily: '"Pretendard", "Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>

      {/* 1행: 원시 | 정시 | 근시 */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>

        {/* 원시 — 클릭 시 경도(+2D)로 설정 */}
        <button
          onClick={() => setVisionState('hyperopia_2d')}
          style={btnStyle(isHyperopia)}
        >
          원시(+2D)
        </button>

        {/* 정시 — 클릭 시 인트로 애니메이션 재실행 */}
        <button
          onClick={() => triggerIntroAnimation()}
          style={btnStyle(visionState === 'emmetropia')}
        >
          정시
        </button>

        {/* 근시 — 클릭 시 경도(-2D)로 설정 */}
        <button
          onClick={() => setVisionState('myopia_3d')}
          style={btnStyle(isMyopia)}
        >
          근시(-2D)
        </button>

      </div>

      {/* 2행: 원시 서브버튼 (중등도 +4D, 고도 +6D) */}
      {isHyperopia && (
        <div style={{ display: 'flex', gap: '0.4rem', paddingLeft: '0.2rem' }}>
          <button onClick={() => setVisionState('hyperopia_4d')} style={subBtnStyle(visionState === 'hyperopia_4d')}>
            중등도(+4D)
          </button>
          <button onClick={() => setVisionState('hyperopia_6d')} style={subBtnStyle(visionState === 'hyperopia_6d')}>
            고도(+6D)
          </button>
        </div>
      )}

      {/* 2행: 근시 서브버튼 (중등도 -6D, 고도 -9D) */}
      {isMyopia && (
        <div style={{ display: 'flex', gap: '0.4rem', paddingLeft: '0.2rem' }}>
          <button onClick={() => setVisionState('myopia_6d')} style={subBtnStyle(visionState === 'myopia_6d')}>
            중등도 -6D
          </button>
          <button onClick={() => setVisionState('myopia_9d')} style={subBtnStyle(visionState === 'myopia_9d')}>
            고도 -9D
          </button>
        </div>
      )}

    </div>
  );
}
