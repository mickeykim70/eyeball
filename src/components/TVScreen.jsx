import React from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../store';

export function TVScreen() {
  const visionState = useStore((s) => s.visionState);
  
  // 망막 상의 흐림(Blur) 정도
  let blurPx = 0;
  if (visionState === 'myopia') blurPx = 3;
  if (visionState === 'hyperopia') blurPx = 4;
  
  return (
    <group position={[4.0, 3.2, 0]} rotation={[0, 0, 0]}>
      {/* 3D 공간에 떠있는 HTML 패널 - 크기 대폭 축소 */}
      <Html transform distanceFactor={5} position={[0, 0, 0]}>
        <div style={{
          width: '180px', height: '140px',
          background: '#0f172a', border: '5px solid #334155', borderRadius: '10px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.8), 0 0 15px rgba(59, 130, 246, 0.2)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* 상단 라벨 */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: '#1e293b', color: '#94a3b8', fontSize: '10px', letterSpacing: '1px',
            padding: '4px 0', textAlign: 'center', fontWeight: '700'
          }}>
            📺 망막 촬상 화면 (POV)
          </div>
          
          {/* 회원님의 오리지널 TargetArrow 형태를 정확히 본딴 SVG 모양 (Inverted) */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: `blur(${blurPx}px)`, transition: 'filter 0.6s ease-in-out',
            // 상하좌우 완전 역상 (180도 회전)
            transform: 'rotate(180deg)', 
            marginTop: '20px', opacity: blurPx > 2 ? 0.7 : 1
          }}>
            <svg viewBox="-1.2 -2.2 2.4 4.4" style={{ width: '40px', height: '80px', overflow: 'visible' }}>
              <g transform="scale(1, -1)"> {/* Y축을 위쪽 기준의 데카르트 좌표계로 보정 */}
                {/* 좌측(빨강) 화살표 파츠 */}
                <path d="M 0 2 L 0 -2 L -0.4 -2 L -0.4 0 L -1.0 0 Z" fill="#ef4444" />
                {/* 우측(파랑) 화살표 파츠 */}
                <path d="M 0 2 L 1.0 0 L 0.4 0 L 0.4 -2 L 0 -2 Z" fill="#3b82f6" />
              </g>
            </svg>
          </div>
          
          {/* 하단 포커스 상태 텍스트 */}
          <div style={{
            position: 'absolute', bottom: '8px', right: '12px',
            color: blurPx === 0 ? '#22c55e' : '#eab308', 
            fontSize: '11px', fontWeight: '900', fontStyle: 'italic',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {blurPx === 0 ? '● FOCUS OK' : '○ OUT OF FOCUS'}
          </div>
        </div>
      </Html>
    </group>
  );
}
