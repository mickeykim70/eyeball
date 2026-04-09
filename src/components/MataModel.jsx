import React, { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import mataGlbUrl from '../assets/Mata.glb?url';

export function MataModel(props) {
  const { scene } = useGLTF(mataGlbUrl);
  const visionState = useStore((s) => s.visionState);
  
  // 메쉬들의 원본 Z좌표 및 스케일을 기억하기 위한 Ref
  const originalZ = useRef({});

  useLayoutEffect(() => {
    // 모든 수동 재질 덮어쓰기 및 초기값 백업
    scene.traverse((child) => {
      if (child.isMesh) {
        // 원본 Z축 위치와 스케일을 기억 (최초 1회)
        if (originalZ.current[child.name] === undefined) {
           originalZ.current[child.name] = {
              pos: child.position.z,
              scale: child.scale.z
           };
        }

        // Sphere001: 각막 (Cornea)
        if (child.name === 'Sphere001') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff', transmission: 1.0, opacity: 1, transparent: true,
            roughness: 0, ior: 1.37, depthWrite: false, 
          });
        }
        
        // Sphere006: 수정체 (Lens)
        if (child.name === 'Sphere006') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#c4e1f6', transmission: 0.9, opacity: 1, transparent: true,
            roughness: 0, ior: 1.42, depthWrite: false,
          });
        }
      }
    });
  }, [scene]);

  // 매 프레임마다 안구(망막/공막)의 길이를 물리적으로 애니메이션 처리
  useFrame(() => {
    // 상태별 변형 타겟값 
    // 안구 모델이 Y축 회전(-90도)되어 있으므로: Local -Z 방향이 곧 World +X (뒤통수 방향)
    // 안축이 길어질 때 앞쪽이 투명렌즈를 뚫고 나오지 못하도록 position.z를 음수로 보상 이동시킴.
    let targetScaleZ = 1.0;
    let targetOffsetZ = 0.0;
    
    if (visionState === 'myopia') {
       targetScaleZ = 1.08; 
       targetOffsetZ = -0.05; // 뒤쪽으로 길어짐
    } else if (visionState === 'hyperopia') {
       targetScaleZ = 0.90;
       targetOffsetZ = 0.05; // 원시: 앞으로 당겨지며 짧아짐
    }

    scene.traverse((child) => {
      // 렌즈와 각막은 굴절에만 관여하므로 형태를 고정하고 나머지 안구 껍질만 변형
      if (child.isMesh && child.name !== 'Sphere001' && child.name !== 'Sphere006') {
         const orig = originalZ.current[child.name];
         if (orig) {
            const targetPos = orig.pos + targetOffsetZ;
            const targetScale = orig.scale * targetScaleZ;
            
            // 자연스럽고 부드럽게 변형(Lerp)
            child.scale.z = THREE.MathUtils.lerp(child.scale.z, targetScale, 0.05);
            child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos, 0.05);
         }
      }
    });
  });

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
