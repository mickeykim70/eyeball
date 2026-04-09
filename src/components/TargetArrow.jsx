import React, { useMemo } from 'react';
import * as THREE from 'three';

export function TargetArrow(props) {
  // 왼쪽 반 화살표 (빨강)
  const leftShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 2);
    shape.lineTo(0, -2);
    shape.lineTo(-0.4, -2);
    shape.lineTo(-0.4, 0);
    shape.lineTo(-1.0, 0);
    shape.lineTo(0, 2);
    return shape;
  }, []);

  // 오른쪽 반 화살표 (파랑)
  const rightShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 2);
    shape.lineTo(1.0, 0);
    shape.lineTo(0.4, 0);
    shape.lineTo(0.4, -2);
    shape.lineTo(0, -2);
    shape.lineTo(0, 2);
    return shape;
  }, []);

  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };

  return (
    <group {...props}>
      {/* 왼쪽 화살표 */}
      <mesh>
        <extrudeGeometry args={[leftShape, extrudeSettings]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* 오른쪽 화살표 */}
      <mesh>
        <extrudeGeometry args={[rightShape, extrudeSettings]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}
