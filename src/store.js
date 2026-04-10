import { create } from 'zustand';

export const useStore = create((set) => ({
  // 현재 시력 상태 ('emmetropia' | 'myopia' | 'hyperopia' | 'presbyopia')
  visionState: 'emmetropia',

  // 정시 리셋(인트로 애니메이션 재실행) 트리거 토큰
  introTrigger: 0,

  // 상태 변경 액션
  setVisionState: (state) => set({ visionState: state }),

  // 정시 클릭 시 카메라 리셋 액션
  triggerIntroAnimation: () => set((state) => ({
    introTrigger: state.introTrigger + 1,
    visionState: 'emmetropia'
  })),

  // OrbitControls 활성화 여부
  // 인트로 애니메이션 중에는 false → 인트로 완료 후 true 로 전환
  // ⚠️ 반드시 false로 시작해야 함:
  //    IntroCamera가 camera.position을 직접 조작하는 동안
  //    OrbitControls가 동시에 내부 상태를 업데이트하면,
  //    인트로가 끝난 뒤 OrbitControls가 자신이 기억한 위치로 카메라를 snap(회귀)시킴.
  orbitEnabled: false,
  setOrbitEnabled: (enabled) => set({ orbitEnabled: enabled }),
}));
