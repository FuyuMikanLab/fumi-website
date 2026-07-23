"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface TransparentVideoProps {
  src: string;
  width?: number;
  height?: number;
  className?: string;
}

export const TransparentVideo: React.FC<TransparentVideoProps> = ({
  src,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // WebGL texImage2D 要求跨域视频以 CORS 方式加载；必须在 src 生效前设置
    video.crossOrigin = "anonymous";
    if (video.getAttribute("src") !== src) {
      video.src = src;
    }
    video.load();

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    let lastWidth = 0;
    let lastHeight = 0;
    let resizeTimer: number | null = null;
    let resizeRaf = 0;

    const applySize = () => {
      const width = Math.round(container.clientWidth);
      const height = Math.round(container.clientHeight);
      if (width === 0 || height === 0) return;
      // 尺寸未变时跳过，避免拖动/滚动时无意义 setSize 导致闪烁
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height, false);
    };

    const resize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      // 防抖：拖动窗口停稳后再改 drawing buffer
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(applySize);
      }, 240);
    };

    applySize();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: videoTexture },
        // 内缩采样，避开左右分屏接缝与编码黑边
        uInset: { value: 0.004 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
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
      `,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay may be blocked until a user gesture; muted+playsInline usually works.
      });
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    let animationFrameId = 0;
    const render = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        videoTexture.needsUpdate = true;
        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(resizeRaf);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      observer.disconnect();
      video.removeEventListener("canplay", tryPlay);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* 轻微放大裁掉外围黑边 */}
      <div ref={containerRef} className="h-full w-full origin-center scale-[1.02]" />

      <video
        ref={videoRef}
        crossOrigin="anonymous"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
    </div>
  );
};
