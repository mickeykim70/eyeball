import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useStore } from '../store';

export function IntroCamera() {
  const introTrigger = useStore((s) => s.introTrigger);
  const isStarted = useRef(false);
  const isDone = useRef(false);
  const targetPosition = new THREE.Vector3(0, 0, 12);

  useEffect(() => {
    if (introTrigger > 0) {
      isStarted.current = false;
      isDone.current = false;
    }
  }, [introTrigger]);

  useFrame((state) => {
    // 인트로 애니메이션이 끝났다면, 사용자가 마우스로 자유롭게 조작할 수 있도록 간섭을 중단합니다.
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

    // 카메라가 목표 위치에 충분히 가까워지면 애니메이션을 완전히 종료합니다 (거리 차이 0.1 이하)
    if (state.camera.position.distanceTo(targetPosition) < 0.1) {
      isDone.current = true;
    }
  });

  return null;
}
