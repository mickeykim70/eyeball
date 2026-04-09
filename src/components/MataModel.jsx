import React, { useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import mataGlbUrl from '../assets/Mata.glb?url';

export function MataModel(props) {
  const { scene } = useGLTF(mataGlbUrl);

  useLayoutEffect(() => {
    // 모델을 순회하며 각막과 수정체로 추정되는 파츠의 재질을 유리(투명)로 바꿉니다.
    scene.traverse((child) => {
      if (child.isMesh) {
        // 내부 분석 결과, 앞쪽으로 돌출된 Sphere005(각막), Sphere006(수정체)이 렌즈 역할을 하는 파츠입니다.
        if (child.name === 'Sphere005' || child.name === 'Sphere006') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff',         // 깨끗한 색
            transmission: 0.95,       // 유리처럼 빛을 투과
            opacity: 1,
            transparent: true,
            roughness: 0.05,          // 표면 매끄러움 (0에 가까울수록 유리)
            metalness: 0.1,
            ior: 1.4,                 // 굴절률 (각막과 유사한 수치)
            thickness: 0.5,           // 두께감 (굴절을 위해 필요)
            envMapIntensity: 2,       // 주변 환경 반사 강도
          });
        }
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      {...props} 
      onPointerDown={(e) => {
        e.stopPropagation();
        console.log("Clicked Mesh Name:", e.object.name);
        window.LastClickedMesh = e.object.name; // Keep it accessible globally for subagent
      }}
    />
  );
}

// Preload the model
useGLTF.preload(mataGlbUrl);
