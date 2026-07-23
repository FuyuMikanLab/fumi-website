"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";

export default function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Drei 提供的快捷立方体，自带材质 */}
        <Box args={[1, 1, 1]}>
          <meshStandardMaterial color="royalblue" />
        </Box>

        {/* 允许鼠标拖拽旋转 */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
