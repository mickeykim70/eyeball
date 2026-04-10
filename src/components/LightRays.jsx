import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TargetArrow } from './TargetArrow';
import { useStore } from '../store';

/**
 * LightRays - 광선 경로 및 초점 화살표 시각화
 *
 * ════════════════════════════════════════════════════════════════
 * [초점 위치 설계]
 * ════════════════════════════════════════════════════════════════
 *
 * 정시(Emmetropia): 초점 = 망막(x=5.4) — 상이 정확히 맺힘
 *
 * 원시(Hyperopia): 수정체가 두꺼워지며 조절하지만 굴절력 과잉으로
 *   초점이 망막 앞(x < 5.4)에 형성됨
 *   원시가 심해질수록 초점이 망막에서 더 멀리 앞으로 이동:
 *   +2D → x=5.35 / +4D → x=5.30 / +6D → x=5.27
 *
 * ※ 광선 5가닥 수렴점과 역상 화살표를 동기화해 업데이트
 *   drei <Line>은 매 프레임 geometry 수정 불가 →
 *   THREE.Line BufferGeometry 직접 수정 방식으로 구현 (lineWidth=1px 고정)
 */

// 망막 x 좌표 (그룹 로컬 기준)
const RETINA_X = 5.4;

// 원시 단계별 초점 목표 x 좌표 (망막 앞 = 작은 x값)
// 볼록렌즈가 두꺼워질수록 초점거리 단축 → 초점이 렌즈 쪽으로 소폭 이동
const FOCAL_TARGET_MAP = {
  hyperopia_2d: 5.35, // 망막 앞 0.05
  hyperopia_4d: 5.30, // 망막 앞 0.10
  hyperopia_6d: 5.27, // 망막 앞 0.13
};

// 5가닥 광선 출발 좌표 (화살표 각 꼭짓점)
const RAY_COORDS = [
  { y: 0,    z: 0    }, // 중앙
  { y: 0.4,  z: 0    }, // 상단
  { y: -0.4, z: 0    }, // 하단
  { y: 0,    z: 0.2  }, // 앞쪽 끝
  { y: 0,    z: -0.2 }, // 뒤쪽 끝
];

export function LightRays() {
  const visionState = useStore((s) => s.visionState);

  // 현재 애니메이션 중인 초점 x 좌표 (ref: 매 프레임 업데이트, 리렌더링 불필요)
  const focalXRef = useRef(RETINA_X);

  // 역상 화살표 group ref (position.x를 매 프레임 직접 수정)
  const focalGroupRef = useRef();

  // THREE.Line 오브젝트 배열 — useMemo로 최초 1회 생성
  const lineObjects = useMemo(() => {
    return RAY_COORDS.map(({ y, z }) => {
      const positions = new Float32Array([
        -3.96, y, z,      // 출발: 3D 화살표 꼭짓점
         3.25, y, z,      // 수정체 표면 통과 (평행 광선 구간)
         RETINA_X, 0, 0,  // 수렴점: 초기값 = 망막
      ]);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: '#39ff14',
        transparent: true,
        opacity: 0.65,
        depthTest: false, // 안구 메시를 투과해 보이도록
      });
      return new THREE.Line(geometry, material);
    });
  }, []);

  useFrame(() => {
    // 현재 visionState에 해당하는 초점 목표 x (원시 외 상태는 망막으로 복귀)
    const targetX = FOCAL_TARGET_MAP[visionState] ?? RETINA_X;

    // 현재 초점 x → 목표 x로 부드럽게 보간
    focalXRef.current = THREE.MathUtils.lerp(focalXRef.current, targetX, 0.05);
    const fx = focalXRef.current;

    // 광선 5가닥 수렴점(3번째 점) x 좌표 업데이트
    lineObjects.forEach((line) => {
      const pos = line.geometry.attributes.position;
      pos.setXYZ(2, fx, 0, 0);
      pos.needsUpdate = true;
    });

    // 역상 화살표 위치 동기화
    if (focalGroupRef.current) {
      focalGroupRef.current.position.x = fx;
    }
  });

  return (
    <group>
      {/* 5가닥 광선 (THREE.Line primitive — 매 프레임 수렴점 업데이트) */}
      {lineObjects.map((line, idx) => (
        <primitive key={idx} object={line} />
      ))}

      {/* 초점에 맺히는 역상(도립상) — 수렴점과 동기화 */}
      <group ref={focalGroupRef} position={[RETINA_X, 0, 0]}>
        <TargetArrow
          scale={0.12}
          // X축 180° 회전: 상하좌우 뒤집힌 도립상 (물리학적 역상)
          rotation={[Math.PI, -Math.PI / 2, 0]}
        />
      </group>
    </group>
  );
}
