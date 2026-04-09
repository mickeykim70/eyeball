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
}));
