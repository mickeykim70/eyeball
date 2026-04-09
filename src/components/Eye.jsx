import React from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// 안구를 완벽하게 정확히 반으로 가르는 클리핑 플레인
// Z좌표가 0보다 큰 쪽(앞쪽) 또는 X를 기준으로 자릅니다.
// 이미지처럼 측면(오른쪽 단면)을 보기 위해 파지티브 X 영역을 잘라냅니다.
const clipPlanes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)];

// 모든 메시에 공통으로 적용할 클리핑 속성 (안구를 반으로 가르기 위함)
const clipProps = {
  clippingPlanes: clipPlanes,
  clipShadows: true,
  side: THREE.DoubleSide, // 잘린 내벽을 렌더링하기 위해 필수
};

export function Eye() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}> {/* 카메라쪽으로 단면이 정면으로 보이게 회전 */}
      
      {/* 1. Sclera (공막/외막) - 가장 바깥쪽의 하얀/크림색 껍질 */}
      {/* 앞쪽(각막 부분)이 뚫려있어야 하므로 점진적으로 잘라냅니다. */}
      {/* 구의 phi 길이를 줄여서 앞을 열어둘 수도 있지만, 여기서는 그냥 온전한 구를 씁니다 */}
      <Sphere args={[2, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.85]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f8f4e6" roughness={0.9} {...clipProps} />
      </Sphere>

      {/* 2. Choroid (맥락막) / Retina (망막) - 중간/안쪽의 두툼한 오렌지/핑크색 막 */}
      {/* 공막보다 살짝 작은 구를 겹쳐 내벽 색상을 만듭니다. */}
      <Sphere args={[1.93, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.80]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#c06040" roughness={0.7} {...clipProps} />
      </Sphere>
      <Sphere args={[1.88, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.80]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff9b71" roughness={0.9} {...clipProps} />
      </Sphere>

      {/* 3. Cornea (각막) - 맨 앞의 투명하게 튀어나온 돔(Dome) */}
      <Sphere args={[1.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35]} position={[0, 0, 1.1]}>
        <meshPhysicalMaterial 
          color="#c4e1f6" 
          transmission={0.8} // 반투명
          roughness={0.1}
          ior={1.4}
          thickness={0.1}
          {...clipProps}
        />
      </Sphere>

      {/* 4. Iris (홍채) 및 Ciliary Body (모양체근) - 갈색/핑크빛의 근육 구조 */}
      {/* 모양체: 수정체 주변을 감싸는 근육 (고리 모양) */}
      <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.2, 32, 64]} />
        <meshStandardMaterial color="#d68b8b" {...clipProps} />
      </mesh>
      
      {/* 홍채: 동공(가운데 구멍)을 남겨두는 얇은 원반 */}
      <mesh position={[0, 0, 1.5]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.3, 1.0, 32]} />
        <meshStandardMaterial color="#8b5a2b" {...clipProps} />
      </mesh>

      {/* 5. Lens (수정체) - 가운데 위치한 연한 파란빛/투명한 타원체 */}
      {/* 나중에 애니메이션(두께 변화)을 주기 매우 쉬운 독립된 요소 */}
      <Sphere args={[0.7, 32, 32]} position={[0, 0, 1.0]} scale={[1, 1, 0.5]}>
        <meshPhysicalMaterial 
          color="#c4e1f6" 
          transmission={0.6}
          roughness={0.2}
          thickness={0.5}
          {...clipProps}
        />
      </Sphere>

      {/* 6. Optic Nerve (시신경) - 안구 뒤쪽으로 빠져나가는 다발 */}
      {/* Sclera 뒤쪽(thetaEnd 무시된 구멍)을 채우며 뒤로 뻗어가는 실린더 */}
      <Cylinder args={[0.3, 0.4, 2.0, 32]} position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#f2e2b3" roughness={0.8} {...clipProps} />
      </Cylinder>
      {/* 시신경 내부의 붉은/푸른 핏줄(동맥/정맥) 심플 묘사 */}
      <Cylinder args={[0.05, 0.05, 2.0, 16]} position={[-0.1, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ff3333" {...clipProps} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 2.0, 16]} position={[0.1, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3333ff" {...clipProps} />
      </Cylinder>
      
    </group>
  );
}
