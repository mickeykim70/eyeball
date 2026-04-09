import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

export function IntroCamera() {
  const isStarted = useRef(false);
  const targetPosition = new THREE.Vector3(0, 0, 12);

  useFrame((state) => {
    // 최초 렌더링 시 카메라를 약간 멀리(Z: 25) 둡니다.
    if (!isStarted.current) {
      state.camera.position.set(0, 0, 25);
      isStarted.current = true;
    }

    // 목표 위치(Z: 12)를 향해 부드럽게(lerp) 이동시킵니다.
    state.camera.position.lerp(targetPosition, 0.03);
    
    // 항상 화면 중심을 바라보게 합니다.
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}
