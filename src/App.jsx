import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { Eye } from './components/Eye';
import { MataModel } from './components/MataModel';
import { TargetArrow } from './components/TargetArrow';
import { IntroCamera } from './components/IntroCamera';
import { UI } from './components/UI';
import { LightRays } from './components/LightRays';
import { TVScreen } from './components/TVScreen';

function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#e2e8f0' }}> {/* 조금 더 밝은 배경(의료 차트 느낌) */}
      
      {/* UI 오버레이 (현재 상태 표시) */}
      <UI />
      
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} gl={{ localClippingEnabled: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        
        {/* 새롭게 띄우는 실제 3D 모델 및 목표물 화살표 */}
        <Suspense fallback={null}>
          <group position={[-0.8, 0, 0]}>
            {/* 안구 모델 자체 메쉬 중심이 원래부터 위쪽(y: +0.17)에 치우쳐 있어, 모델을 약간 아래로 내려 빛과 센터를 정렬합니다. */}
            <MataModel position={[4, -0.17, 0]} rotation={[0, -Math.PI / 2, 0]} />
            
            {/* 화살표를 더 왼쪽으로 이동 (X: -4)하여 간격을 넓히고 크기를 절반(0.4 -> 0.2)으로 줄임 */}
            <TargetArrow position={[-4, 0, 0]} scale={0.2} rotation={[0, -Math.PI / 2, 0]} />

            {/* 광학 회로도 (형광빔) 및 거리 표시 */}
            <LightRays />
            <Text 
              position={[-1, 1.2, 0]} 
              fontSize={0.6} 
              color="#475569" 
              fontWeight="bold"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
              5m (원거리)
            </Text>

            {/* 망막 위에 떠 있는 TV 화면 (좌우 반전 및 포커스 상태 시각화) */}
            <TVScreen />
          </group>

          {/* 로딩 완료 후 부드럽게 줌인하는 멋진 인트로 효과 */}
          <IntroCamera />
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
