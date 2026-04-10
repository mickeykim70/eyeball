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
import { useStore } from './store';

function App() {
  const orbitEnabled = useStore((s) => s.orbitEnabled);

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

        {/*
          enabled={orbitEnabled}: 인트로 중 OrbitControls 비활성화 핵심.
          IntroCamera가 camera.position을 직접 조작하는 동안 OrbitControls도
          동시에 내부 상태를 업데이트하면, 인트로 후 마우스 드래그 시
          OrbitControls가 자신이 기억한 위치로 카메라를 snap(회귀)시키는 버그 발생.
          → store의 orbitEnabled가 false(인트로 중) → true(인트로 완료)로 바뀌면
            OrbitControls가 그 시점 카메라 위치를 기준으로 새로 초기화됨.
        */}
        {/*
          target 고정 없음: 우클릭 드래그(pan)로 pivot을 자유롭게 이동 가능.
          고정 target을 지정하면 항상 그 점으로만 줌/회전이 되어 원하는 부위를 확대하기 어려움.
        */}
        <OrbitControls enabled={orbitEnabled} enableDamping={true} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export default App;
