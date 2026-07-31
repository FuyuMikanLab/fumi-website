"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type TransparentVideoProps = {
  src: string;
  /** 轻微放大裁黑边，默认 1.02 */
  cropScale?: number;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uInset;
  varying vec2 vUv;

  void main() {
    float inset = uInset;
    vec2 uv = mix(vec2(inset), vec2(1.0 - inset), vUv);

    vec2 rgbUv = vec2(uv.x * 0.5, uv.y);
    vec2 alphaUv = vec2(uv.x * 0.5 + 0.5, uv.y);

    vec3 rgb = texture2D(uTexture, rgbUv).rgb;
    float alpha = texture2D(uTexture, alphaUv).r;

    gl_FragColor = vec4(rgb, alpha);
  }
`;

/**
 * 左右分屏透明视频平面，挂在 PostPipeline 场景内。
 * 与后处理插片、后续 3D 模型共享同一 Canvas。
 */
export function TransparentVideo({
  src,
  cropScale = 1.02,
}: TransparentVideoProps) {
  const { viewport } = useThree();
  const [video] = useState(() => {
    const el = document.createElement("video");
    el.crossOrigin = "anonymous";
    el.playsInline = true;
    el.muted = true;
    el.loop = true;
    el.preload = "auto";
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    return el;
  });

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [video]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uInset: { value: 0.004 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [texture],
  );

  useEffect(() => {
    video.src = src;
    video.load();

    const tryPlay = () => {
      video.play().catch(() => {});
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [video, src]);

  useEffect(() => {
    return () => {
      texture.dispose();
      material.dispose();
    };
  }, [texture, material]);

  useFrame(() => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      texture.needsUpdate = true;
    }
  });

  const w = viewport.width * cropScale;
  const h = viewport.height * cropScale;

  return (
    <mesh scale={[w, h, 1]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
