import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';

// 근시 단계별 blur 양 (px)
const BLUR_MAP = {
  myopia_3d: 2,
  myopia_6d: 5,
  myopia_9d: 9,
};

/**
 * 캔버스에 TV 화면을 드로잉하는 순수 함수
 * - 화살표는 도립상(倒立像): X축 + Y축 모두 반전 (= 180° 회전)
 *   망막에 맺히는 상은 상하좌우 뒤집힌 도립상임
 * - blurPx > 0 이면 화살표 영역에 blur 필터 적용 (근시 흐림 효과)
 */
function drawScreen(ctx, blurPx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.clearRect(0, 0, w, h);

  // ── 배경 ──────────────────────────────────────────────────
  ctx.filter = 'none';
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // ── 테두리 ────────────────────────────────────────────────
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, w - 10, h - 10);

  // ── 상단 라벨 배경 ─────────────────────────────────────────
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(5, 5, w - 10, 32);

  // ── 상단 라벨 텍스트 ───────────────────────────────────────
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('망막 촬상 화면 (POV)', w / 2, 21);

  // ── 화살표 (도립상: X·Y 모두 반전) ───────────────────────
  ctx.save();
  if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`; // 근시 흐림 적용

  const cx = w / 2;
  const cy = h / 2 + 10;
  const s  = 50;
  const tx = (x) => cx - x * s; // X 반전 (좌우 뒤집기)
  const ty = (y) => cy + y * s; // Y 반전 (상하 뒤집기 — 도립상)

  // 좌측(빨강) 파츠
  ctx.beginPath();
  ctx.moveTo(tx(0),    ty(2));
  ctx.lineTo(tx(0),    ty(-2));
  ctx.lineTo(tx(-0.4), ty(-2));
  ctx.lineTo(tx(-0.4), ty(0));
  ctx.lineTo(tx(-1.0), ty(0));
  ctx.closePath();
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  // 우측(파랑) 파츠
  ctx.beginPath();
  ctx.moveTo(tx(0),   ty(2));
  ctx.lineTo(tx(1.0), ty(0));
  ctx.lineTo(tx(0.4), ty(0));
  ctx.lineTo(tx(0.4), ty(-2));
  ctx.lineTo(tx(0),   ty(-2));
  ctx.closePath();
  ctx.fillStyle = '#3b82f6';
  ctx.fill();

  ctx.restore();

  // ── 하단 포커스 상태 텍스트 ────────────────────────────────
  ctx.filter = 'none'; // blur 리셋 (텍스트는 선명하게)
  ctx.fillStyle = blurPx > 0 ? '#eab308' : '#22c55e';
  ctx.font = 'bold italic 14px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(blurPx > 0 ? '○ OUT OF FOCUS' : '● FOCUS OK', w - 15, h - 12);
}

export function TVScreen() {
  const visionState = useStore((s) => s.visionState);

  // 현재 근시 단계에 해당하는 blur 량
  const blurPx = BLUR_MAP[visionState] ?? 0;

  // 캔버스 + 텍스처 최초 1회 생성, 초기 상태(blur 0)로 드로잉
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width  = 360;
    canvas.height = 280;
    drawScreen(canvas.getContext('2d'), 0); // 초기 드로잉
    const texture = new THREE.CanvasTexture(canvas);
    return { canvas, texture };
  }, []);

  // visionState 변경 시 캔버스 재드로잉 + 텍스처 갱신
  useEffect(() => {
    drawScreen(canvas.getContext('2d'), blurPx);
    texture.needsUpdate = true;
  }, [blurPx, canvas, texture]);

  return (
    // 기존과 동일한 위치 유지
    <group position={[4.0, 3.2, 0]} rotation={[0, 0, 0]}>
      <mesh>
        {/* 기존 1.8x1.4 → 50% 확대 → 2.7x2.1 */}
        <planeGeometry args={[2.7, 2.1]} />
        {/* toneMapped=false: 조명/톤매핑 영향 없이 원색 유지 */}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
