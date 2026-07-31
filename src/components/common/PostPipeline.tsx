"use client";

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import type { Pass } from "three/addons/postprocessing/Pass.js";

type PipelineApi = {
  composer: EffectComposer;
  /** 在 RenderPass 之后按顺序插入插片；同 id 会先移除再加 */
  addPass: (id: string, pass: Pass) => void;
  removePass: (id: string) => void;
};

const PostPipelineContext = createContext<PipelineApi | null>(null);

export function usePostPipeline() {
  const ctx = useContext(PostPipelineContext);
  if (!ctx) {
    throw new Error("usePostPipeline 必须在 <PostPipeline> 内使用");
  }
  return ctx;
}

/** 标记后处理插片槽；子节点应是返回 null 的 Pass 组件（如 BlackGauze） */
function Effects({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
Effects.displayName = "PostPipeline.Effects";

type PostPipelineProps = {
  children?: ReactNode;
  className?: string;
  /** 透视相机，方便后续加模型；默认拉远一点铺满视频平面 */
  camera?: {
    position?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
  };
};

function ComposerHost({ effectChildren }: { effectChildren: ReactNode }) {
  const { gl, scene, camera, size } = useThree();
  const [api, setApi] = useState<PipelineApi | null>(null);
  const passesRef = useRef<Map<string, Pass>>(new Map());

  useLayoutEffect(() => {
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    gl.setPixelRatio(pixelRatio);
    gl.setClearColor(0x000000, 0);

    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(size.width * pixelRatio)),
      Math.max(1, Math.floor(size.height * pixelRatio)),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        stencilBuffer: false,
      },
    );
    rt.texture.colorSpace = THREE.SRGBColorSpace;

    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(pixelRatio);

    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = true;
    renderPass.clearDepth = true;
    (renderPass as RenderPass & { clearAlpha: number }).clearAlpha = 0;
    composer.addPass(renderPass);

    const syncRenderToScreen = () => {
      composer.passes.forEach((p, i) => {
        p.renderToScreen = i === composer.passes.length - 1;
      });
    };

    const addPass = (id: string, pass: Pass) => {
      const prev = passesRef.current.get(id);
      if (prev) {
        composer.removePass(prev);
        passesRef.current.delete(id);
      }
      passesRef.current.set(id, pass);
      composer.addPass(pass);
      syncRenderToScreen();
    };

    const removePass = (id: string) => {
      const pass = passesRef.current.get(id);
      if (!pass) return;
      composer.removePass(pass);
      passesRef.current.delete(id);
      syncRenderToScreen();
    };

    setApi({ composer, addPass, removePass });

    return () => {
      passesRef.current.clear();
      composer.dispose();
      rt.dispose();
      setApi(null);
    };
    // 仅挂载时建 composer；尺寸变化走 setSize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useLayoutEffect(() => {
    if (!api) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    api.composer.setPixelRatio(pixelRatio);
    api.composer.setSize(size.width, size.height);
  }, [api, size.width, size.height]);

  useFrame((_, delta) => {
    api?.composer.render(delta);
  }, 1);

  if (!api) return null;

  return (
    <PostPipelineContext.Provider value={api}>
      {effectChildren}
    </PostPipelineContext.Provider>
  );
}

/**
 * 共享 WebGL 场景 + 后处理链。
 *
 * @example
 * <PostPipeline className="h-full w-full">
 *   <TransparentVideo src="..." />
 *   <MyModel />
 *   <PostPipeline.Effects>
 *     <BlackGauze />
 *   </PostPipeline.Effects>
 * </PostPipeline>
 */
export function PostPipeline({
  children,
  className = "",
  camera = { position: [0, 0, 5], fov: 50, near: 0.1, far: 100 },
}: PostPipelineProps) {
  const { sceneChildren, effectChildren } = useMemo(() => {
    const scene: ReactNode[] = [];
    const effects: ReactNode[] = [];

    Children.forEach(children, (child) => {
      if (
        isValidElement(child) &&
        (child.type === Effects ||
          (typeof child.type === "function" &&
            (child.type as { displayName?: string }).displayName ===
              "PostPipeline.Effects"))
      ) {
        effects.push(child);
      } else {
        scene.push(child);
      }
    });

    return { sceneChildren: scene, effectChildren: effects };
  }, [children]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Canvas
        className="!absolute inset-0 h-full w-full"
        camera={camera}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {sceneChildren}
        <ComposerHost effectChildren={effectChildren} />
      </Canvas>
    </div>
  );
}

PostPipeline.Effects = Effects;
