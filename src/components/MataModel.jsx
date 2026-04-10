import React, { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import mataGlbUrl from '../assets/Mata.glb?url';

/**
 * MataModel - Mata.glb 기반 3D 안구 모델 컴포넌트
 *
 * ════════════════════════════════════════════════════════════════
 * [GLB 내부 메시 구조 분석] - 분석 완료
 * ════════════════════════════════════════════════════════════════
 *
 * [전체 메시 목록 - 콘솔 출력으로 확인 완료]
 * ✅ Sphere001     : 수정체 외피 (Lens outer shell)
 * ✅ Sphere002     : 홍채 앞면 (Iris front) - 뒷면 별도 존재 가능
 * ✅ Sphere003     : 망막 (Retina)
 * ✅ Sphere004     : 공막 (Sclera)
 * ✅ Sphere005     : 각막 (Cornea)
 * ✅ Sphere006     : 수정체 내부 (Lens inner) - Sphere001과 완전히 겹침
 * ✅ Sphere        : 안구 본체 외형 (EyeBody) - 테스트 완료
 *                   ★ 안축장(Axial Length) 변형 핵심 메시 ★
 *                   근시/원시/노안 시뮬레이션 시 반드시 이 메시를 함께 변형해야 함.
 *                   - 근시 (Myopia)    : 안축장 길어짐 → scale.z 증가  (예: 1.0 → 1.2)
 *                   - 원시 (Hyperopia) : 안축장 짧아짐 → scale.z 감소  (예: 1.0 → 0.85)
 *                   - 노안 (Presbyopia): 수정체 조절력 저하 (안축장 변화 없음, Sphere001/006 담당)
 *                   ※ scale.z 변경 시 Sphere003(망막), Sphere004(공막)도 함께 조정 필요
 * ✅ Saraf          : 모양체 추정 (Ciliary Body) - 테스트 완료
 *                   홍채 뒤쪽에 위치. 수정체 두께를 조절하는 근육 구조.
 *                   원시(Hyperopia) / 노안(Presbyopia) 설명 시 조절력(Accommodation) 묘사에 활용 가능.
 * ✅ Saraf2         : 모양체-2 (Ciliary Body-2) - 테스트 완료
 *                   Saraf와 동일 위치에 겹쳐있는 같은 구조물의 두 번째 레이어.
 * ✅ BezierCurve    : 망막 혈관 (Retinal Blood Vessel) - 테스트 완료
 * ✅ BezierCurve009 : 망막 혈관 (Retinal Blood Vessel) - 테스트 완료
 *
 * ⚠️ 핵심 구조 문제: 두 메시가 position/scale 완전히 동일 → 완벽하게 겹쳐있음
 *    이것은 GLB 모델 자체의 설계 구조이며, 수정 불가. 코드 레벨에서 대응해야 함.
 *
 * ════════════════════════════════════════════════════════════════
 * [발견된 문제 및 해결책]
 * ════════════════════════════════════════════════════════════════
 *
 * 🔴 [Critical] renderOrder 누락 (→ 수정 완료)
 *    - 문제: 두 메시가 겹쳐있는데 렌더 순서가 지정되지 않으면
 *            매 프레임 GPU가 임의 순서로 그려 투명도가 깜빡이거나 뒤집힘.
 *            depthWrite:false 단독으로는 이 문제를 막을 수 없음.
 *    - 해결: Sphere006(수정체) renderOrder=1, Sphere001(각막) renderOrder=2
 *            → 수정체를 먼저 그린 뒤 각막을 위에 덮어야 올바른 레이어링
 *
 * 🟡 [Minor] thickness 누락 (→ 수정 완료)
 *    - 문제: MeshPhysicalMaterial에서 transmission(빛 투과) 사용 시
 *            thickness가 없으면 내부 부피를 0으로 계산 → 굴절/산란이 없는 평면유리처럼 보임.
 *    - 해결: 각막 thickness=0.5, 수정체 thickness=0.8 (수정체가 더 두꺼운 구조)
 *
 * 🟡 [Minor] opacity:1 + transparent:true 혼용 (현상 유지)
 *    - transmission:1.0이면 opacity는 시각적으로 무의미하지만,
 *      transparent:true는 Three.js 렌더 파이프라인이 이 오브젝트를
 *      "투명 큐"에 배치하기 위해 반드시 필요 → 제거하면 안 됨.
 *
 * 🔵 [Info] 나머지 메시들의 재질 상태 불명확
 *    - Sphere001, Sphere006 외 메시(공막/홍채/망막 등)는
 *      traverse에서 아무 처리 없이 GLB 원본 재질 그대로 사용됨.
 *    - 원본 재질의 색상/투명도 설정을 확인하지 않은 채 사용 중.
 *    - 필요 시 아래 traverse 블록에서 child.name 으로 접근해 덮어쓸 수 있음.
 *
 * ════════════════════════════════════════════════════════════════
 * [투명 메시 렌더링 규칙 - 이 파일에서 반드시 지킬 것]
 * ════════════════════════════════════════════════════════════════
 *  1) 겹치는 투명 메시는 항상 renderOrder를 명시할 것
 *  2) depthWrite: false 는 두 메시 모두 반드시 유지할 것
 *  3) transmission 사용 시 thickness 를 함께 지정할 것
 */
export function MataModel(props) {
  const { scene } = useGLTF(mataGlbUrl);
  const visionState = useStore((s) => s.visionState);

  // 메쉬들의 원본 Z좌표 및 스케일을 기억하기 위한 Ref (안축장 애니메이션용)
  const originalZ = useRef({});

  useLayoutEffect(() => {
    // 모든 수동 재질 덮어쓰기 및 초기값 백업
    scene.traverse((child) => {
      if (child.isMesh) {
        // 원본 스케일 + geometry 크기 기억 (최초 1회) - 안축장 변형 애니메이션에 필요
        if (originalZ.current[child.name] === undefined) {
          // bounding box 계산 (geometry 실제 크기 확인용)
          child.geometry.computeBoundingBox();
          const bb = child.geometry.boundingBox;
          originalZ.current[child.name] = {
            posZ: child.position.z,
            scaleX: child.scale.x,
            scaleY: child.scale.y,    // 광학축(앞뒤) 확인된 축
            scaleZ: child.scale.z,
            bboxY: bb.max.y - bb.min.y, // geometry Y방향 크기 (주 축 메시용)
            bboxZ: bb.max.z - bb.min.z, // geometry Z방향 크기 (Sphere003용)
          };
        }

        // ── Sphere001: 수정체 외피 (Lens outer shell) ────────────────────
        // [메시 분석 결과] 코드상 각막(Cornea)으로 분류했으나,
        // 렌더링 테스트 결과 실제로는 수정체 외피에 해당하는 메시임.
        // Sphere006(수정체 내부)과 같은 위치에 겹쳐있으므로
        // renderOrder=2 로 Sphere006(=1) 다음에 렌더링.
        if (child.name === 'Sphere001') {
          child.renderOrder = 2; // 겹침 해결 핵심 - Sphere006보다 나중에 그림
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff',
            transmission: 1.0,   // 완전 투과 (순수 유리)
            opacity: 1,
            transparent: true,   // transmission 사용 시에도 transparent:true 필요
            roughness: 0,
            ior: 1.37,           // 각막 굴절률
            thickness: 0.5,      // 내부 부피 두께 - transmission의 굴절 계산에 필요
            depthWrite: false,   // 겹친 메시 렌더링 충돌 방지 - 반드시 유지
          });
        }

        // ── Sphere002: 홍채 앞면 (Iris front) ───────────────────────────
        // 뒷면 메시가 별도로 존재할 수 있음 (미확인)

        // ── Sphere003: 망막 (Retina) ─────────────────────────────────────

        // ── Sphere004: 공막 (Sclera) ─────────────────────────────────────

        // ── Sphere005: 각막 (Cornea) ─────────────────────────────────────
        if (child.name === 'Sphere005') {
          child.material = new THREE.MeshPhysicalMaterial({
            transmission: 1.0,   // 완전 투과
            opacity: 1,
            transparent: true,
            roughness: 0,
            ior: 1.33,           // 각막 굴절률
            thickness: 0.5,
            depthWrite: false,
          });
        }

        // ── Sphere006: 수정체 내부 (Lens inner) ──────────────────────────
        // Sphere001(수정체 외피)과 같은 위치에 겹쳐있으므로
        // renderOrder=1 로 Sphere001(=2)보다 먼저 렌더링.
        if (child.name === 'Sphere006') {
          child.renderOrder = 1; // 겹침 해결 핵심 - Sphere001보다 먼저 그림
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#c4e1f6',    // 살짝 푸른빛 - 수정체 존재감 표현
            transmission: 0.9,   // 거의 투과 (약간 불투명)
            opacity: 1,
            transparent: true,
            roughness: 0,
            ior: 1.42,           // 실제 수정체 굴절률 (1.40~1.42)
            thickness: 0.8,      // 수정체는 각막보다 두꺼움
            depthWrite: false,   // 겹친 메시 렌더링 충돌 방지 - 반드시 유지
          });
        }

        // ── Sphere: 안구 본체 외형 (EyeBody) ─────────────────────────────
        // ★ 안축장(Axial Length) 변형 핵심 메시 ★
        // 근시/원시 시뮬레이션 시 반드시 이 메시를 함께 변형할 것 (주석 상단 참고)

        // ── Saraf: 모양체 추정 (Ciliary Body) ────────────────────────────
        // ── Saraf2: 모양체-2 (Ciliary Body-2) ────────────────────────────
        // ── BezierCurve / BezierCurve009: 망막 혈관 (Retinal Blood Vessel)


      }
    });
  }, [scene]);

  // 안축장 변형 대상: Sphere003(망막) 임시 제외 — 축 방향 확인 중
  const AXIAL_MESHES_1 = new Set(['Sphere004', 'Sphere', 'BezierCurve', 'BezierCurve009']);

  useFrame(() => {
    // 디옵터별 안축장 배율 (임상 근사치: -1D ≈ +0.35mm, 정상 24mm 기준)
    // -3D → +1.0mm → 4.2% 증가 → 1.042
    // -6D → +2.0mm → 8.3% 증가 → 1.083
    // -9D → +3.0mm → 12.5% 증가 → 1.125
    const SCALE_MAP = {
      myopia_3d:    1.042,  // 안축장 +1.0mm (+4.2%)
      myopia_6d:    1.083,  // 안축장 +2.0mm (+8.3%)
      myopia_9d:    1.125,  // 안축장 +3.0mm (+12.5%)
      hyperopia_2d: 0.971,  // 안축장 -0.7mm (-2.9%)
      hyperopia_4d: 0.942,  // 안축장 -1.4mm (-5.8%)
      hyperopia_6d: 0.913,  // 안축장 -2.1mm (-8.7%)
    };
    const targetScaleZ = SCALE_MAP[visionState] ?? 1.0;

    scene.traverse((child) => {
      if (!child.isMesh || !AXIAL_MESHES_1.has(child.name)) return; // 5개 타겟

      const orig = originalZ.current[child.name];
      if (!orig) return;

      // scale.y: 광학축(앞뒤) 방향으로 늘림
      child.scale.y = THREE.MathUtils.lerp(child.scale.y, orig.scaleY * targetScaleZ, 0.05);

      // position.y: 중심 기준 팽창으로 각막쪽도 밀리는 문제 보상
      // 늘어난 양의 절반만큼 +Y 방향으로 이동 (방향 테스트: +1)
      // position.z: 광학축 방향 보정 (position.z = 세계 -X = 뒤통수 방향)
      // 늘어난 양의 절반만큼 이동해 각막쪽 고정 (방향 테스트: +1)
      const expand = orig.scaleY * (targetScaleZ - 1.0); // * 0.5 제거 — 보정량 두 배
      child.position.z = THREE.MathUtils.lerp(child.position.z, orig.posZ - expand, 0.05);
    });

    // Sphere003(망막): 내부 축이 달라 scale.z로 별도 테스트
    scene.traverse((child) => {
      if (!child.isMesh || child.name !== 'Sphere003') return;

      const orig = originalZ.current[child.name];
      if (!orig) return;

      // Sphere004(공막) 기준 세계 단위 변화량에 맞춰 Sphere003 scale.z 정규화
      const ref = originalZ.current['Sphere004'];
      const worldDelta = ref ? ref.bboxY * ref.scaleY * (targetScaleZ - 1.0) : 0; // 공막의 세계 단위 늘어나는 양
      const normDelta = orig.bboxZ > 0 ? worldDelta / orig.bboxZ : 0;             // Sphere003 geometry 크기로 나눠 scale 단위로 변환
      child.scale.z = THREE.MathUtils.lerp(child.scale.z, orig.scaleZ + normDelta, 0.05);
    });
  });

  return (
    <primitive
      object={scene}
      {...props}
      onPointerDown={(e) => {
        e.stopPropagation();
        console.log("Clicked Mesh Name:", e.object.name);
        window.LastClickedMesh = e.object.name; // 전역 접근용 (디버깅)
      }}
    />
  );
}

// GLB 파일 사전 로드 (첫 렌더링 시 로딩 지연 방지)
useGLTF.preload(mataGlbUrl);
