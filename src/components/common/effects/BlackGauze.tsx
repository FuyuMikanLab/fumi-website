"use client";

import { useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { BlackGauzeShader } from "@/src/utils/shader/blackGauzeShader";
import { usePostPipeline } from "@/src/components/common/PostPipeline";

type BlackGauzeProps = {
  /** 网格密度：约等于每 1000 设备像素的周期数，越大越密 */
  scale?: number;
  /** 纱线遮挡强度 0–1 */
  opacity?: number;
  /** 高光柔光强度 */
  bloomIntensity?: number;
};

/**
 * 黑纱后处理插片 —— 必须放在 <PostPipeline.Effects> 内。
 *
 * @example
 * <PostPipeline.Effects>
 *   <BlackGauze scale={200} opacity={0.15} bloomIntensity={0.4} />
 * </PostPipeline.Effects>
 */
export function BlackGauze({
  scale = 200,
  opacity = 0.15,
  bloomIntensity = 0.4,
}: BlackGauzeProps) {
  const { addPass, removePass } = usePostPipeline();
  const { size, viewport } = useThree();
  const passRef = useRef<ShaderPass | null>(null);

  useLayoutEffect(() => {
    const pass = new ShaderPass(BlackGauzeShader);
    passRef.current = pass;
    addPass("black-gauze", pass);
    return () => {
      removePass("black-gauze");
      passRef.current = null;
    };
  }, [addPass, removePass]);

  useLayoutEffect(() => {
    const pass = passRef.current;
    if (!pass) return;
    const u = pass.uniforms;
    u.uGauzeScale.value = scale;
    u.uGauzeOpacity.value = opacity;
    u.uBloomIntensity.value = bloomIntensity;
    // drawing buffer 像素尺寸（含 dpr）
    const dpr = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio : 1,
      2,
    );
    u.uResolution.value.set(
      Math.max(1, Math.round(size.width * dpr)),
      Math.max(1, Math.round(size.height * dpr)),
    );
  }, [scale, opacity, bloomIntensity, size.width, size.height, viewport.dpr]);

  return null;
}
