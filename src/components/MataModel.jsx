import React, { useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import mataGlbUrl from '../assets/Mata.glb?url';

export function MataModel(props) {
  const { scene } = useGLTF(mataGlbUrl);

  useLayoutEffect(() => {
    // 모든 수동 재질 덮어쓰기 로직 제거 (안구 모델 초기화)
    scene.traverse((child) => {
      if (child.isMesh) {
        // Sphere001: 각막 (Cornea - 가장 바깥쪽 투명 덮개)
        // 안쪽 수정체를 볼 수 있도록 완벽한 유리 재질 부여 + depthWrite 차단
        if (child.name === 'Sphere001') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff',
            transmission: 1.0, 
            opacity: 1,
            transparent: true,
            roughness: 0,
            ior: 1.37, // 각막 굴절률
            depthWrite: false, 
          });
        }
        
        // Sphere006: 수정체 (Lens - 각막 안쪽의 실제 렌즈 파츠)
        if (child.name === 'Sphere006') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#c4e1f6',         // 살짝 푸른 빛으로 존재감 부여
            transmission: 0.9,        // 거의 다 투과됨
            opacity: 1,               
            transparent: true,
            roughness: 0,             
            ior: 1.42,                // 수정체 굴절률
            depthWrite: false,        // 렌더링 충돌 방지
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
