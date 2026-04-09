import { create } from 'zustand';

export const useStore = create((set) => ({
  // 현재 시력 상태 ('emmetropia' | 'myopia' | 'hyperopia' | 'presbyopia')
  visionState: 'emmetropia',
  
  // 상태 변경 액션
  setVisionState: (state) => set({ visionState: state }),
}));
