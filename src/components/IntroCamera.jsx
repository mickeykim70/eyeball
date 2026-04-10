import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useStore } from '../store';

export function IntroCamera() {
  const introTrigger = useStore((s) => s.introTrigger);
  const setOrbitEnabled = useStore((s) => s.setOrbitEnabled);
  const isStarted = useRef(false);
  const isDone = useRef(false);
  const targetPosition = new THREE.Vector3(0, 0, 12);

  // introTrigger가 증가하면 인트로 애니메이션 재실행 (정시 리셋 시)
  useEffect(() => {
    if (introTrigger > 0) {
      isStarted.current = false;
      isDone.current = false;
    }
  }, [introTrigger]);

  useFrame((state) => {
    // 인트로 완료 후에는 카메라 제어를 OrbitControls에 넘김
    if (isDone.current) return;

    // 최초 렌더링 시 카메라를 약간 멀리(Z: 25) 둡니다.
    if (!isStarted.current) {
      state.camera.position.set(0, 0, 25);
      isStarted.current = true;
    }

    // 목표 위치(Z: 12)를 향해 부드럽게(lerp) 이동시킵니다.
    state.camera.position.lerp(targetPosition, 0.03);

    // 항상 화면 중심을 바라보게 합니다.
    state.camera.lookAt(0, 0, 0);

    // 목표 위치에 충분히 가까워지면 인트로 완료 처리
    if (state.camera.position.distanceTo(targetPosition) < 0.1) {
      state.camera.position.copy(targetPosition);
      isDone.current = true;

      // ⚠️ 인트로 완료 → OrbitControls 활성화
      // 이 시점까지 OrbitControls는 비활성(enabled=false) 상태였으므로
      // 내부 상태를 전혀 업데이트하지 않음.
      // enabled=true 전환 시 현재 카메라 위치(Z:12)를 기준으로 새로 초기화되어
      // 마우스 드래그 시 snap(회귀) 버그가 발생하지 않음.
      setOrbitEnabled(true);
    }
  });

  return null;
}
