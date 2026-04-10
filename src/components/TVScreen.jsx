import React, { useMemo } from 'react';
import * as THREE from 'three';

export function TVScreen() {
  // CanvasTexture: 컴포넌트 마운트 시 한 번만 생성
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');

    // --- 배경 ---
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 360, 280);

    // --- 테두리 ---
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 350, 270);

    // --- 상단 라벨 배경 ---
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, 5, 350, 32);

    // --- 상단 라벨 텍스트 ---
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('망막 촬상 화면 (POV)', 180, 21);

    // --- 화살표 그리기 ---
    // SVG viewBox "-1.2 -2.2 2.4 4.4" 기준의 경로를 canvas 좌표로 변환
    // canvas 중심: (180, 155), 1유닛 = 50px, Y축 반전(수학 좌표계 → canvas)
    const cx = 180;
    const cy = 155;
    const s = 50;
    const tx = (x) => cx + x * s;       // X: 오른쪽 양수
    const ty = (y) => cy - y * s;       // Y: 위쪽 양수 (canvas Y축 반전)

    // 좌측(빨강) 파츠: 세로 막대 + 왼쪽 수평 날개
    ctx.beginPath();
    ctx.moveTo(tx(0),    ty(2));
    ctx.lineTo(tx(0),    ty(-2));
    ctx.lineTo(tx(-0.4), ty(-2));
    ctx.lineTo(tx(-0.4), ty(0));
    ctx.lineTo(tx(-1.0), ty(0));
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // 우측(파랑) 파츠: 세로 막대 + 오른쪽 화살촉
    ctx.beginPath();
    ctx.moveTo(tx(0),   ty(2));
    ctx.lineTo(tx(1.0), ty(0));
    ctx.lineTo(tx(0.4), ty(0));
    ctx.lineTo(tx(0.4), ty(-2));
    ctx.lineTo(tx(0),   ty(-2));
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    // --- 하단 FOCUS OK 텍스트 ---
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold italic 14px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('● FOCUS OK', 345, 268);

    // CanvasTexture 생성 및 반환
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []); // 의존성 없음 — 항상 선명한 정적 텍스처

  return (
    // 기존과 동일한 위치 유지
    <group position={[4.0, 3.2, 0]} rotation={[0, 0, 0]}>
      <mesh>
        {/* 180:140 비율 유지, 3D 크기는 장면에 맞게 조정 */}
        <planeGeometry args={[1.8, 1.4]} />
        {/* toneMapped=false: 색상이 조명/톤매핑에 영향받지 않고 원색 유지 */}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
