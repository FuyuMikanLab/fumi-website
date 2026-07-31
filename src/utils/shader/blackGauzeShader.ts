import * as THREE from "three";

/** 黑纱后处理插片：输入 tDiffuse（上一遍 RT），输出加网 + 柔光 */
export const BlackGauzeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uGauzeScale: { value: 200.0 }, // 网格密度：约每 1000 设备像素的周期数
    uGauzeOpacity: { value: 0.15 }, // 网格明显程度 (暗部遮挡)
    uBloomIntensity: { value: 0.4 }, // 柔光/高光晕染强度
    uResolution: { value: new THREE.Vector2(1, 1) },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uGauzeScale;
    uniform float uGauzeOpacity;
    uniform float uBloomIntensity;
    uniform vec2 uResolution;

    varying vec2 vUv;

    // 简单采样模拟高光晕染 (Bloom/Blur)
    vec4 getBlurredColor(vec2 uv) {
      vec4 col = vec4(0.0);
      vec2 texel = 1.0 / uResolution;
      
      // 9点十字/正方形采样模拟镜头柔光扩散
      float off[5] = float[](0.0, 1.5, 3.0, 4.5, 6.0);
      float weight[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

      col += texture2D(tDiffuse, uv) * weight[0];
      for (int i = 1; i < 5; i++) {
        col += texture2D(tDiffuse, uv + vec2(off[i] * texel.x, 0.0)) * weight[i];
        col += texture2D(tDiffuse, uv - vec2(off[i] * texel.x, 0.0)) * weight[i];
        col += texture2D(tDiffuse, uv + vec2(0.0, off[i] * texel.y)) * weight[i];
        col += texture2D(tDiffuse, uv - vec2(0.0, off[i] * texel.y)) * weight[i];
      }
      return col;
    }

    void main() {
      // 1. 采样原图
      vec4 baseColor = texture2D(tDiffuse, vUv);

      // 2. 模拟黑纱网格纹理 (编织交叉网格)
      // 按像素坐标铺网：窗口变大时格子物理间距保持大致稳定，避免 UV 铺网在大屏被抹成一层灰
      // uGauzeScale ≈ 每 1000 设备像素的周期数（越大越密）
      vec2 px = vUv * uResolution;
      float freq = uGauzeScale * 3.14159 / 1000.0;
      float gridX = abs(sin(px.x * freq));
      float gridY = abs(sin(px.y * freq));

      // 纱线宽度（相对半周期）；越小线越细、网孔越大
      float lineWidth = 0.22;
      float lineX = smoothstep(0.0, lineWidth, gridX);
      float lineY = smoothstep(0.0, lineWidth, gridY);
      // 任一方向靠近纱线则变暗
      float netPattern = min(lineX, lineY);
      float gauzeMask = mix(1.0 - uGauzeOpacity, 1.0, netPattern);

      // 3. 计算高光柔焦 (提取亮部并叠加)
      vec4 blurColor = getBlurredColor(vUv);
      // 仅亮部更容易产生晕染（阈值提取）
      float brightness = max(blurColor.r, max(blurColor.g, blurColor.b));
      float bloomFactor = smoothstep(0.5, 0.9, brightness) * uBloomIntensity;

      // 4. 合成：原图 * 纱网掩码 + 高光晕染
      vec3 finalColor = baseColor.rgb * gauzeMask + (blurColor.rgb * bloomFactor);

      // 5. 降低暗部对比度（黑纱物理特性：黑纱自身散射会让暗部发灰）
      finalColor += vec3(0.02);

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `,
};
