import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds } from '@react-three/drei';
import { Eye } from './components/Eye';
import { MataModel } from './components/MataModel';
import { TargetArrow } from './components/TargetArrow';
import { UI } from './components/UI';

function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#e2e8f0' }}> {/* 조금 더 밝은 배경(의료 차트 느낌) */}
      
      {/* UI 오버레이 (현재 상태 표시) */}
      <UI />
      
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ localClippingEnabled: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        
        {/* 새롭게 띄우는 실제 3D 모델 및 목표물 화살표 */}
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            {/* 눈을 더 오른쪽으로 이동 (X: 4) */}
            <MataModel position={[4, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
            
            {/* 화살표를 더 왼쪽으로 이동 (X: -4)하여 간격을 넓히고 크기를 절반(0.4 -> 0.2)으로 줄임 */}
            <TargetArrow position={[-4, 0, 0]} scale={0.2} rotation={[0, -Math.PI / 2, 0]} />
          </Bounds>
        </Suspense>
        
        {/* 기존 모형은 주석 처리 */}
        {/* <Eye /> */}
        
        <OrbitControls enableDamping={true} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export default App;
