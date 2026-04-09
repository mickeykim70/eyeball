import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { TargetArrow } from './TargetArrow';

export function LightRays() {
  // 선의 재질 설정: 얇고 연녹색 형광, 눈 모델 내부를 투과해서 보이도록 depthTest 비활성화
  // 선의 재질 설정: 더 얇고 날렵한 형광 연녹색(레이저 빔 느낌)
  const materialProps = {
    color: '#39ff14', 
    lineWidth: 1.5,   // 선 두께 얇게 미세조정
    transparent: true,
    opacity: 0.65,
    depthTest: false, // 렌더링을 뚫고 보여야 함
  };

  // 5가닥의 입체 광선 (화살표의 십자가 끝점들: 정중앙, 상단, 하단, 좌측, 우측)
  // Arrow 컴포넌트의 Extrude 깊이와 회전(-90도)을 계산한 정확한 출발점(x: -3.96)
  const rayCoordinates = [
    { id: 'center', y: 0, z: 0 },
    { id: 'top', y: 0.4, z: 0 },
    { id: 'bottom', y: -0.4, z: 0 },
    { id: 'front_tip', y: 0, z: 0.2 },   // 화면 앞으로 튀어나온 화살표 끝
    { id: 'back_tip', y: 0, z: -0.2 },   // 화면 뒤로 들어간 화살표 끝
  ];

  const rays = rayCoordinates.map((coord) => [
    new THREE.Vector3(-3.96, coord.y, coord.z),       // 출발지 (3D 화살표의 각 꼭짓점)
    new THREE.Vector3(3.25, coord.y, coord.z),        // 수정체 표면 도달 (평행 광선)
    // 회원님의 말씀이 정확합니다! 초점은 안구 안에서 교차해서 퍼지는 것이 아니라, 
    // 평행광선은 정확히 하나의 초점(망막)에 떨어져야 합니다. (물리적 모델링)
    new THREE.Vector3(5.4, 0, 0),       
  ]);

  return (
    <group>
      {rays.map((ray, idx) => (
        <Line key={idx} points={ray} {...materialProps} />
      ))}

      {/* 정시(Emmetropia)망막에 맺히는 상(Inverted Image) */}
      <TargetArrow 
        position={[5.40, 0, 0]} 
        scale={0.12} // 시각적 효과를 위해 상을 조금 더 크게 확대
        // X축을 기준으로 180도 회전(Math.PI)시킴으로써 상하좌우가 모두 뒤집힌 완벽한 물리학적 역상을 생성
        rotation={[Math.PI, -Math.PI / 2, 0]} 
      />
    </group>
  );
}
