import React from 'react';
import { useGLTF } from '@react-three/drei';
import mataGlbUrl from '../assets/Mata.glb?url';

export function MataModel(props) {
  const { scene } = useGLTF(mataGlbUrl);
  
  // Optional: Center the model or scale it if it's too large/small
  // For now we just render the raw scene.
  return (
    <primitive 
      object={scene} 
      {...props} 
    />
  );
}

// Preload the model
useGLTF.preload(mataGlbUrl);
